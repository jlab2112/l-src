import { writeServerboundPacket } from '@lilithmod/hypixel-mod-api'
import { State } from '@lilithmod/unborn-mcproto'
import chalk from 'chalk'
import { initializeClient, type LilithClient } from '@/client.js'
import config, { applyConfigUpdates } from '@/config.js'
import { loadResourcePack } from '@/listeners/emoji'
import { loadPlayers } from '@/listeners/tags'
import log, { lc } from '@/log.js'
import { processClientboundPacket, processServerboundPacket } from '@/sources/proxyEvents.js'
import { proxySource } from '@/sources/proxySource.js'
import store from '@/store.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import { checkKey } from '@/utils/checkkey.js'
import getUserGiftedRanks from '@/utils/getUserGiftedRanks'
import { isStreamerMode, permission } from '@/utils/permissions.js'
import lilithWebsocket from '@/websocket/socket.js'
import { sendToLauncher } from '.'
import { VERSION } from './constants'
import { useInjection } from './injection/support'
import { ipcSource } from './ipcSource'
import { lunarBypasses } from './utils/lunar'

export function startLilith() {
	const source = useInjection() ? ipcSource : proxySource

	try {
		source.listen(
			async (status) => {
				if (!isStreamerMode()) {
					status.description = [
						status.description.replace(/§.Hypixel Network/, '§cLilith§4/§cHypixel Network'),
						`§cLilith§f §7§l\u00bb §rv${VERSION} \n§r§9\u258c §r§7Lilith update in october!!`,
					][Math.floor(Math.random() * 2)]
					status.favicon =
						'data:image/png;base64,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'
				}
				return status
			},
			async (client: LilithClient) => {
				initializeClient(client)

				sendToLauncher({ type: 'uuid', data: client.uuidShort })

				lilithWebsocket.send<'login'>('login', {
					uuid: client.uuidShort,
					username: client.username,
					serverID: client.serverID,
				})

				lilithWebsocket.on<'tags'>('tags', (data) => {
					const [tags, id] = data
					client.tagID = id
					if (Object.keys(tags).length === 0) client.tags = {}
					else if (!permission('lilith.tags.personal')) client.tags = {}
					else {
						Lilith.log.info(`Received ${Object.keys(tags).length} tag(s).`)
						client.tags = tags
						loadPlayers(client)
					}
				})
				lilithWebsocket.on<'apiToken'>('apiToken', async (token) => {
					Lilith.log.info(`API TOKEN: ${token}`)
					client.apiToken = token
				})
				lilithWebsocket.on<'configUpdate'>('configUpdate', async (cUpdates) => {
					applyConfigUpdates(cUpdates, client)
				})

				if (permission('lilith.ranks.possess')) {
					Lilith.log.notice('Sending rankAccount data')
					lilithWebsocket.send<'rankAccount'>('rankAccount', {
						uuid: client.uuidShort,
						username: client.username,
						toggled: store().rankAccounts[client.uuidShort] ?? false,
					})
				}

				loadResourcePack(client)
				await lunarBypasses(client)

				const registerLocationEventPacket: Buffer = writeServerboundPacket('register', { version: 1 })
				writePacket<Play.toServer.CustomPayloadPacket>(client, 'toServer', {
					metadata: {
						id: Ids.Play.toServer.custom_payload,
						state: 'play',
						name: 'custom_payload',
					},
					data: {
						channel: 'hypixel:register',
						data: registerLocationEventPacket,
					},
				})

				checkKey(client, config().general.apiKey, config().general.useApiKeyLess)

				setTimeout(() => getUserGiftedRanks(client), 3000)

				client.on('packetClientbound', async (incoming) => {
					// await client.sendClientbound(packet)
					await processClientboundPacket(incoming, client)
				})

				client.on('packetServerbound', async (incoming) => {
					// await client.sendServerbound(packet)
					await processServerboundPacket(incoming, client)
				})

				client.on('errorClientbound', (e: Error) => {
					log.raw(
						`${chalk.hex('#c861ff')('Remote')} ${lc.black('»')} ${chalk.white(`Error: ${e.message}`)}`,
						'REMOTE',
					)
				})

				client.on('errorServerbound', (e: Error) => {
					log.raw(`${lc.purple('Local')} ${lc.black('»')} ${chalk.white(`Error: ${e.message}`)}`, 'REMOTE')
				})

				client.on('endClientbound', () => {
					log.raw(`${chalk.hex('#c861ff')('Remote')} ${lc.black('»')} ${chalk.white('Disconnected')}`, 'REMOTE')
				})

				client.on('endServerbound', () => {
					if (client.state === State.Status) return

					log.raw(`${lc.purple('Local')} ${lc.black('»')} ${chalk.white('Disconnected')}`, 'LOCAL')

					clearInterval(client.dodgeInterval)
					if (client.disconnectFromLunar != null) {
						client.disconnectFromLunar()
					}
				})

				client.on('end', () => {
					lilithWebsocket.send<'logout'>('logout', client.uuidShort)
				})
			},
		)
	} catch (e) {
		log.error("Failed to start Lilith's internal server!")
		Lilith.error(e)
	}
}
