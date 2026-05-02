import { ChatMessage, MessageBuilder } from 'prismarine-chat'
import type { LilithClient } from '@/client.js'
import config from '@/config.js'
import { addListener } from '@/events.js'
import gameEmitter from '@/listeners/emitters/gameEmitter.js'
import { locationEmitter } from '@/listeners/emitters/locrawEmitter.js'
import { getTeamInitial } from '@/queuestats/tabstats'
import type { PacketEvent } from '@/types/events'
import type { HypixelLocation } from '@/types/HypixelLocation.js'
import type { HoverEvent, JsonMessage } from '@/types/JsonMessage'
import { Ids } from '@/types/packets/minecraft/ids'
import { type Play, ScoreboardTeamMode, writePacket } from '@/types/packets/minecraft/packets'
import { EntityMetadataType } from '@/types/packets/shared'
import { permission } from '@/utils/permissions.js'
import { discordInfo, type LilithRank, ranks, ranksListener, usernameToRank } from './ranksData'

// TODO: finish off  party list, guild list
// ok so party list and guild list going to be very hard i'll do when brain works ok
// good night!

// const teamMappings: Map<string, string> = new Map()

export function getRankFromUsername(name: string): LilithRank | undefined {
	const rank = usernameToRank[name.toLowerCase()]
	if (rank?.permission && rank.toggled) return rank
	return undefined
}

function formatChatRank(username: string, rank: LilithRank | null) {
	if (rank == null) {
		return `§7${username}`
	}

	return `§${rank.color}[${rank.prefix}] ${username}`
}

function formatColorRank(username: string, rank: LilithRank | null) {
	if (rank == null) {
		return `§7${username}`
	}

	return `§${rank.color}${username}`
}

// function parseLobbyMessage(message: JsonMessage) {
// 	if (!config().general.ranks.generalChat) return
// 	if (message.text === '') {
// 		const senderExtra = message.extra[0]
// 		const messageExtra = message.extra[1]

// 		if (!messageExtra || !messageExtra.text.startsWith(': ')) {
// 			return
// 		}

// 		const splitSender = senderExtra.text.split(' ')
// 		const dirtyUsername = splitSender[splitSender.length - 1]
// 		const username = dirtyUsername.replace(/§./g, '')
// 		const rank = getRankFromUsername(username)

// 		if (!rank) return
// 		if (!dirtyUsername.startsWith('§7')) {
// 			splitSender.splice(splitSender.length - 2, 1)
// 		}

// 		splitSender[splitSender.length - 1] = formatChatRank(username, rank)
// 		senderExtra.text = splitSender.join(' ')

// 		return true
// 	}
// }

// function parseGuildMessage(message: JsonMessage) {
// 	if (message.text === '') {
// 		const usernameComponent = message.extra[0]
// 		const usernameRawText = usernameComponent.text

// 		if (
// 			(config().general.ranks.guildChat && usernameRawText.startsWith('§2Guild > ')) ||
// 			(config().general.ranks.partyChat && usernameRawText.startsWith('§9Party §8> '))
// 		) {
// 			const guildRegex = /(§2Guild >|§9Party §8>) (.*?)( §.\[(.*)])?§f:/g
// 			const matches = guildRegex.exec(usernameRawText)

// 			if (matches) {
// 				const usernameAndRank = matches[2]
// 				const username = (usernameAndRank.split(' ')[1] ?? usernameAndRank.split(' ')[0]).replace(/§./g, '')
// 				const rank = getRankFromUsername(username)
// 				if (!rank) return
// 				const formatted = formatChatRank(username, rank)
// 				usernameComponent.text = usernameRawText.replace(usernameAndRank, formatted)
// 				return true
// 			}
// 		}
// 	}
// }

// function parseGameMessage(message: JsonMessage) {
// 	if (!config().general.ranks.directMessages) return
// 	if (message.text === '' || message.text === 'To ' || message.text === 'From ') {
// 		const usernameEndIndex = message.extra.findIndex((component) => component.text.startsWith(': ')) - 1
// 		const usernameComponent = message.extra[usernameEndIndex]
// 		const dirtyUsername = usernameComponent.text

// 		const username = dirtyUsername.replace(/\[?(.+)?] ?/, '')
// 		const rank = getRankFromUsername(username)

// 		if (!rank) return

// 		if (dirtyUsername.includes('] ')) {
// 			for (let i = usernameEndIndex; i >= 0; i--) {
// 				const component = message.extra[i]

// 				if (component.text !== dirtyUsername) message.extra.splice(i, 1)
// 				if (component.text.startsWith('[')) {
// 					break
// 				}
// 			}
// 		}

// 		usernameComponent.color = 'white'
// 		usernameComponent.text = formatChatRank(username, rank)

// 		return true
// 	}
// }

// function parseJoinLeave(message: JsonMessage) {
// 	if (
// 		(config().general.ranks.friendJoin && message.color === 'green' && message.text === 'Friend > ') ||
// 		(config().general.ranks.guildJoin && message.color === 'dark_green' && message.text === 'Guild > ')
// 	) {
// 		const nameComponent = message.extra[0]
// 		const username = nameComponent.text
// 		const rank = getRankFromUsername(username.trim())

// 		if (!rank) return

// 		nameComponent.text = formatColorRank(username, rank)
// 		nameComponent.color = 'white'

// 		return true
// 	}
// }

// function parseLobbyJoin(message: JsonMessage) {
// 	if (!config().general.ranks.lobbyJoin) return
// 	if (message.text === '') {
// 		const leftText = ' §b§kL§c§kL§a§kL§r§0 > '
// 		const rightText = ' §0< §b§kL§c§kL§a§kL§r '

// 		let joinComponent: MessageComponent
// 		let mvpPlusPlus = false

// 		if (message.extra[0].text === ' §b>§c>§a>§r ') {
// 			joinComponent = message.extra[1]
// 			mvpPlusPlus = true
// 		} else if (message.extra[0].text.endsWith('§6joined the lobby!')) {
// 			joinComponent = message.extra[0]
// 		} else return

// 		const rawText = joinComponent.text
// 		const usernameRegex = /(\[.*?] (.*?))§f §6joined the lobby!/g

// 		const matches = usernameRegex.exec(rawText)
// 		const fullUser = matches[1]
// 		const username = matches[2]

// 		const rank = getRankFromUsername(username.trim())

// 		if (!rank) return

// 		joinComponent.text = joinComponent.text.replace(fullUser, formatChatRank(username, rank))

// 		if (mvpPlusPlus) {
// 			message.extra[0].text = leftText
// 			message.extra[2].text = rightText
// 		} else {
// 			message.extra.unshift({ text: leftText })
// 			message.extra.push({ text: rightText })
// 		}

// 		return true
// 	}
// }

// function parseFl(message: JsonMessage) {
// 	if (!config().general.ranks.friendsList) return
// 	const startIndex = 4
// 	const boundaries = '-----------------------------------------------------'
// 	const containsFriendCount = message.extra.findIndex((value) => value.text.includes(' §6Friends '))

// 	if (message.text === boundaries && message.color === 'blue' && message.strikethrough && containsFriendCount) {
// 		let i = startIndex
// 		while (true) {
// 			const nextLine = message.extra.findIndex((val, index) => val.text === '\n' && index > i)
// 			const usernameComponent = message.extra[i + 1]
// 			const username = usernameComponent.text

// 			i = nextLine

// 			if (username === boundaries) break
// 			if (username === '\n') continue

// 			const cleanUsername = username.replace(/§./g, '')
// 			const rank = getRankFromUsername(cleanUsername.trim())

// 			if (!rank) continue

// 			usernameComponent.text = formatColorRank(username.replace(/§./, ''), rank)
// 		}
// 		return true
// 	}

// 	return false
// }

const complementingColors = {
	'0': 'f',
	'1': 'b',
	'2': 'a',
	'3': 'b',
	'4': 'c',
	'5': 'd',
	'6': 'e',
	'7': 'f',
	'8': '7',
	'9': 'b',
	a: '2',
	b: '3',
	c: '4',
	d: '5',
	e: '6',
	f: '7',
}

function getAllExtraComponents(extra: JsonMessage[]) {
	const components: JsonMessage[] = []

	for (const component of extra) {
		components.push(component)
		if (component.extra != null) {
			components.push(...getAllExtraComponents(component.extra))
		}
		delete component.extra
	}

	return components
}

function stripComponent(component: JsonMessage) {
	if (
		component.strikethrough === false &&
		component.obfuscated === false &&
		component.underlined === false &&
		component.italic === false &&
		component.color === 'reset' &&
		component.bold === false &&
		component.text === ''
	) {
		delete component.strikethrough
		delete component.obfuscated
		delete component.underlined
		delete component.italic
		delete component.color
		delete component.bold
	}
}

function flattenComponent(component: JsonMessage) {
	component.extra = getAllExtraComponents(component.extra ?? [])
	stripComponent(component)
	for (const ex of component.extra) {
		stripComponent(ex)
	}
}

function replaceInComponent(component: JsonMessage, regex: RegExp, replacement: string) {
	if (component.text !== '') {
		component.text = component.text.replace(regex, () => replacement)
	}
	if (component.extra != null) {
		for (const extra of component.extra) {
			replaceInComponent(extra, regex, replacement)
		}
	}
}

function replaceInComponentHover(component: JsonMessage, regex: RegExp, replacement: string) {
	if (component.hoverEvent != null && component.hoverEvent.action === 'show_text') {
		if (typeof component.hoverEvent.value === 'string') {
			component.hoverEvent.value = component.hoverEvent.value.replace(regex, () => replacement)
		} else {
			replaceInComponent(component.hoverEvent.value, regex, replacement)
		}
	}
	if (component.extra != null) {
		for (const extra of component.extra) {
			replaceInComponentHover(extra, regex, replacement)
		}
	}
}

function containsTextInComponent(component: JsonMessage, text: string) {
	if (component.text?.includes(text)) {
		return true
	}
	if (component.extra != null) {
		for (const extra of component.extra) {
			if (containsTextInComponent(extra, text)) return true
		}
	}
	return false
}

function containsTextInComponentHover(component: JsonMessage, text: string) {
	if (component.hoverEvent != null && component.hoverEvent.action === 'show_text') {
		if (typeof component.hoverEvent.value === 'string') {
			if (component.hoverEvent.value.includes(text)) return true
		} else {
			if (containsTextInComponent(component.hoverEvent.value, text)) return true
		}
	}
	if (component.extra != null) {
		for (const extra of component.extra) {
			if (containsTextInComponentHover(extra, text)) return true
		}
	}
	return false
}

function containsChatEvent(component: JsonMessage) {
	if (component.hoverEvent != null) {
		return true
	}
	if (component.extra != null) {
		for (const extra of component.extra) {
			if (containsChatEvent(extra)) return true
		}
	}
	return false
}

const singlePlayerDuelsModes = [
	'DUELS_CLASSIC_DUEL',
	'DUELS_SW_DUEL',
	'DUELS_BOW_DUEL',
	'DUELS_UHC_DUEL',
	'DUELS_POTION_DUEL',
	'DUELS_COMBO_DUEL',
	'DUELS_OP_DUEL',
	'DUELS_MW_DUEL',
	'DUELS_SUMO_DUEL',
	'DUELS_BLITZ_DUEL',
	'DUELS_BOWSPLEEF_DUEL',
	'DUELS_BOXING_DUEL',
]

locationEmitter.onWithReason('location', 'ranks debug', (location: HypixelLocation, client: LilithClient) => {
	Lilith.log.info(location)
	if (client.isLobby) {
		client.shouldReplaceAllRanks = true
		return
	}
	client.shouldReplaceAllRanks = !(location.serverType === 'DUELS' && !singlePlayerDuelsModes.includes(location.mode))
	Lilith.log.debug(client.shouldReplaceAllRanks)
})

gameEmitter.on('start', (client: LilithClient) => {
	if (client.location == null) {
		client.shouldReplaceAllRanks = true
	} else if (client.location.serverType === 'BEDWARS' || client.location.serverType === 'WOOL_GAMES') {
		client.shouldReplaceAllRanks = false
	}
})

export function addListeners() {
	addListener<PacketEvent<Play.toClient.ChatPacket>>(
		Ids.Play.toClient.chat,
		'toClient',
		'',
		10,
		true,
		async ({ packet, client }) => {
			if (!config().general.ranks.enabled && permission('lilith.ranks.disable')) return
			// if (packet.data.position !== ChatPosition.Chat) return

			const messageComponent: JsonMessage = JSON.parse(packet.data.message)
			const replaceDeep = containsChatEvent(messageComponent)
			// const replaceDeep = false

			let message = new ChatMessage(JSON.parse(packet.data.message)).toMotd()
			const originalMessage = message

			Lilith.log.trace(message)

			if (message.includes('§dTo ') || message.includes('§dFrom ')) {
				if (!config().general.ranks.directMessages && permission('lilith.ranks.disable')) return
			} else if (message.includes('§9Party ')) {
				if (!config().general.ranks.partyChat && permission('lilith.ranks.disable')) return
			} else if (message.includes('§2Guild ')) {
				if (!config().general.ranks.guildChat && permission('lilith.ranks.disable')) return
			}

			for (const rankId of Object.keys(ranks)) {
				const rank = ranks[rankId] as LilithRank
				if (!rank.toggled || !rank.permission) continue

				if (message.includes(`§7${rank.username}`)) {
					Lilith.log.trace(message)

					if (replaceDeep) {
						replaceInComponent(
							messageComponent,
							new RegExp(`§7${rank.username}(?=[: §])`, 'g'),
							formatChatRank(rank.username, rank),
						)
						if (client.shouldReplaceAllRanks) {
							replaceInComponentHover(
								messageComponent,
								// note this has a 7
								new RegExp(`§[abcdef0123456789]${rank.username}(?=[: §])`, 'g'),
								formatColorRank(rank.username, rank),
							)
							replaceInComponentHover(
								messageComponent,
								/\n§7Hypixel Level:/,
								`\n§7Lilith Rank: §${rank.color}${rank.prefix}\n§7Discord: §9${discordInfo[rankId] ?? 'ERR'}§f\n§7Hypixel Level:`,
							)
						}
					} else {
						message = message.replace(new RegExp(`§7${rank.username}(?=[: §])`, 'g'), () =>
							formatChatRank(rank.username, rank),
						)
					}

					Lilith.log.trace(JSON.parse(packet.data.message))
				} else if (message.includes(rank.username)) {
					if (
						(message.trimEnd().endsWith(' §a<§c<§b<§r') && message.trimStart().startsWith('§b>§c>§a>§r ')) ||
						message.trimEnd().endsWith(' the lobby!§r')
					) {
						if (!config().general.ranks.lobbyJoin && permission('lilith.ranks.disable')) {
							return
						}

						replaceInComponentHover(
							messageComponent,
							/\n§7Hypixel Level:/,
							`\n§7Lilith Rank: §${rank.color}${rank.prefix}\n§7Discord: §9${discordInfo[rankId] ?? 'ERROR'}§f\n§7Hypixel Level:`,
						)

						let hoverEvent: HoverEvent
						for (const component of messageComponent.extra ?? []) {
							if (component.hoverEvent != null) {
								hoverEvent = component.hoverEvent
								break
							}
						}

						const complement = complementingColors[rank.color] ?? '6'
						const arrowColor = rank.color === '7' || rank.color === '8' ? '0' : '8'
						const textColor = rank.color === '7' ? 'f' : '7'
						message = `§${complement}§k>§${rank.color}§k>§${complement}§k>§${
							arrowColor
						} > ${formatChatRank(rank.username, rank)} §${textColor}joined the lobby! §${arrowColor}< §${complement}§k<§${rank.color}§k<§${complement}§k<`
						const jsonMessage: any = MessageBuilder.fromString(message).toJSON()
						jsonMessage.hoverEvent = hoverEvent
						jsonMessage.clickEvent = {
							action: 'run_command',
							value: `/profile ${rank.username}`,
						}
						packet.data.message = JSON.stringify(jsonMessage)

						return
					}

					Lilith.log.trace(message)
					if (replaceDeep) {
						replaceInComponent(
							messageComponent,
							new RegExp(`§.\\[.{1,7}(§r)?(§.)?\\+?\\+?(§r)?(§.)?\] ${rank.username}(?=[: §])`, 'g'),
							formatChatRank(rank.username, rank),
						)
						if (client.shouldReplaceAllRanks) {
							replaceInComponent(
								messageComponent,
								new RegExp(`§[abcdf012345689]${rank.username}(?=[: §])`, 'g'),
								formatColorRank(rank.username, rank),
							)
							replaceInComponentHover(
								messageComponent,
								// note this has a 7
								new RegExp(`§[abcdf0123456789]${rank.username}(?=[: §])`, 'g'),
								formatColorRank(rank.username, rank),
							)
						}
						if (containsTextInComponentHover(messageComponent, rank.username)) {
							replaceInComponentHover(
								messageComponent,
								/\n§7Hypixel Level:/,
								`\n§7Lilith Rank: §${rank.color}${rank.prefix}\n§7Discord: §9${discordInfo[rankId] ?? 'ERROR'}§f\n§7Hypixel Level:`,
							)
						}
					} else {
						message = message.replace(
							new RegExp(`§.\\[.{1,7}(§r)?(§.)?\\+?\\+?(§r)?(§.)?\] ${rank.username}(?=[: §])`, 'g'),
							() => formatChatRank(rank.username, rank),
						)
						if (client.shouldReplaceAllRanks)
							message = message.replace(new RegExp(`§[abcdef012345689]${rank.username}(?=[: §])`, 'g'), () =>
								formatColorRank(rank.username, rank),
							)
					}

					Lilith.log.trace(JSON.parse(packet.data.message))
					if (message.includes('§m is ')) {
						message = message.replace(/§m/g, '')
					}

					Lilith.log.trace(message)
				}
			}

			if (replaceDeep) {
				if (JSON.stringify(messageComponent) !== JSON.stringify(packet.data.message)) {
					packet.data.message = JSON.stringify(messageComponent)
				}
			} else if (message !== originalMessage) {
				const json: JsonMessage = MessageBuilder.fromString(message, {
					colorSeparator: '§',
				}).toJSON()
				if (message.includes('●')) {
					flattenComponent(json)
				}
				if (
					(message.includes('§dTo ') || message.includes('§dFrom ')) &&
					messageComponent.extra[0].clickEvent != null
				) {
					json.clickEvent = messageComponent.extra[0].clickEvent
				}
				packet.data.message = JSON.stringify(json)
			}
		},
	)

	addListener<PacketEvent<Play.toClient.TitlePacket>>(
		Ids.Play.toClient.title,
		'toClient',
		'',
		10,
		true,
		async ({ packet }) => {
			if (!config().general.ranks.enabled && permission('lilith.ranks.disable')) return
			if ('text' in packet.data) {
				Lilith.log.trace(packet.data.text)

				let message = new ChatMessage(JSON.parse(packet.data.text)).toMotd()
				const originalMessage = message
				Lilith.log.trace(message)

				for (const rankId of Object.keys(ranks)) {
					const rank = ranks[rankId] as LilithRank
					if (!rank.toggled || !rank.permission) continue

					if (message.includes(`§7${rank.username}`)) {
						Lilith.log.trace(message)
						message = message.replace(new RegExp(`§7${rank.username}`, 'g'), formatChatRank(rank.username, rank))
						Lilith.log.trace(message)
					} else if (message.includes(rank.username)) {
						Lilith.log.trace(message)
						message = message.replace(
							new RegExp(`§.\\[.{1,7}(§r)?(§.)?\\+?\\+?(§r)?(§.)?\] ${rank.username}`, 'g'),
							formatChatRank(rank.username, rank),
						)
						message = message.replace(
							new RegExp(`§[abcdef012345689]${rank.username}`, 'g'),
							formatColorRank(rank.username, rank),
						)
						Lilith.log.trace(message)
					}
				}

				if (message !== originalMessage) {
					packet.data.text = JSON.stringify(
						MessageBuilder.fromString(message, {
							colorSeparator: '§',
						}).toJSON(),
					)
				}
			}
		},
	)

	addListener<PacketEvent<Play.toClient.ScoreboardTeamPacket>>(
		Ids.Play.toClient.scoreboard_team,
		'toClient',
		'',
		10,
		true,
		async ({ packet, client, setCancelled }) => {
			if (client.ranksHandler == null) {
				client.ranksHandler = ranksListener.on('update', (player, rankData) => {
					const teamName = player.length < 15 ? `0-${player}` : `-${player.slice(1)}`

					if (client.scoreboardTeams.has(`0-${player}`)) {
						Lilith.log.trace(player)
						const team = client.scoreboardTeams.get(teamName)
						// const rankData = usernameToRank[player]
						// if (rankData == null) return

						let rankPrefix: string

						// const fullRank = /\[.*] /
						// const colorRank = /§([267abc])/

						if (team.prefix.includes('[') || team.prefix.includes('§7')) {
							rankPrefix = `§${rankData.color}[${rankData.prefix}] `
						} else {
							// Lilith.msg(team)
							rankPrefix = `§${rankData.color}`
						}

						Lilith.log.trace(rankPrefix)

						team.prefix = rankPrefix
						// @ts-ignore
						team.isLilithCustomRank = true
						client.scoreboardTeams.set(teamName, team)

						writePacket<Play.toClient.ScoreboardTeamPacket>(client, 'toClient', {
							metadata: {
								id: Ids.Play.toClient.scoreboard_team,
								state: 'play',
								name: 'scoreboard_team',
							},
							data: {
								team: teamName,
								name: team.name,
								prefix: rankPrefix,
								suffix: team.suffix,
								friendlyFire: team.friendlyFire,
								nameTagVisibility: team.nameTagVisibility,
								color: Number.parseInt(rankData.color, 16),
								mode: ScoreboardTeamMode.UpdateInformation,
							},
						})
					}
				})
			}
			if (!config().general.ranks.enabled && permission('lilith.ranks.disable')) return
			if (!config().general.ranks.lobbyTablist) return

			if (client.gameInfo.started || (client.location?.serverType === 'BEDWARS' && client.location.lobbyName == null))
				return
			const { initial } = getTeamInitial(packet.data.team)
			if (initial !== null) {
				return
			}

			if (packet.data.mode === ScoreboardTeamMode.AddPlayers) {
				Lilith.log.trace(packet.data)
				for (const player of packet.data.players) {
					const teamName = player.length < 15 ? `0-${player}` : `-${player.slice(1)}`
					const oldTeam = client.scoreboardTeams.get(packet.data.team)
					// if (player === 'arrr') console.log(oldTeam)
					if (oldTeam == null) return

					const rankData = getRankFromUsername(player)
					// if (player === 'arrr') console.log(rankData)
					if (rankData == null) return

					Lilith.log.trace(oldTeam)

					let rankPrefix: string | null = null

					const fullRank = /\[.*] /
					const colorRank = /§([26abc])/

					if (fullRank.test(oldTeam.prefix) || oldTeam.prefix === '§7') {
						rankPrefix = `§${rankData.color}[${rankData.prefix}] `
					} else if (colorRank.test(oldTeam.prefix)) {
						Lilith.log.trace(oldTeam)
						rankPrefix = `§${rankData.color}`
					} else {
						return
					}

					const newTeam = {
						team: teamName,
						players: [player],
						prefix: rankPrefix,
						name: `0-${player}`,
						suffix: oldTeam.suffix,
						friendlyFire: oldTeam.friendlyFire,
						color: Number.parseInt(rankData.color, 16),
						nameTagVisibility: oldTeam.nameTagVisibility,
						mode: ScoreboardTeamMode.Create,
					}

					client.scoreboardTeams.set(newTeam.team, newTeam)

					Lilith.log.trace(newTeam)

					setCancelled(true)

					writePacket<Play.toClient.ScoreboardTeamPacket>(client, 'toClient', {
						metadata: {
							id: Ids.Play.toClient.scoreboard_team,
							state: 'play',
							name: 'scoreboard_team',
						},
						data: newTeam,
					})
				}
			}

			// return
			//
			//
			//
			// if (packet.data.mode === ScoreboardTeamMode.AddPlayers && packet.data.players.length === 1) {
			//     const oldTeam = teams.get(packet.data.team)
			//     if (oldTeam == null) return
			//     const rankData = getRankFromUsername(packet.data.players[0])
			//
			//     if (rankData == null) return
			//
			//     let rankPrefix: string = oldTeam?.prefix ?? '§7'
			//
			//     const fullRank = /\[.*] /
			//     const colorRank = /§([267abc])/
			//
			//     if (fullRank.test(oldTeam.prefix)) {
			//         rankPrefix = `§${rankData.color}[${rankData.prefix}] `
			//     } else if (colorRank.test(oldTeam.prefix)) {
			//         rankPrefix = `§${rankData.color}`
			//     } else {
			//         return
			//     }
			//
			//     // TODO: PRIORITY?
			//     const newTeamName = packet.data.team.split('').splice(0, 1, String.fromCharCode(63)).join()
			//
			//     const newTeam = {
			//         team: newTeamName,
			//         players: packet.data.players,
			//         prefix: rankPrefix,
			//         name: oldTeam.name,
			//         suffix: oldTeam.suffix,
			//         friendlyFire: oldTeam.friendlyFire,
			//         color: oldTeam.color,
			//         nameTagVisibility: oldTeam.nameTagVisibility,
			//         mode: ScoreboardTeamMode.Create
			//     }
			//
			//     setCancelled(true)
			//
			//     writePacket<Play.toClient.ScoreboardTeamPacket>(client, 'toClient', {
			//         metadata: {
			//             id: Ids.Play.toClient.scoreboard_team,
			//             state: 'play',
			//             name: 'scoreboard_team'
			//         },
			//         data: newTeam
			//     })
			//
			//     teamMappings.set(oldTeam.name, newTeamName)
			// } else if (packet.data.mode === ScoreboardTeamMode.Remove) {
			//     const mappedName = teamMappings.get(packet.data.team)
			//
			//     if (!mappedName) return
			//
			//     teamMappings.delete(mappedName)
			//     writePacket<Play.toClient.ScoreboardTeamPacket>(client, 'toClient', {
			//         metadata: {
			//             id: Ids.Play.toClient.scoreboard_team,
			//             state: 'play',
			//             name: 'scoreboard_team'
			//         },
			//         data: {
			//             mode: ScoreboardTeamMode.Remove,
			//             team: mappedName
			//         }
			//     })
			// }
		},
	)

	addListener<PacketEvent<Play.toClient.EntityMetadataPacket>>(
		Ids.Play.toClient.entity_metadata,
		'toClient',
		'',
		10,
		false,
		async ({ packet }) => {
			if (!config().general.ranks.enabled && permission('lilith.ranks.disable')) return
			if (!config().general.ranks.lobbyLeaderboards) return
			const nametag = packet.data.metadata.find(
				({ key, value, type }) => key === 2 && value !== '' && type === EntityMetadataType.String,
			) as {
				value: string
			}

			if (nametag) {
				const lbRegex = /§(?:e|c)(?:§l)?(?:.*)?\. (§.)(?:§.)*(.*?)§(?:r|7)/
				const matches = lbRegex.exec(nametag.value)

				if (matches) {
					const colorCode = matches[1]
					const username = matches[2]
					const cleanUsername = username.replace(/§./g, '')
					const rank = getRankFromUsername(cleanUsername)

					if (!rank) return

					nametag.value = nametag.value.replace(colorCode, `§${rank.color}`)
				}
			}
		},
	)
}
