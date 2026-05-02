import type { LilithClient } from '@/client'
import { registerCommand } from '@/commands/handler'
import { Ids } from '@/types/packets/minecraft/ids'
import { type Play, writePacket } from '@/types/packets/minecraft/packets'

/**
 * Filename: limbo.mdx
 * Command: limbo
 * Byline: Go into Hypixel's limbo lobby.
 * Usage: `/limbo`
 * Added: Before Full Release
 *
 * Description:
 * This command will take you into Hypixel's limbo lobby automatically, or make you exit limbo.
 */

registerCommand('limbo', [], {
	execute: async (client) => {
		if (client.location == null || client.location.serverName === 'limbo') {
			lobby(client)
		} else {
			limbo(client)
		}
	},
})

export function lobby(client: LilithClient) {
	writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
		metadata: {
			name: 'chat',
			state: 'play',
			id: Ids.Play.toServer.chat,
		},
		data: {
			message: '/limbo',
		},
	})
	writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
		metadata: {
			name: 'chat',
			state: 'play',
			id: Ids.Play.toServer.chat,
		},
		data: {
			message: '/lobby',
		},
	})
}

export function limbo(client: LilithClient) {
	writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
		metadata: {
			name: 'chat',
			state: 'play',
			id: Ids.Play.toServer.chat,
		},
		data: {
			message: '/limbo',
		},
	})
}
