import type { Player } from '@lilithmod/unborn-hypixel'
import type { LilithClient } from '@/client.js'
import config from '@/config.js'
import { generateStats, locationToGamemode } from '@/stats/getStatsMessage'
import { chat } from '@/utils/chat'
import { permission } from '@/utils/permissions.js'

export function chatStats(client: LilithClient, player: Player) {
	try {
		if (client.location == null || !permission('lilith.queuestats') || !permission('lilith.queuestats.chat')) return
		const gametype = client.location.serverType
		let configuration: {
			enabled?: boolean
			chatEnabled?: boolean
			showOwnStats: boolean
			showPartyStats: boolean
		}

		if (gametype === 'DUELS') {
			configuration = config().queuestats.gamemodes.duels
			if (!configuration.enabled || !permission('lilith.queuestats.duels')) return
		} else if (gametype === 'WOOL_GAMES') {
			configuration = config().queuestats.gamemodes.woolgames
			if (!configuration.chatEnabled || !permission('lilith.queuestats.wool')) return
		} else if (gametype === 'BEDWARS') {
			configuration = config().queuestats.gamemodes.bedwars
			if (!configuration.chatEnabled || !permission('lilith.queuestats.bedwars')) return
		} else if (gametype === 'MURDER_MYSTERY') {
			configuration = config().queuestats.gamemodes.murdermystery
			if (!configuration.enabled || !permission('lilith.queuestats.murdermystery')) return
		} else if (gametype === 'TNT GAMES') {
			configuration = config().queuestats.gamemodes.tntgames
			if (!configuration.enabled || !permission('lilith.queuestats.tntgames')) return
		} else return

		const blacklist = []
		const uuidBlacklist = []
		if (!configuration.showOwnStats || !permission('lilith.queuestats.self')) {
			blacklist.push(client.username)
			uuidBlacklist.push(client.uuidShort)
		}
		if (!configuration.showPartyStats || !permission('lilith.queuestats.party'))
			blacklist.push(...client.partyMembers.filter((m) => m !== client.username))

		if (!blacklist.includes(player.username) && !uuidBlacklist.includes(player.uuid)) {
			try {
				const gamemode = locationToGamemode(client.location) == null ? 'overall' : locationToGamemode(client.location)
				generateStats(player.uuid, gamemode, client, { shouldHideStreamer: true }, player).then(() => {
					if (['duels', 'bedwars', 'woolgames', 'skywars', 'murdermystery', 'tntgames'].includes(gamemode.split('.')[0]))
						chat(
							client,
							permission('lilith.stats.sessionTime') &&
								config().queuestats.gamemodes[gamemode.split('.')[0]].lowSessionTime &&
								player.uuid !== client.uuidShort
								? Date.now() - player.status.lastLogin > 1000 * 60 * 5
									? ''
									: `&cLilith&r &8> &4${player.username} &7 has a low session time (< 5mins).`
								: '',
						)
				})
			} catch (e) {
				console.log(e)
				chat(client, `&cLilith &8> &7Failed to fetch stats for ${player.uuid}!`)
			}
		}
	} catch (err) {
		Lilith.error(`The chat stats handler failed with the reason ${err}`)
	}
}
