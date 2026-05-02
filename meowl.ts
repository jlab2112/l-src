import type { LilithClient } from '@/client'
import { registerCommand } from '@/commands/handler'
import { Ids } from '@/types/packets/minecraft/ids'
import { writePacket } from '@/types/packets/minecraft/packets'

registerCommand('meowl', [], {
	execute: async (client: LilithClient) => {
		await writePacket(client, 'toClient', {
			metadata: {
				name: 'named_sound_effect',
				id: Ids.Play.toClient.named_sound_effect,
				state: 'play',
			},
			data: {
				soundName: 'mob.cat.meow',
				x: client.position.x,
				y: client.position.y,
				z: client.position.z,
				volume: 1,
				pitch: 63,
			},
		})
	},
})
