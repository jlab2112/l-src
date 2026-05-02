import { Player } from '@lilithmod/unborn-hypixel'
import chalk from 'chalk'
import type { LilithClient } from '@/client.js'
import config from '@/config.js'
import { chatStats } from '@/queuestats/chatstats'
import { tabStats } from '@/queuestats/tabstats'
import { fetchStats as fetchPlayerStats } from '@/stats/fetchStats.js'
import store from '@/store.js'
import type { HypixelLocation } from '@/types/HypixelLocation.js'
import { chat } from '@/utils/chat.js'
import { autoDodge } from './autododge.js'

export const supportedGametypes = ['DUELS', 'BEDWARS', 'SKYWARS', 'WOOL_GAMES', 'MURDER_MYSTERY', 'TNTGAMES']

export async function fetchStats(client: LilithClient, name: string) {
	try {
		// Wait until the player's location is updated
		const location = await new Promise<HypixelLocation>((resolve) => {
			const loop = () =>
				client.location !== null && client.location !== undefined ? resolve(client.location) : setTimeout(loop)
			loop()
		})
		if (isLobby(location)) return
		if (!supportedGametypes.includes(location.serverType)) return
		if (client.gameInfo.alreadyCheckedPlayers.includes(name)) return

		name = name === store().nickname ? store().nickname : (store().nicknames?.[name.toLowerCase()] ?? name)

		client.gameInfo.alreadyCheckedPlayers.push(name)
		Lilith.log.trace(client.gameInfo.alreadyCheckedPlayers)

		if (config().general.apiKey === '' && !config().general.useApiKeyLess) {
			Lilith.log.info('Invalid API Key! (null)')
			chat(
				client,
				'&cLilith &8> &7Your API key is invalid! Do &c/lilith api set &l<key> &r&7or add your key to the config!',
			)
			return
		}

		// Get data
		const raw = await hypixel(name, client)
		if (raw === undefined) throw new Error('nicked')
		if (raw === null) return
		const player = new Player(raw)

		// Start queuestats related stats
		autoDodge(client, player)
		chatStats(client, player)
		tabStats(client, player)
	} catch (e) {
		if (e.message === 'nicked') {
			Lilith.log.trace(`Fake Player: ${name}`)
		} else if (e.message === 'apikey') {
			Lilith.log.info('Invalid API Key!')
			chat(
				client,
				'&cLilith &8> &7Your API key is invalid! Do &c/lilith api set &l<key> &r&7or add your key to the config!',
			)
			return
		} else {
			Lilith.log.debug(e)
			Lilith.log.info(chalk.green('+'), `fake player ${name}`)
		}
	}
}

export function isLobby(location: HypixelLocation) {
	return location.serverName.includes('lobby') || location.lobbyName != null
}

async function hypixel(uuid: string, client: LilithClient) {
	const rawPlayer = await fetchPlayerStats(uuid, `queuestats:${uuid}`, client, 'player')

	if (rawPlayer == null) throw new Error('nicked')
	return rawPlayer
}
