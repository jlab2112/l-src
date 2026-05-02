import { clearInterval } from 'node:timers'
import { setTimeout as setTimeoutAsync } from 'node:timers/promises'
import type { LilithClient } from '@/client.js'
import { lobby } from '@/commands/implementations/misc/limbo.js'
import { requeue } from '@/commands/implementations/game/requeue.js'
import config from '@/config.js'
import { addAsyncListener } from '@/events.js'
import { dodge } from '@/queuestats/autododge.js'
import { isLobby } from '@/queuestats/queuestats.js'
import type { HypixelLocation } from '@/types/HypixelLocation.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, TitleAction, writePacket } from '@/types/packets/minecraft/packets.js'
import { chat, title } from '@/utils/chat.js'
import { waitFor } from '@/utils/events.js'
import { permission } from '@/utils/permissions.js'
import gameEmitter from './emitters/gameEmitter.js'
import { locationEmitter, partyEmitter } from './emitters/locrawEmitter.js'

gameEmitter.on('timer', (client: LilithClient, time: number) => {
	if (time === 3) {
		if (client.location == null || !['WOOL_GAMES', 'SKYWARS'].includes(client.location.serverType)) return
		for (const result of client.gameInfo.dodgeResults) {
			if (result.shouldDodge) {
				dodge(client, result.reason)
			}
		}
	}
})

function shouldRequeue(client: LilithClient): boolean {
	if (!permission('lilith.autododge.requeue')) return false

	return (client.location.serverType === 'SKYWARS' && config().autododge.skywars.requeue) ||
		(client.location.serverType === 'DUELS' && config().autododge.duels.requeue) ||
		(client.location.serverType === 'BEDWARS' && config().autododge.bedwars.requeue) ||
		(client.location.serverType === 'WOOL_GAMES' && config().autododge.woolgames.requeue);

}

addAsyncListener<PacketEvent<Play.toClient.LoginPacket>>(Ids.Play.toClient.login, 'toClient', 'Add dodge interval', 10, async ({ client }) => {
	if (client.dodgeInterval == null) {
		// Dodge interval is an annoying way to get around import hell and dodging when you're in a lobby
		client.dodgeInterval = setInterval(() => {
			if (client.gameInfo.dodged && client.gameInfo.dodgeReason !== '') {
				Lilith.log.notice(`dodged is ${client.gameInfo.dodged} dodgeReason is "${client.gameInfo.dodgeReason}"`)
				client.gameInfo.dodgeReason = ''
				if (client.location == null) {
					waitFor('location', locationEmitter).then(([_, event]) => {
						const [_location, client]: [location: HypixelLocation, client: LilithClient] = event
						if (client.location.serverName.includes('lobby') || client.location.lobbyName != null) return
						if (shouldRequeue(client)) {
							client.autododgeRedirect = '/rq'
						} else client.autododgeRedirect = 'none'
						lobby(client)
					})
				} else {
					if (client.location.serverName.includes('lobby') || client.location.lobbyName != null) return
					Lilith.log.info('Re-queued')
					if (shouldRequeue(client)) {
						client.autododgeRedirect = '/rq'
					} else client.autododgeRedirect = 'none'
					lobby(client)
				}
			}
		}, 100)
	}
})

async function countdownTitle(client: LilithClient, seconds: string | number) {
	await title(client, {
		title: `&cRequeueing in ${seconds}`,
		subtitle: '&7Do /nrq to cancel',
		fadeInTicks: 0, // ticks cause lyme disease
		stayTicks: 990,
		fadeOutTicks: 10,
	})
}

async function warp(client: LilithClient) {
	await setTimeoutAsync(200)
	await writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
		metadata: {
			name: 'chat',
			state: 'play',
			id: Ids.Play.toServer.chat,
		},
		data: {
			message: '/p warp',
		},
	})
	await setTimeoutAsync(250)
	await writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
		metadata: {
			name: 'chat',
			state: 'play',
			id: Ids.Play.toServer.chat,
		},
		data: {
			message: '/p warp',
		},
	})
}

function shouldWarp(client: LilithClient) {
	if (!permission('lilith.autododge.warp')) return false
	if (
		(client.lastGame.serverType === 'SKYWARS' && config().autododge.skywars.warpParty) ||
		(client.lastGame.serverType === 'DUELS' && config().autododge.duels.warpParty)
	)
		return true
}

locationEmitter.onWithReason('location', 'Autododge Redirect', async (location: HypixelLocation, client: LilithClient) => {
	if (isLobby(location)) {
		if (client.autododgeRedirect !== '') {
			const redirect = client.autododgeRedirect
			client.autododgeRedirect = ''

			if (shouldWarp(client)) {
				if (client.partyMembers == null) {
					partyEmitter.once('party', () => {
						if (client.partyMembers.length > 1 && client.partyLeader === client.username) warp(client)
					})
				} else {
					if (client.partyMembers.length > 1 && client.partyLeader === client.username) warp(client)
				}
			}

			if (redirect === 'none') return

			await writePacket<Play.toClient.TitlePacket>(client, 'toClient', {
				metadata: {
					name: 'title',
					state: 'play',
					id: Ids.Play.toClient.title,
				},
				data: {
					action: 4,
				},
			})
			client.autododgeRedirectStage = 4

			client.requeueInterval = setInterval(() => {
				if (client.autododgeRedirectStage === 0) {
					writePacket<Play.toClient.TitlePacket>(client, 'toClient', {
						metadata: {
							name: 'title',
							state: 'play',
							id: Ids.Play.toClient.title,
						},
						data: {
							action: TitleAction.Reset,
						},
					})
					clearInterval(client.requeueInterval)

					if (redirect === '/rq') return requeue(client)
					writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
						metadata: {
							name: 'chat',
							state: 'play',
							id: Ids.Play.toServer.chat,
						},
						data: {
							message: redirect,
						},
					})
				} else {
					countdownTitle(client, client.autododgeRedirectStage)
					chat(client, `&cLilith &8> &7Requeueing in &c${client.autododgeRedirectStage} &7seconds... (Do &c/nrq &7to cancel)`)
				}
				client.autododgeRedirectStage--
			}, 1000)
		}
	}
})

//this is the thing in the console
locationEmitter.onWithReason('location', 'queuestats mode header', (location: HypixelLocation) => {
	if (isLobby(location)) return

	const gametype = location.serverType

	let configuration: {
		enabled?: boolean
		chatEnabled?: boolean
	}

	if (gametype === 'DUELS') {
		configuration = config().queuestats.gamemodes.duels
		if (!configuration.enabled) return
	} else if (gametype === 'WOOL_GAMES') {
		configuration = config().queuestats.gamemodes.woolgames
		if (!configuration.chatEnabled) return
	} else if (location.mode !== void 0 && location.mode === 'BEDWARS_TWO_ONE_DUELS') {
		configuration = config().queuestats.gamemodes.duels
		if (!configuration.enabled) return
	} else return

	Lilith.msg(`\u001b[38;5;27m┏━━━━━━━━━━━━━━━━\u001b[0m ${modesPrettyPrint[location.mode]}`)
})

const modesPrettyPrint = {
	DUELS_CLASSIC_DUEL: 'Classic Duel',
	DUELS_SW_DUEL: 'Skywars Duel',
	DUELS_SW_DOUBLES: 'Skywars 2v2 Duel',
	DUELS_BOW_DUEL: 'Bow Duel',
	DUELS_UHC_DUEL: 'UHC Duel',
	DUELS_UHC_DOUBLES: 'UHC 2v2 Duel',
	DUELS_UHC_FOUR: 'UHC 4v4 Duel',
	DUELS_UHC_MEETUP: 'UHC Meetup',
	DUELS_POTION_DUEL: 'Nodebuff Duel',
	DUELS_COMBO_DUEL: 'Combo Duel',
	DUELS_OP_DUEL: 'OP Duel',
	DUELS_OP_DOUBLES: 'OP 2v2 Duel',
	DUELS_MW_DUEL: 'Mega Walls Duel',
	DUELS_MW_DOUBLES: 'Mega Walls 2v2 Duel',
	DUELS_SUMO_DUEL: 'Sumo Duel',
	DUELS_BLITZ_DUEL: 'Blitz Duel',
	DUELS_BOWSPLEEF_DUEL: 'Bowspleef Duel',
	DUELS_BRIDGE_DUEL: 'Bridge Duel',
	DUELS_BRIDGE_DOUBLES: 'Bridge Doubles',
	DUELS_BRIDGE_THREES: 'Bridge Threes',
	DUELS_BRIDGE_FOUR: 'Bridge Four',
	DUELS_BRIDGE_2V2V2V2: 'Bridge 2v2v2v2',
	DUELS_BRIDGE_3V3V3V3: 'Bridge 3v3v3v3',
	DUELS_CAPTURE_DUEL: 'Capture Duel',
	DUELS_CAPTURE_THREES: 'Capture 3v3 Duel',
	DUELS_BOXING_DUEL: 'Boxing Duel',
	DUELS_PARKOUR_EIGHT: 'Parkour Duel',
	wool_wars_two_four: 'Wool Wars',
	sheep_wars_two_six: 'Sheep Wars',
	BEDWARS_TWO_ONE_DUELS: 'Bedwars Duel',
	BEDWARS_TWO_ONE_DUELS_RUSH: 'Bedwars Rush Duel',
	DUELS_SPLEEF_DUEL: 'Spleef Duel',
	DUELS_QUAKE_DUEL: 'Quake Duel',
}
