import { Player } from '@lilithmod/unborn-hypixel'
import {
	type AllModes,
	type ArcadeMode,
	type BarBlocksBuilder,
	type BedWarsMode,
	type DuelsMode,
	getArcadeBlocks,
	getBWBlocks,
	getDuelsBlocks,
	getMMBlocks,
	getOverallBlocks,
	getSWBlocks,
	getTNTGamesBlocks,
	getWoolBlocks,
	type MurderMysteryMode,
	type RenderOptions,
	type SkywarsMode,
	type TNTGamesModes,
	type WoolGamesMode,
} from '@lilithmod/unborn-statgen'
import { ChatMessage, type Color, MessageBuilder } from 'prismarine-chat'
import type { LilithClient } from '@/client'
import config from '@/config.js'
import { statsLog } from '@/log'
import { getRankFromUsername } from '@/ranks/ranks'
import type { HypixelLocation } from '@/types/HypixelLocation'
import { chat, chatJson } from '@/utils/chat'
import { isStreamerMode, permission } from '@/utils/permissions'
import { getTags, type tagObject } from '@/utils/tags'
import lilithWebsocket from '@/websocket/socket'
import { fetchStats } from './fetchStats'

const renderOptions: RenderOptions = {
	blockNameColor: 'white',
	defaultBlockValueColor: 'gray',
	colons: true,
	commas: true,
	commasEndLines: true,
}

export interface Options {
	shouldHideStreamer?: boolean
	showErrorFetchMessage?: boolean
}

const showLosses = (): boolean => !config().queuestats.gamemodes.duels.legacyStatsMessage

const getStatsMessage = (gm: AllModes, prefix: string, suffix: string): BarBlocksBuilder => {
	const baseOptions: { barColor: Color; suffix: string; prefix: string } = {
		prefix,
		suffix,
		barColor: 'blue',
	}
	const handlers = {
		arcade: (mode: ArcadeMode) => getArcadeBlocks(mode, { barColor: 'blue' }),
		duels: (mode: DuelsMode) =>
			getDuelsBlocks(mode, {
				barColor: 'blue',
				showGoals: true,
				showProgression: false,
				showTitle: false,
				showKills: false,
				showLosses: showLosses(),
				showWinstreak: true,
				prefix,
				suffix,
			}),
		bedwars: (mode: BedWarsMode) => getBWBlocks(mode, baseOptions),
		overall: () => getOverallBlocks(baseOptions),
		woolgames: (mode: WoolGamesMode) => getWoolBlocks(mode, baseOptions),
		skywars: (mode: SkywarsMode) => getSWBlocks(mode, baseOptions),
		murdermystery: (mode: MurderMysteryMode) => getMMBlocks(mode, baseOptions),
		tntgames: (mode: TNTGamesModes) => getTNTGamesBlocks(mode, baseOptions),
	}

	return handlers[gm.split('.')[0]](gm.split('.').slice(1).join('.'))
}

export async function generateStats(
	nameOrUUID: string,
	gamemodes: string,
	client: LilithClient,
	options: Options = { shouldHideStreamer: false, showErrorFetchMessage: false },
	player?: Player,
) {
	Lilith.log.info(`Generating stats message for: ${nameOrUUID}. In gamemode: ${gamemodes}.`)

	if (config().general.apiKey === '' && !config().general.useApiKeyLess) {
		Lilith.log.info('Invalid API Key! (null)')
		chat(
			client,
			'&cLilith &8> &7Your API key is invalid! Do &c/lilith api set &l<key> &r&7or add your key to the config!',
		)
		return
	}

	if (player == null) {
		const rawPlayer = await fetchStats(nameOrUUID, 'generateStats', client, 'player', options.showErrorFetchMessage)

		lilithWebsocket.send<'hypixelApiRequestReport'>('hypixelApiRequestReport', {
			endpoint: `https://api.hypixel.net/player?uuid=${nameOrUUID}`,
		})
		if (rawPlayer === null || rawPlayer === undefined) return

		player = new Player(rawPlayer)
	}

	for (let i = 0; i < gamemodes.split(',').length; i++) {
		const gamemode: AllModes = gamemodes.split(',')[i] as AllModes

		let tagData: tagObject = { formatted: '', extra: { text: undefined } }
		tagData = await getTags(client, player.uuid)

		const customRank = getRankFromUsername(player.username)
		let prefix = ''
		if (config().general.ranks.enabled && config().general.ranks.statChecking && customRank != null) {
			prefix = `§${customRank.color}[${customRank.prefix}] `
		}

		const message = getStatsMessage(gamemode, prefix, tagData.formatted).render(player, renderOptions)
		if (options.shouldHideStreamer && isStreamerMode()) {
			Lilith.msg(new ChatMessage(MessageBuilder.fromString(message, { colorSeparator: '&' })).toAnsi())
			continue
		}

		statsLog.write(`Stats logged at ${new Date().toString()}\n`)
		statsLog.write(`${new ChatMessage(MessageBuilder.fromString(message, { colorSeparator: '&' })).toString()}`)
		if (tagData.extra.text === '') {
			chatJson(client, [
				'',
				{
					text: message.replaceAll('&', '§'),
					hoverEvent: {
						action: 'show_text',
						value: tagData.extra,
					},
				},
			])
			// console.log(
			// 	JSON.stringify([
			// 		'',
			// 		{
			// 			text: message.replaceAll('&', '§'),
			// 			hoverEvent: {
			// 				action: 'show_text',
			// 				value: tagData.extra,
			// 			},
			// 		},
			// 	]),
			// )
			return
		}

		chat(client, message)
	}
}

// TODO: themes

export function locationToGamemode(location: HypixelLocation): string | null {
	const converted = locationToGamemodeConvertor(location)

	if (location == null) return 'overall'
	if (location.serverName.includes('lobby')) return serverToGamemode(location)
	if (location.serverType === 'DUELS') {
		const gms: string[] = []
		if (permission('lilith.queuestats.duels.generalStats') && config().queuestats.gamemodes.duels.showGeneralStats)
			gms.push('overall')
		if (config().queuestats.gamemodes.duels.showOverallStats) gms.push('duels.overall')
		if (config().queuestats.gamemodes.duels.showModeStats) gms.push(converted)
		return gms.join(',')
	}

	if (location.serverType === 'BEDWARS') return converted === 'overall' ? 'bedwars.overall' : converted
	if (location.serverType === 'SKYWARS') return 'skywars.overall'
	return converted
}

function serverToGamemode(location: HypixelLocation) {
	switch (location.serverType) {
		case 'BEDWARS':
			return 'bedwars.overall'
		case 'SKYWARS':
			return 'skywars.overall'
		case 'DUELS':
			return 'duels.overall'
		case 'MURDER_MYSTERY':
			return 'murdermystery.overall'
		case 'WOOL_GAMES':
			return 'woolwars'
		default:
			return 'overall'
	}
}
export function locationToGamemodeConvertor(location: HypixelLocation, realGM = false): AllModes {
	switch (location.mode) {
		case 'wool_wars_two_four':
			return 'woolgames.woolwars'
		case 'sheep_wars_two_six':
			return 'woolgames.sheepwars'
		case 'DUELS_CLASSIC_DUEL':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.classic.overall'
				: 'duels.classic.solo'
		case 'DUELS_CLASSIC_DOUBLES':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.classic.overall'
				: 'duels.classic.doubles'
		case 'DUELS_SW_DUEL':
			return 'duels.skywars.overall'
		case 'DUELS_SW_DOUBLES':
			return 'duels.skywars.overall'
		case 'DUELS_BOW_DUEL':
			return 'duels.bow'
		case 'DUELS_UHC_DUEL':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.uhc.overall'
				: 'duels.uhc.solo'
		case 'DUELS_UHC_DOUBLES':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.uhc.overall'
				: 'duels.uhc.doubles'
		case 'DUELS_UHC_FOUR':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.uhc.overall'
				: 'duels.uhc.fours'
		case 'DUELS_UHC_MEETUP':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.uhc.overall'
				: 'duels.uhc.deathmatch'
		case 'DUELS_POTION_DUEL':
			return 'duels.nodebuff'
		case 'DUELS_COMBO_DUEL':
			return 'duels.combo'
		case 'DUELS_OP_DUEL':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM ? 'duels.op.overall' : 'duels.op.solo'
		case 'DUELS_OP_DOUBLES':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.op.overall'
				: 'duels.op.doubles'
		case 'DUELS_MW_DUEL':
			return 'duels.megawalls'
		case 'DUELS_SUMO_DUEL':
			return 'duels.sumo'
		case 'DUELS_BLITZ_DUEL':
			return 'duels.blitzsg'
		case 'DUELS_BOWSPLEEF_DUEL':
			return 'duels.spleef.bowSpleef'
		case 'DUELS_BRIDGE_DUEL':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.bridge.overall'
				: 'duels.bridge.solo'
		case 'DUELS_BRIDGE_DOUBLES':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.bridge.overall'
				: 'duels.bridge.doubles'
		case 'DUELS_BRIDGE_FOUR':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.bridge.overall'
				: 'duels.bridge.fours'
		case 'DUELS_BRIDGE_THREES':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.bridge.overall'
				: 'duels.bridge.threes'
		case 'DUELS_SPLEEF_DUEL':
			return 'duels.spleef.spleef'
		case 'DUELS_BOXING_DUEL':
			return 'duels.boxing'
		case 'DUELS_QUAKE_DUEL':
			return 'duels.quake'
		case 'DUELS_PARKOUR_EIGHT':
			return 'duels.parkour'
		case 'BEDWARS_EIGHT_ONE':
			return 'bedwars.solo'
		case 'solo_insane':
			return 'skywars.solo'
		case 'MURDER_CLASSIC':
			return config().queuestats.gamemodes.murdermystery.showOverallStats && !realGM
				? 'murdermystery.overall'
				: 'murdermystery.classic'
		case 'MURDER_DOUBLE_UP':
			return config().queuestats.gamemodes.murdermystery.showOverallStats && !realGM
				? 'murdermystery.overall'
				: 'murdermystery.doubleUp'
		case 'MURDER_ASSASSINS':
			return config().queuestats.gamemodes.murdermystery.showOverallStats && !realGM
				? 'murdermystery.overall'
				: 'murdermystery.assassins'
		case 'MURDER_INFECTION':
			return config().queuestats.gamemodes.murdermystery.showOverallStats && !realGM
				? 'murdermystery.overall'
				: 'murdermystery.infection'
		case 'BEDWARS_TWO_ONE_DUELS':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.bedwars.overall'
				: 'duels.bedwars.bedwars'
		case 'BEDWARS_TWO_ONE_DUELS_RUSH':
			return config().queuestats.gamemodes.duels.showModeOverallStats && !realGM
				? 'duels.bedwars.overall'
				: 'duels.bedwars.rush'
		case 'CAPTURE':
			return 'tntgames.wizards'
		case 'TNTAG':
			return 'tntgames.tntTag'
		case 'PVPRUN':
			return 'tntgames.pvpRun'
		case 'BOWSPLEEF':
			return 'tntgames.bowSpleef'
		case 'TNTRUN':
			return 'tntgames.tntRun'
		default:
			return 'overall'
	}
}
