import type { LilithClient } from '@/client.js'
import config from '@/config.js'
import type { HypixelLocation } from '@/types/HypixelLocation.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import gameEmitter from '../emitters/gameEmitter.js'
import { locationEmitter } from '../emitters/locrawEmitter.js'

locationEmitter.onWithReason('location', 'autowho', (location: HypixelLocation, client) => {
	if (location.serverName.includes('lobby') || !['MURDER_MYSTERY', 'UHC', 'WALLS3', 'ARCADE', 'WOOL_GAMES'].includes(location.serverType)) return

	if (location.serverType === 'WOOL_GAMES' && config().queuestats.gamemodes.woolgames.autoWho)
		writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
			metadata: {
				name: 'chat',
				state: 'play',
				id: Ids.Play.toServer.chat,
			},
			data: {
				message: '/who',
			},
		})
})

gameEmitter.on('start', (client: LilithClient) => {
	if (client.location.serverType === 'BEDWARS' && config().queuestats.gamemodes.bedwars.autoWho) {
		writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
			metadata: {
				name: 'chat',
				state: 'play',
				id: Ids.Play.toServer.chat,
			},
			data: {
				message: '/who',
			},
		})
	}
})
