import type { Player } from '@lilithmod/unborn-hypixel'
import { pattern } from '@lilithmod/unborn-statgen'
import { ChatMessage, MessageBuilder } from 'prismarine-chat'
import type { LilithClient } from '@/client.js'
import config from '@/config.js'
import gameEmitter from '@/listeners/emitters/gameEmitter'
import { locationEmitter } from '@/listeners/emitters/locrawEmitter.js'
import type { ScoreboardTeam } from '@/listeners/scoreboardteams'
import { getRankFromUsername } from '@/ranks/ranks'
import { locationToGamemode } from '@/stats/getStatsMessage'
import store from '@/store'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, PlayerInfoAction, ScoreboardTeamMode, writePacket } from '@/types/packets/minecraft/packets.js'
import { isStreamerMode, permission } from '@/utils/permissions.js'
import { getTags } from '@/utils/tags'

// const modifyTabFooter = (footer: ChatMessage) => {
//     footer.append(new ChatMessage(MessageBuilder.fromString('\n&cLilith lol', {colorSeparator: '&'})))
//     return footer
// }

type MapData =
	| {
			success: true
			data: {
				name: string
				mode: string
				playstyle: string
				gen: 'Slow' | 'Fast' | 'Slow (Solos) / Medium (Doubles)' | ''
				description: string
				added: number
				builders: string
				new: boolean
				preview: string
				inRotation: boolean
			}
	  }
	| {
			success: false
			error: string
	  }

const corruptionChances = new Map<string, number>()

const mapDataCache = new Map<string, MapData>()

/*async function showSlowGenBW(location: HypixelLocation, client: LilithClient) {
	let mapData = mapDataCache.get(location.map)
	if (mapData == null) {
		try {
			mapData = await fetchJson<MapData>(`${API_URL}/map/${location.map}`)
		} catch (e) {
			console.log('Error fetching map data', e)
		}
	}
	if (mapData == null || mapData.success === false) return
	mapDataCache.set(location.map, mapData)

	if (mapData.data.gen === 'Slow (Solos) / Medium (Doubles)') {
		if (location.mode.endsWith('ONE')) {
			mapData.data.gen = 'Slow'
		} else {
			// @ts-expect-error
			mapData.data.gen = 'Medium'
		}
	}

	await writePacket<Play.toClient.PlayerlistHeaderPacket>(client, 'toClient', {
		metadata: {
			name: 'playerlist_header',
			state: 'play',
			id: Ids.Play.toClient.playerlist_header,
		},
		data: {
			header: JSON.stringify(client.tablistHeader.json),
			footer: JSON.stringify(
				MessageBuilder.fromString(
					`
&eMap: &b${mapData.data.name}
&eGenerator: &b${mapData.data.gen === '' ? 'Unavailable' : mapData.data.gen}
                    `,
				).toJSON(),
			),
		},
	})
}*/

function getCorruptionChance(raw: Player): number {
	// let a = player.stats.skywars.overall.an
	const initialChance = raw.rawData.stats?.SkyWars?.angel_of_death_level ?? 0
	const angelsOffering = raw.rawData.stats?.SkyWars?.angels_offering ?? 0
	const favorOfTheAngel = (raw.rawData.stats?.SkyWars?.packages ?? []).includes('favor_of_the_angel') ? 1 : 0
	return initialChance + angelsOffering + favorOfTheAngel
}

function sendCorruptionChanceFooter(client: LilithClient) {
	return () => {
		writePacket<Play.toClient.PlayerlistHeaderPacket>(client, 'toClient', {
			metadata: {
				name: 'playerlist_header',
				state: 'play',
				id: Ids.Play.toClient.playerlist_header,
			},
			data: {
				header: JSON.stringify(client.tablistHeader.json),
				footer: JSON.stringify(
					MessageBuilder.fromString(
						`
&e&kN&r &5${client.gameInfo.skywarsCorruptionChance}% &eCorruption Chance &e&kN&r
                            `,
					).toJSON(),
				),
			},
		})
	}
}

const intervals = []

const clear = () => {
	for (const interval of intervals) {
		clearInterval(interval)
	}
}

// TODO: fix your own stats showing in skywars

export function registerIntervalClear(client: LilithClient) {
	client.once('end', () => {
		clear()
	})
}

export async function tabStats(client: LilithClient, player: Player) {
	if (isStreamerMode()) return
	try {
		if (client.location == null || !permission('lilith.queuestats') || !permission('lilith.queuestats.tab')) return
		const gametype = client.location.serverType

		const uuid = `${player.uuid.substring(0, 8)}-${player.uuid.substring(8, 12)}-${player.uuid.substring(12, 16)}-${player.uuid.substring(16, 20)}-${player.uuid.substring(20)}`

		const customRank = getRankFromUsername(player.username)
		let displayName = player.displayName
		if (config().general.ranks.enabled && config().general.ranks.statChecking && customRank != null) {
			displayName = `§${customRank.color}[${customRank.prefix}] ${player.username}`
		}

		const tagObject = await getTags(client, uuid)

		const tag = tagObject.formatted !== '' ? tagObject.formatted : ''
		const path = locationToGamemode(client.location).split('.')
		if (path[0] === 'overall') return

		if (gametype === 'BEDWARS') {
			if (
				!isStreamerMode() &&
				permission('lilith.queuestats.bedwars.map_in_tab') &&
				config().queuestats.gamemodes.bedwars.showMapInTab
			) {
				// showSlowGenBW(client.location, client);
			}

			if (!config().queuestats.gamemodes.bedwars.enabled || !permission('lilith.queuestats.bedwars')) return
			displayName = config().queuestats.gamemodes.bedwars.showRanksIngame
				? player.displayName
				: `&r&u${player.username}`
			if (config().general.ranks.enabled && config().general.ranks.statChecking && customRank != null) {
				displayName = `§${customRank.color}[${customRank.prefix}] ${player.username}`
			}

			displayName = `${
				config().queuestats.gamemodes.bedwars.spaceBeforeStar
					? ` ${player.stats.bedwars.levelFormatted}`
					: player.stats.bedwars.levelFormatted
			} ${displayName}${tag} &7| ${pattern('bedwarsFKDR', +player.stats.bedwars.overall.fkdr.toFixed(2))}`
		} else if (gametype === 'SKYWARS') {
			if (!config().queuestats.gamemodes.skywars.enabled || !permission('lilith.queuestats.skywars')) return

			const color = player.stats.skywars.levelFormatted.substring(0, 2)
			const level = `${color}${player.stats.skywars.levelFormatted}${color} `

			displayName = `${
				(config().queuestats.gamemodes.skywars.spaceBeforeStar ? `${level} ` : level) + displayName
			}${tag} &7| ${pattern('skywarsKDR', player.stats.skywars.overall.kdr)}`

			client.gameInfo.playerStats.set(player.username, player)
			client.gameInfo.skywarsCorruptionChance += getCorruptionChance(player)
			// console.log(player.username, getCorruptionChance(raw))
			corruptionChances.set(player.username, getCorruptionChance(player))
		} else if (gametype === 'WOOL_GAMES') {
			if (!config().queuestats.gamemodes.woolgames.enabled || !permission('lilith.queuestats.wool')) return
			displayName = `${
				config().queuestats.gamemodes.woolgames.spaceBeforeStar
					? ` ${player.stats.woolgames.levelFormatted}`
					: player.stats.woolgames.levelFormatted
			} ${displayName}${tag} &7| ${pattern('woolWarsWinsOrLosses', player.stats[path[0]][path[1]].wins)}`
		} else if (gametype === 'TNTGAMES') {
			if (!config().queuestats.gamemodes.tntgames.enabled || !permission('lilith.queuestats.tntgames')) return
			displayName = `${displayName}${tag} &7| ${pattern('woolWarsWinsOrLosses', player.stats[path[0]][path[1]]?.wins ?? 0)}`
		} else return

		const showNametag = () => {
			let display = displayName

			if (gametype === 'BEDWARS') {
				let teamName = ''
				outerLoop: for (const team of client.scoreboardTeams.values()) {
					try {
						// @ts-expect-error
						if (team.isLilithCustomRank || team.name.startsWith('0-')) continue
						if (
							team.players.includes(player.username) ||
							(player.username === client.username && team.players.includes(store().nickname))
						) {
							teamName = team.name
							// Lilith.msg(player.username, team.name)
							break
						}
						for (const nick in store().nicknames) {
							if (
								store().nicknames[nick].toLowerCase() === player.username.toLowerCase() &&
								team.players.map((p) => p.toLowerCase()).includes(nick.toLowerCase())
							) {
								teamName = team.name
								// Lilith.msg(player.username, team.name)
								break outerLoop
							}
						}
					} catch (e) {
						Lilith.error(e)
					}
				}
				let { initial, code } = getTeamInitial(teamName)

				if (initial == null) {
					initial = client.gameInfo.playerInitials.get(player.username)
				}
				if (initial == null && player.username === client.username) {
					initial = client.gameInfo.playerInitials.get(store().nickname)
				}
				if (initial == null) {
					for (const nick in store().nicknames) {
						if (store().nicknames[nick].toLowerCase() === player.username.toLowerCase()) {
							initial = client.gameInfo.playerInitials.get(nick)
							break
						}
					}
				}

				if (initial != null) {
					if (config().queuestats.gamemodes.bedwars.showStatsIngame) {
						if (client.gameInfo.started) {
							display = initial + player.username
						}
						display = `${initial}&r${displayName}`
					} else {
						display = initial + player.username
					}
				}

				display = code ? display.replaceAll('&u', code) : display.replaceAll('&u', '&7')
			} else if (gametype === 'WOOL_GAMES') {
				let teamName = ''
				for (const team of client.scoreboardTeams.values()) {
					// @ts-expect-error
					if (team.isLilithCustomRank) continue
					if (team.players.includes(player.username)) {
						if (team.prefix.includes('§lR')) {
							teamName = 'Red'
						} else if (team.prefix.includes('§lB')) {
							teamName = 'Blue'
						}
						break
					}
				}
				const { initial } = getTeamInitial(teamName)
				if (initial != null) {
					if (config().queuestats.gamemodes.woolgames.showStatsIngame) {
						if (client.gameInfo.started) {
							display = initial + player.username
						}
						display = `${initial}&r${displayName}`
					} else {
						display = initial + player.username
					}
				}
			} else if (gametype === 'SKYWARS' && config().queuestats.gamemodes.skywars.showStatsIngame) {
				const possibleUsernames = [player.username]
				if (player.username === client.username) {
					possibleUsernames.push(store().nickname)
				}
				for (const nick in store().nicknames) {
					if (store().nicknames[nick].toLowerCase() === player.username.toLowerCase()) {
						possibleUsernames.push(nick)
					}
				}
				const initial = getSkywarsTeamInitial(client, possibleUsernames)

				if (initial != null) {
					display = initial + displayName
				}

				for (const letter in skywarsTeamColors) {
					let teamName = null
					let scoreboardTeam: ScoreboardTeam = null

					for (const [name, team] of client.scoreboardTeams) {
						if (team.prefix === `§a[${letter}] ` || team.prefix === `§c[${letter}] `) {
							teamName = name
							scoreboardTeam = team
							break
						}
					}

					if (scoreboardTeam != null) {
						writePacket<Play.toClient.ScoreboardTeamPacket>(client, 'toClient', {
							metadata: {
								name: 'scoreboard_team',
								state: 'play',
								id: Ids.Play.toClient.scoreboard_team,
							},
							data: {
								mode: ScoreboardTeamMode.UpdateInformation,
								team: teamName,
								prefix: `${skywarsTeamColors[letter]}&l${letter} `,
								name: scoreboardTeam.name,
								suffix: scoreboardTeam.suffix,
								friendlyFire: scoreboardTeam.friendlyFire,
								nameTagVisibility: scoreboardTeam.nameTagVisibility,
								color: scoreboardTeam.color,
							},
						})
					}
				}
			}

			writePacket<Play.toClient.PlayerInfoPacket>(client, 'toClient', {
				metadata: {
					name: 'player_info',
					state: 'play',
					id: Ids.Play.toClient.player_info,
				},
				data: {
					action: PlayerInfoAction.UpdateDisplayName,
					data: [
						{
							UUID: client.gameInfo.friendNicknameUUIDs.has(player.username.toLowerCase())
								? client.gameInfo.friendNicknameUUIDs.get(player.username.toLowerCase())
								: uuid,
							displayName: JSON.stringify(new ChatMessage(display.replace(/&/g, '§')).json),
						},
					],
				},
			})
		}

		showNametag()

		if (gametype === 'BEDWARS' || gametype === 'WOOL_GAMES') {
			intervals.push(setInterval(showNametag, 1000))
		} else if (gametype === 'SKYWARS') {
			if (config().queuestats.gamemodes.skywars.showStatsIngame) {
				intervals.push(setInterval(showNametag, 1000))
			}
			if (
				!isStreamerMode() &&
				permission('lilith.queuestats.skywars.corruption') &&
				config().queuestats.gamemodes.skywars.showCorruptionChance
			) {
				sendCorruptionChanceFooter(client)()
				intervals.push(setInterval(sendCorruptionChanceFooter(client), 1000))
			}
		}
	} catch (e) {
		console.log(`The tab stats handler failed with the reason ${e}`)
	}
}

locationEmitter.onWithReason('location', 'clear tabstats intervals', clear)

gameEmitter.on('player-left', (client: LilithClient, player: string) => {
	if (client.location?.serverType === 'SKYWARS') {
		// console.log(`${player} left with ${corruptionChances.get(player) ?? 0} corruption chance`)
		// console.log(client.gameInfo.skywarsCorruptionChance)
		client.gameInfo.skywarsCorruptionChance -= corruptionChances.get(player) ?? 0
		client.gameInfo.playerStats.delete(player)
	}
})

const skywarsTeamColors = {
	A: '&b',
	B: '&6',
	C: '&d',
	D: '&e',
	E: '&a',
	F: '&9',
	G: '&f',
	H: '&3',
	I: '&2',
	J: '&c',
	K: '&b',
	L: '&6',
	M: '&d',
	N: '&e',
	O: '&a',
	P: '&9',
	Q: '&f',
	R: '&3',
	S: '&2',
	T: '&c',
	U: '&b',
	V: '&6',
	W: '&d',
	X: '&e',
	Y: '&a',
	Z: '&9',
}

export const getSkywarsTeamInitial = (client: LilithClient, possiblePlayers: string[]): string | null => {
	for (const [, team] of client.scoreboardTeams) {
		if (!team.players.some((p) => possiblePlayers.includes(p))) continue
		const match = team.prefix.match(/§[ac]\[([A-Z])] /)
		if (match != null && match.length > 1) {
			const initial = match[1]
			// console.log(possiblePlayers, initial)
			// return the skywars team color, looping through the colors if there are more than 10 teams
			return `${skywarsTeamColors[initial]}&l${initial} &r`
		}
	}
	return null
}

export const getTeamInitial = (name: string): { code: null | string; initial: null | string } => {
	if (name.startsWith('Red')) {
		return {
			code: '&r&c',
			initial: '&l&cR &r&c',
		}
	}
	if (name.startsWith('Blue')) {
		return {
			code: '&r&9',
			initial: '&l&9B &r&9',
		}
	}
	if (name.startsWith('Green')) {
		return {
			code: '&r&a',
			initial: '&l&aG &r&a',
		}
	}
	if (name.startsWith('Yellow')) {
		return {
			code: '&r&e',
			initial: '&l&eY &r&e',
		}
	}
	if (name.startsWith('Aqua')) {
		return {
			code: '&r&b',
			initial: '&l&bA &r&b',
		}
	}
	if (name.startsWith('White')) {
		return {
			code: '&r&f',
			initial: '&l&fW &r&f',
		}
	}
	if (name.startsWith('Pink')) {
		return {
			code: '&r&d',
			initial: '&l&dP &r&d',
		}
	}
	if (name.startsWith('Gray')) {
		return {
			code: '&r&8',
			initial: '&l&8S &r&8',
		}
	}
	return { code: null, initial: null }
}
