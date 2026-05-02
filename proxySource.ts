import path from 'node:path'
import { Client, PacketWriter, Server, type ServerConnection, State } from '@lilithmod/unborn-mcproto'
import { FetchResultTypes, fetch } from '@sapphire/fetch'
import chalk from 'chalk'
import prismarineAuth from 'prismarine-auth'
import { ChatMessage, MessageBuilder } from 'prismarine-chat'
import yggdrasil from 'yggdrasil'
import config from '@/config.js'
import { lilithFolder } from '@/constants.js'
import log, { lc } from '@/log.js'
import { deserialize } from '@/packets/deserialize.js'
import store, { clearAuthentication, deleteStoreAuthentication, updateStore } from '@/store.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, serverConnectionPacket } from '@/types/packets/minecraft/packets.js'
import { type Connection, type PacketSource, TypedEventEmitter } from '@/types/sources.js'
import { ChatPosition } from '@/utils/chat.js'
import { copyToClipboard } from '@/utils/clipboard'
import { isStreamerMode, permission } from '@/utils/permissions.js'
import { dashedUUID } from '@/utils/strings'
import resolveUsername from '../utils/resolveUsername'

const ygg = yggdrasil()

const { Authflow, Titles } = prismarineAuth

let { localIp, localPort, remoteIp, remotePort } = config().general.proxy

if (!permission('lilith.remote_host')) {
	remoteIp = 'mc.hypixel.net'
	remotePort = 25565
}

// let pingResponse: PingResponse | undefined = undefined
// pingIp.promise.probe(remoteIp === 'mc.hypixel.net' ? 'hypixel.net' : remoteIp, {
//     extra: ['-n', '1']
// }).then(res => {
//     if (res == null || res.time === 'unknown') {
//         return console.log('Failed to ping remote server')
//     }
//     pingResponse = res
// })

if (!permission('lilith.local_host')) localIp = '127.0.0.1'
if (!permission('lilith.local_port')) localPort = 25565

async function title(client: ServerConnection, message: string, position = 0) {
	await client.send(
		new PacketWriter(0x45)
			.writeVarInt(position)
			.writeString(JSON.stringify(MessageBuilder.fromString(message, { colorSeparator: '&' }).toJSON())),
	)
}

async function titleJson(client: ServerConnection, message: any, position = 0) {
	await client.send(new PacketWriter(0x45).writeVarInt(position).writeString(JSON.stringify(message)))
}

async function chat(client: ServerConnection, message: string, position: ChatPosition = ChatPosition.System) {
	if (isStreamerMode()) {
		Lilith.msg(new ChatMessage(MessageBuilder.fromString(message, { colorSeparator: '&' })).toAnsi())
	} else {
		await chatJson(client, MessageBuilder.fromString(message, { colorSeparator: '&' }).toJSON(), position)
	}
}

async function chatJson(client: ServerConnection, message: any, position: ChatPosition = ChatPosition.System) {
	if (isStreamerMode()) {
		Lilith.msg(new ChatMessage(message).toAnsi())
	} else {
		await client.send(new PacketWriter(0x02).writeString(JSON.stringify(message)).writeInt8(position))
	}
}

async function end(client: ServerConnection, message: string) {
	await endJson(client, MessageBuilder.fromString(message, { colorSeparator: '&' }).toJSON())
}

async function endJson(client: ServerConnection, message: any) {
	await client.send(new PacketWriter(0x40).writeString(JSON.stringify(message)))
}

const authDataCache = new Map<
	string,
	{
		token: string
		entitlements: prismarineAuth.MinecraftJavaEntitlements
		profile: prismarineAuth.MinecraftJavaProfile
		certificates: prismarineAuth.MinecraftJavaCertificates
	}
>()

export const proxySource: PacketSource = {
	listen: (status, connected) => {
		new Server(
			{
				generateKeyPair: true,
			},
			async (client: ServerConnection) => {
				const connection: Connection = new TypedEventEmitter() as Connection

				connection.ended = false
				Object.defineProperty(connection, 'state', {
					get() {
						return client.state
					},
				})

				connection.onPacketServerbound = (id, handler) => {
					return client.onPacket(id, handler)
				}
				connection.oncePacketServerbound = (id, handler) => {
					return client.oncePacket(id, handler)
				}
				connection.nextPacketServerbound = (id, expectNext) => {
					return client.nextPacket(id, expectNext)
				}
				connection.sendClientbound = async (packet) => {
					await client.send(packet)
				}

				connection.end = client.end

				client.on('error', (error) => {
					connection.emit('errorServerbound', error)
				})
				const tempEndHandler = () => {
					clearInterval(keepAlive)
					connection.ended = true
					connection.emit('endServerbound')
					connection.emit('end')
				}
				client.on('end', tempEndHandler)

				let keepAlive: NodeJS.Timeout

				// Handshaking packet and then pause the connecting client while we get the remote client ready
				const handshaking = await client.nextPacket(0x0)
				const protocol = handshaking.readVarInt()
				const connectingHost = handshaking.readString()
				const connectingPort = handshaking.readUInt16()
				const handshakingState = handshaking.readVarInt()

				client.onPacket(0x0, async (packet) => {
					if (handshakingState !== State.Status) return
					const pingClient = await Client.connect(remoteIp, remotePort)

					await pingClient.send(
						new PacketWriter(0x0)
							.writeVarInt(protocol)
							.writeString(remoteIp)
							.writeUInt16(remotePort)
							.writeVarInt(State.Status),
					)

					await pingClient.send(new PacketWriter(0x0))
					await pingClient.send(new PacketWriter(0x1).writeInt64(BigInt(4490283409823)))

					const pingPacket = await pingClient.nextPacket(0x0, false)
					// sending status packet and it's a FUNCTION! it's not static (i think?) isnt that so cool
					await client.send(new PacketWriter(0x0).writeString(JSON.stringify(await status(pingPacket.readJSON()))))
				})

				client.onPacket(0x1, async (packet) => {
					if (handshakingState !== State.Status) return
					// if (pingResponse != null && typeof pingResponse.time === 'number') {
					//     // Lilith.log.debug(pingResponse.time)
					//     await wait(pingResponse.time * 0.6)
					// }
					await client.send(new PacketWriter(0x1).writeInt64(packet.readInt64()))
				})

				if (handshakingState === State.Login) {
					const secondPacket = await client.nextPacket(0x0)

					connection.username = secondPacket.readString()
					log.raw(
						`${lc.purple('Local')} ${lc.black('»')} ${chalk.white(`${chalk.bold(connection.username)} is logging in from ${chalk.bold(`${connectingHost}:${connectingPort}`)}`)} using Lilith's proxy`,
						'LOCAL',
					)
					const uuidObject = await resolveUsername(null, connection.username, false, true)
					if (!uuidObject) {
						log.raw(
							`${lc.red('Error')} ${lc.black('»')} ${chalk.white('Mojang error, please try again in 1 minute.')}`,
							'LOCAL',
						)
						process.exit(0)
					}

					connection.uuid = dashedUUID(uuidObject.id)
					connection.uuidShort = uuidObject.id

					// FIXES NO SKINS IN TABLIST
					await client.encrypt(connection.username, false)

					await client.send(new PacketWriter(0x2).writeString(connection.uuid).writeString(connection.username))

					const commandHandler = async (packet) => {
						if (packet.id !== 0x01) return
						const message = packet.readString()
						if (message === '/resetauth' || message === '/lresetauth') {
							await clearAuthentication(true)
							await end(client, '&cAuthentication for all accounts has been reset. Please rejoin!')
						} else if (message === '/fix' || message === '/lfix') {
							await deleteStoreAuthentication(connection.uuid)
							await end(client, '§cYour authentication has been reset. Please rejoin!')
						} else if (message.startsWith('/copy ')) {
							const copy = message.substring(6)
							const response = copyToClipboard(copy)
							if (response === 'success') {
								await chat(client, `&aCopied &e${copy} &ato clipboard!`)
							} else {
								await chat(client, `&cFailed to copy to clipboard: ${response}`)
							}
						}
					}
					client.on('packet', commandHandler)

					// Log them in

					if (!isStreamerMode()) {
						await client.send(
							new PacketWriter(Ids.Play.toClient.login)
								.writeInt32(1)
								.writeUInt8(0)
								.writeInt8(0)
								.writeUInt8(1)
								.writeUInt8(20)
								.writeString('default')
								.writeBool(false),
						)
						await client.send(
							new PacketWriter(0x8)
								.writeDouble(0)
								.writeDouble(0)
								.writeDouble(0)
								.writeFloat(0)
								.writeFloat(0)
								.writeInt8(0),
						)
						await client.send(new PacketWriter(0x45).writeVarInt(4))
						await title(client, '&bLogging in...')
						// await chat(client, '&7Try &cLilith Reborn &7today to skip this step!')
						keepAlive = setInterval(() => {
							client.send(new PacketWriter(0x0).writeVarInt(10000))
						}, 10000)
					}

					// Get the auth data from the player:
					let authData: any

					if (authDataCache.has(connection.username)) {
						// Lilith.msg('Using cached auth data')
						authData = authDataCache.get(connection.username)!
						Lilith.log.debug(authData)
						const profileInformationResponse = await fetch(
							'https://api.minecraftservices.com/minecraft/profile',
							{
								headers: {
									Authorization: `Bearer ${authData.token}`,
								},
							},
							FetchResultTypes.Result,
						)
						Lilith.log.debug(await profileInformationResponse.json())
						if (profileInformationResponse.status !== 200) {
							authDataCache.delete(connection.username)
							authData = undefined
						}
					}

					while (authData === undefined) {
						if (
							store().authentication[connection.uuid] != null &&
							store().authentication[connection.uuid].email !== '' &&
							store().authentication[connection.uuid].password !== ''
						) {
							await deleteStoreAuthentication(connection.uuid)
							continue
						}

						await chat(
							client,
							`&bMicrosoft &8> &7Attempting to authenticate with the Microsoft account for &f${connection.username}&7...`,
						)

						// const options: any = store().authentication[connection.uuid] != null && store().authentication[connection.uuid].password !== '' ? {
						//     authTitle: false,
						//     password: store().authentication[connection.uuid].password,
						//     flow: 'sisu'
						// } : {authTitle: Titles.MinecraftNintendoSwitch, deviceType: 'Nintendo', flow: 'sisu'}
						try {
							const flow = new Authflow(
								connection.uuid,
								path.join(lilithFolder, 'auth', connection.uuid.substr(0, 8)),
								{
									authTitle: Titles.MinecraftNintendoSwitch,
									deviceType: 'Nintendo',
									flow: 'live',
								},
								(response) => {
									Lilith.log.trace(response)

									const message1 = [
										'',
										{ text: 'Microsoft ', color: 'aqua' },
										{
											text: '> ',
											color: 'dark_gray',
										},
										{ text: 'Go to ', color: 'gray' },
										{
											text: `https://microsoft.com/link?otc=${response.user_code}`,
											clickEvent: {
												action: 'open_url',
												value: `https://microsoft.com/link?otc=${response.user_code}`,
											},
										},
									]
									console.log(
										lc.aqua('Microsoft') +
											lc.black(' » ') +
											lc.default(
												`Please go to https://microsoft.com/link and enter the code ${lc.aqua(
													response.user_code,
												)}. Then sign into the Microsoft account you use for ${lc.aqua(connection.username)}.`,
											),
									)
									if (!isStreamerMode()) chatJson(client, message1)
									const message2 = [
										'',
										{
											text: 'Press next and sign in to the account you use for ',
											color: 'gray',
										},
										{
											text: connection.username,
											color: 'white',
										},
										{ text: '.', color: 'gray' },
									]

									if (!isStreamerMode()) chatJson(client, message2)

									const message3 = [
										'',
										{
											text: 'Your account details stay secure and on device. ',
											color: 'gray',
										},
									]

									if (!isStreamerMode()) chatJson(client, message3)
								},
							)
							const res = await flow.getMinecraftJavaToken({ fetchEntitlements: true, fetchProfile: true })

							if (!res.profile || (res.profile as any).error) {
								if (res.profile) Lilith.msg((res.profile as any)?.error)
								Lilith.msg(
									lc.aqua('Microsoft') +
										lc.black(' » ') +
										lc.default('Failed to obtain profile, does that account own Minecraft?'),
								)
								if (!isStreamerMode())
									await chat(
										client,
										'&cFailed to obtain profile, does that account own Minecraft? Try using a different Microsoft account OR use Incognito mode on your browser to log in.',
									)
								await deleteStoreAuthentication(connection.uuid)
								await clearAuthentication(false)
							} else if ((res.profile as any).name !== connection.username) {
								Lilith.msg(
									lc.aqua('Microsoft') +
										lc.black(' » ') +
										lc.default(
											`Mismatched Minecraft usernames! This Microsoft account is associated with the Minecraft account ${lc.aqua(
												(res.profile as any).name,
											)} and not ${lc.aqua(connection.username)}. Please sign in with the account that matches.`,
										),
								)
								if (!isStreamerMode()) await chat(client, '&cMismatched Minecraft usernames!')
								if (!isStreamerMode())
									await chat(
										client,
										`&cThis Microsoft account is associated with the Minecraft account &7${
											(res.profile as any).name
										}&c and not &7${connection.username}&c.`,
									)
								if (!isStreamerMode()) await chat(client, '&cPlease sign in with the account that matches.')
								await deleteStoreAuthentication(connection.uuid)
								await clearAuthentication(false)
							} else {
								Lilith.log.trace(res.profile)
								authData = res
								const authentication = {}
								authentication[connection.uuid] = {
									email: '',
									password:
										store().authentication[connection.uuid] != null &&
										store().authentication[connection.uuid].password !== ''
											? store().authentication[connection.uuid].password
											: '',
								}
								await updateStore({ authentication })
							}
						} catch (err) {
							Lilith.error(err)
							await deleteStoreAuthentication(connection.uuid)
						}
					}
					Lilith.log.trace(authData.token)
					connection.authData = authData
					await chat(client, '&cLilith &8> &7Logging into Hypixel...')
					clearInterval(keepAlive)

					// Connect to the remote server
					if (connection.ended) return

					const targetClient = await Client.connect(remoteIp, remotePort, {
						accessToken: authData.token,
						profile: authData.profile.id,
					})
					connection.onPacketClientbound = (id, handler) => {
						return targetClient.onPacket(id, handler)
					}
					connection.oncePacketClientbound = (id, handler) => {
						return targetClient.oncePacket(id, handler)
					}
					connection.nextPacketClientbound = (id, expectNext) => {
						return targetClient.nextPacket(id, expectNext)
					}
					connection.sendServerbound = async (packet) => {
						await targetClient.send(packet)
					}

					targetClient.on('error', (error) => {
						if (error.message === 'Invalid access token') {
							deleteStoreAuthentication(connection.uuid)
							authDataCache.delete(connection.username)
							end(client, '&cWoah, something went wrong while connecting. Please rejoin.')
							// targetClient.end()
							return true
						}
						Lilith.log.error(error)
						connection.emit('errorClientbound', error)
					})
					client.off('end', tempEndHandler)
					client.on('end', () => {
						if (!connection.ended) {
							connection.ended = true
							connection.emit('endServerbound')
							connection.emit('end')
							targetClient.end()
						}
					})
					targetClient.on('end', () => {
						if (!connection.ended) {
							connection.ended = true
							connection.emit('endClientbound')
							connection.emit('end')
							client.end()
						}
					})

					// handshaking packet with remote server
					await targetClient.send(
						new PacketWriter(0x0)
							.writeVarInt(protocol)
							.writeString(remoteIp)
							.writeUInt16(remotePort)
							.writeVarInt(State.Login),
					)

					// Start login to remote server
					await targetClient.send(secondPacket)
					// wait until login is successful (@lilithmod/unborn-mcproto handles all the rest)
					await targetClient.nextPacket(0x2, false)

					log.raw(
						`${chalk.hex('#c861ff')('Remote')} ${lc.black('»')} ${chalk.white('Connected via proxy')}`,
						'REMOTE',
					)
					authDataCache.set(connection.username, authData)
					Lilith.log.trace(authData)
					const loginPacket = await targetClient.nextPacket(0x1, false)
					const login: Play.toClient.LoginPacket = deserialize(
						'minecraft',
						'toClient',
						loginPacket,
					) as Play.toClient.LoginPacket

					await client.send(loginPacket)
					await client.send(new PacketWriter(0x45).writeVarInt(4))

					Lilith.log.success('logged in!')
					client.off('packet', commandHandler)

					connection.serverID = targetClient.getServerID()

					if (!isStreamerMode()) {
						const dimension = login.data.dimension === 0 ? -1 : 0
						await serverConnectionPacket<Play.toClient.RespawnPacket>(client, 'toClient', {
							metadata: {
								name: 'respawn',
								state: 'play',
								id: Ids.Play.toClient.respawn,
							},
							data: {
								dimension,
								difficulty: login.data.difficulty,
								gamemode: login.data.gameMode,
								levelType: login.data.levelType,
							},
						})
						await serverConnectionPacket<Play.toClient.RespawnPacket>(client, 'toClient', {
							metadata: {
								name: 'respawn',
								state: 'play',
								id: Ids.Play.toClient.respawn,
							},
							data: {
								dimension: login.data.dimension,
								difficulty: login.data.difficulty,
								gamemode: login.data.gameMode,
								levelType: login.data.levelType,
							},
						})
					}

					client.on('packet', (packet) => {
						connection.emit('packetServerbound', packet)
					})
					targetClient.on('packet', (packet) => {
						connection.emit('packetClientbound', packet)
					})

					await connected(connection)
				}
			},
		).listen(localPort < 0 || localPort >= 65536 ? 25565 : localPort, localIp)
	},
}
