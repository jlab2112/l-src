import type { LilithClient } from '@/client.js'
import config from '@/config.js'
import { locationEmitter } from '@/listeners/emitters/locrawEmitter.js'
import mmConditions from '@/queuestats/conditions/MMConditions'
import { locationToGamemode } from '@/stats/getStatsMessage'
import type { HypixelLocation } from '@/types/HypixelLocation.js'
import { chat } from '@/utils/chat.js'
import { permission } from '@/utils/permissions.js'
import lilithWebsocket from '@/websocket/socket.js'
import type { Player } from '@lilithmod/unborn-hypixel'
import jexl from 'jexl'
import { ChatMessage, MessageBuilder } from 'prismarine-chat'
import skywarsConditions from './conditions/SkywarsConditions.js'
import woolConditions from './conditions/WoolConditions.js'
import { isLobby, supportedGametypes } from './queuestats.js'

export function autoDodge(client: LilithClient, player: Player) {
	// @ts-ignore
	try {
		if (
			player.uuid === client.uuidShort ||
			client.partyMembers == null ||
			client.partyMembers.includes(player.username) ||
			(client.partyMembers.length > 1 && client.partyLeader !== client.username) ||
			client.nextGameDuel ||
			// || client.noDodgePlayers.includes(player.username.toLowerCase())
			!permission('lilith.autododge')
		)
			return
		// TODO: test

		if (client.location == null) return

		if (client.noDodgePlayers.includes(player.username.toLowerCase())) {
			Lilith.log.info(`Not dodging ${player.username} because they're on the no dodge list`)
			return
		}

		const gametype = client.location.serverType

		let dodgeFast = false

		let conditions: AutododgeNumericOptionHandler[]

		let configuration: {
			enabled: boolean
			requeue: boolean
			noStats: boolean
			mapsNew: MapsAutododgeOption
			players: PlayersAutododgeOption
		}

		if (gametype === 'SKYWARS') {
			dodgeFast = config().autododge.skywars.dodgeFast
			configuration = config().autododge.skywars
			conditions = skywarsConditions
		} else if (gametype === 'WOOL_GAMES') {
			dodgeFast = config().autododge.woolgames.dodgeFast
			configuration = config().autododge.woolgames
			conditions = woolConditions
		} else if (gametype === 'MURDER_MYSTERY') {
			dodgeFast = config().autododge.murdermystery.dodgeFast
			configuration = config().autododge.murdermystery
			conditions = mmConditions
		} else return

		if (!configuration.enabled) return

		let shouldDodge = false
		let dodgeReason = ''

		if (
			permission('lilith.autododge.players.whitelist') &&
			configuration.players.whitelist.enabled &&
			configuration.players.whitelist.players !== ''
		) {
			let included = false
			for (const s of configuration.players.whitelist.players.split(',').map((m) => m.trim())) {
				if (s.toLowerCase() === player.username.toLowerCase()) included = true
			}

			if (!included) {
				shouldDodge = true
				dodgeReason = `the player &c${player.username}&7 because they're not on your whitelist.`
			}
		} else if (
			permission('lilith.autododge.players.blacklist') &&
			configuration.players.blacklist.enabled &&
			configuration.players.blacklist.players !== ''
		) {
			let included = false
			for (const s of configuration.players.blacklist.players.split(',').map((m) => m.trim())) {
				if (s.toLowerCase() === player.username.toLowerCase()) included = true
			}

			if (included) {
				shouldDodge = true
				dodgeReason = `the player &c${player.username}&7 because they're on your blacklist.`
			}
		}

		if (!shouldDodge) {
			const gamemode = locationToGamemode(client.location) == null ? 'overall' : locationToGamemode(client.location).split(',')[0]
			const stats: StatsWithGamemode = {
				stats: player,
				gamemode,
			}

			for (const handler of conditions) {
				const conf = handler.configPath()
				const value = handler.value(stats)

				// Check if the condition is met
				if (conf.lowestEnabled && value < Number(conf.lowest)) {
					shouldDodge = true
					dodgeReason = handler.reasons.lowest(player.username, stats)
				} else if (conf.highestEnabled && value > Number(conf.highest)) {
					shouldDodge = true
					dodgeReason = handler.reasons.highest(player.username, stats)
				} else {
					if (!permission('lilith.autododge.conditions')) continue
					if (conf.conditionEnabled && conf.condition !== '' && jexl.evalSync(conf.condition, handler.context(stats))) {
						shouldDodge = true
						dodgeReason = handler.reasons.condition(player.username, stats)
					}
				}
			}
		}

		if (dodgeFast && shouldDodge) {
			dodge(client, dodgeReason)
		} else {
			client.gameInfo.dodgeResults.push({
				username: player.username,
				shouldDodge,
				reason: dodgeReason,
			})
		}
	} catch (err) {
		Lilith.log.error(`The autododge handler failed with the reason ${err}`)
	}
}

locationEmitter.onWithReason('location', 'autododge maps', (location: HypixelLocation, client: LilithClient) => {
	if (isLobby(location) || location.map == null || !permission('lilith.autododge')) return
	const gametype = location.serverType
	Lilith.log.trace(gametype)

	let configuration: {
		enabled: boolean
		requeue: boolean
		mapsNew: MapsAutododgeOption
	}

	switch (gametype) {
		case 'SKYWARS':
			configuration = config().autododge.skywars
			break
		case 'WOOL_GAMES':
			configuration = config().autododge.woolgames
			break
		case 'BEDWARS':
			configuration = config().autododge.bedwars
			break
		case 'DUELS':
			configuration = config().autododge.duels
			break
		default:
			return
	}

	if (!configuration.enabled) return

	Lilith.log.trace(configuration.mapsNew.whitelist.maps)
	Lilith.log.trace(location.map)
	if (
		permission('lilith.autododge.maps.whitelist') &&
		configuration.mapsNew.whitelist.enabled &&
		configuration.mapsNew.whitelist.maps != null &&
		!configuration.mapsNew.whitelist.maps
			.split(',')
			.map((m) => m.trim())
			.includes(location.map)
	) {
		dodge(client, `the map &c${location.map}&7 because it's not on your whitelist.`)
	} else if (
		permission('lilith.autododge.maps.blacklist') &&
		configuration.mapsNew.blacklist.enabled &&
		configuration.mapsNew.blacklist.maps != null &&
		configuration.mapsNew.blacklist.maps
			.split(',')
			.map((m) => m.trim())
			.includes(location.map)
	) {
		dodge(client, `the map &c${location.map}&7 because it's on your blacklist.`)
	}
})

export function dodge(client: LilithClient, reason: string) {
	if (client.gameInfo.started) {
		chat(client, `&cLilith &8> &7Tried and failed before game start to dodge ${reason}`)
		Lilith.msg(`Tried and failed before game start to dodge ${new ChatMessage(MessageBuilder.fromString(reason.replace(/&7/g, '&f'))).toAnsi()}`)
		return
	}
	if (!client.gameInfo.dodged) {
		client.gameInfo.dodged = true
		client.gameInfo.dodgeReason = reason
		chat(client, `&cLilith &8> &7Dodged ${reason}`)
		Lilith.msg(`\u001b[38;5;27m┃\u001b[0m Dodged ${new ChatMessage(MessageBuilder.fromString(reason.replace(/&7/g, '&f'))).toAnsi()}`)
		lilithWebsocket.send<'dodge'>('dodge', undefined)
	}
}

export function dodgeNick(client: LilithClient, nick: string, real?: string) {
	Lilith.log.trace('Dodging nick')
	if (!permission('lilith.autododge.nicks')) return
	// console.log('permission')
	const gametype = client.location.serverType
	if (real != null) {
		if (supportedGametypes.includes(gametype)) {
			client.nextPlayer(real)
		}
		if (gametype === 'WOOL_GAMES' && config().queuestats.gamemodes.woolgames.autoWho) {
			chat(client, `&b&lONLINE: &r&7${real}`)
		}
	}

	let configuration: {
		enabled: boolean
		noStats: boolean
	}

	if (gametype === 'SKYWARS') {
		configuration = config().autododge.skywars
	} else if (gametype === 'WOOL_GAMES') {
		configuration = config().autododge.woolgames
	} else return

	if (!configuration.enabled || !configuration.noStats) return

	client.gameInfo.dodgeResults.push({
		shouldDodge: true,
		reason: `&c${nick}&7 because they're nicked. To avoid this for a party member, add them to nicknames in the launcher.`,
		username: nick,
	})
}

interface MapsAutododgeOption {
	whitelist: {
		enabled: boolean
		maps: string
	}
	blacklist: {
		enabled: boolean
		maps: string
	}
}

interface PlayersAutododgeOption {
	whitelist: {
		enabled: boolean
		players: string
	}
	blacklist: {
		enabled: boolean
		players: string
	}
}

export interface AutododgeResults {
	username: string
	shouldDodge: boolean
	reason: string
}

export interface AutododgeNumericOptionHandler {
	configPath: () => NumericAutododgeOption
	value: (stats: StatsWithGamemode) => any
	context: (stats: StatsWithGamemode) => any
	reasons: {
		lowest: (targetName: string, stats: StatsWithGamemode) => string
		highest: (targetName: string, stats: StatsWithGamemode) => string
		condition: (targetName: string, stats: StatsWithGamemode) => string
	}
}

export interface StatsWithGamemode {
	gamemode: string
	stats: Player
}

interface NumericAutododgeOption {
	enabled: boolean
	lowestEnabled: boolean
	lowest: number
	highestEnabled: boolean
	highest: number
	conditionEnabled: boolean
	condition: string
}
