import { setTimeout as timer } from 'node:timers/promises'
import { ChatMessage } from 'prismarine-chat'
import type { LilithClient } from '@/client.js'
import config from '@/config.js'
import { addAsyncListener } from '@/events.js'
import log from '@/log.js'
import { dodgeNick } from '@/queuestats/autododge.js'
import store from '@/store.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, PlayerInfoAction, writePacket } from '@/types/packets/minecraft/packets.js'
import { chatString } from '@/utils/chat.js'
import { waitFor } from '@/utils/events.js'
import { permission } from '@/utils/permissions.js'
import gameEmitter from './emitters/gameEmitter'
import { locationEmitter } from './emitters/locrawEmitter.js'

let currentlyDenicked = []

let fakeUsernames = [
	'Pickguard',
	'MysticGamerMan',
	'Tactful',
	'Blasteryaya',
	'SafeDrift48',
	'theBLRxx',
	'Ho_Bot',
	'theBLRxx',
	'2807',
	'Syleex',
	'Violetskyzz',
	'The_Hoster_Man',
	'roro___',
	'MHF_Mineskin',
	'Hotampa',
	'DannoBanannoXD',
	'08BED5',
	'YaOOP',
	'Miculgames',
	'MineSkin_org',
	'Megakloon',
	'AnonimYTT',
	'Mangow_',
	'Echorra',
	'imtrashsogoez',
	'Bobinho_',
	'Mangow_',
	'Yeleha',
	'DoubleDeltas',
]
;(async () => {
	try {
		const r = await (
			await fetch('https://raw.githubusercontent.com/lilithmod/assets/refs/heads/master/denick-exclusions.json')
		).json()

		fakeUsernames = r
	} catch (e) {
		log.error('Something went wrong while loading denicking exclusions:')
		log.raw(e.toString(), 'ERR')
	}
})()

addAsyncListener<PacketEvent<Play.toClient.PlayerInfoPacket>>(
	Ids.Play.toClient.player_info,
	'toClient',
	'Player Denicker',
	3,
	async ({ client, packet }) => {
		if (!permission('lilith.denicker.local')) return
		if (packet.data.action === PlayerInfoAction.AddPlayer) {
			for (const player of packet.data.data) {
				if (!currentlyDenicked.includes(player.name)) {
					currentlyDenicked.push(player.name)
				} else continue
				if (store().nicknames[player.name.toLowerCase()] != null) continue
				if (player.UUID.length > 16 && player.UUID.substring(14, 15) === '1') {
					const decodedValue: {
						timestamp: number
						profileId: string
						profileName: string
						signatureRequired: boolean
						textures: {
							SKIN?: {
								url: string
							}
							CAPE?: {
								url: string
							}
						}
					} = JSON.parse(Buffer.from(player.properties[0].value, 'base64').toString('utf-8'))

					if (client.location == null) await waitFor('location', locationEmitter)
					if (client.location.serverType === 'DUELS') await timer(400)

					if (
						decodedValue.profileId === player.UUID ||
						fakeUsernames.includes(decodedValue.profileName) ||
						fakeUsernames.includes(decodedValue.profileId)
					) {
						chatString(client, `&cLilith&r &8> &7Nicked player: &c${player.name}`)
						dodgeNick(client, player.name)
						updatePlayerDisplayName(client, player.name, player.UUID, `&c[NICK] &7${player.name}`)
					} else {
						if (decodedValue.profileName === '__notahuman__') continue
						chatString(client, `&cLilith&r &8> &c${decodedValue.profileName} &7is nicked as &c${player.name}!`)
						client.nicksToReal.set(player.name, decodedValue.profileId)
						updatePlayerDisplayName(
							client,
							player.name,
							player.UUID,
							`&c[NICK] &7${decodedValue.profileName} (${player.name}) `,
						)
						dodgeNick(client, player.name, decodedValue.profileId)
					}
				}
			}
		}
	},
)

function shouldUpdatePlayerDisplayName(client: LilithClient) {
	if (client.location == null) return false
	if (
		client.location.serverType === 'BEDWARS' &&
		config().queuestats.gamemodes.bedwars.enabled &&
		permission('lilith.queuestats.bedwars')
	)
		return true
	if (
		client.location.serverType === 'SKYWARS' &&
		config().queuestats.gamemodes.skywars.enabled &&
		permission('lilith.queuestats.skywars')
	)
		return true
	return (
		client.location.serverType === 'WOOL_GAMES' &&
		config().queuestats.gamemodes.woolgames.enabled &&
		permission('lilith.queuestats.wool')
	)
}

function updatePlayerDisplayName(client: LilithClient, _username: string, uuid: string, display: string) {
	if (!shouldUpdatePlayerDisplayName(client)) return

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
					UUID: uuid,
					displayName: JSON.stringify(new ChatMessage(display.replace(/&/g, '§')).json),
				},
			],
		},
	})

	gameEmitter.once('start', () => {
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
						UUID: uuid,
						displayName: undefined,
					},
				],
			},
		})
	})
}

addAsyncListener<PacketEvent<Play.toClient.LoginPacket>>(
	Ids.Play.toClient.login,
	'toClient',
	'Denicking Helper',
	5,
	async () => {
		currentlyDenicked = []
	},
)
