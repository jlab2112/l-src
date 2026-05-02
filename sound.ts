import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import { Ids } from '@/types/packets/minecraft/ids'
import { writePacket } from '@/types/packets/minecraft/packets'

registerCommand('lsound', [], {
	execute: async (client, _raw, parsed) => {
		const args = new lexure.Args(parsed)
		const sound = args.single()
		const volume = Number.parseFloat(args.single() ?? '1')
		const pitch = Number.parseInt(args.single() ?? '63')

		await writePacket(client, 'toClient', {
			metadata: {
				name: 'named_sound_effect',
				id: Ids.Play.toClient.named_sound_effect,
				state: 'play',
			},
			data: {
				soundName: sound,
				x: client.position.x,
				y: client.position.y,
				z: client.position.z,
				volume: volume,
				pitch: pitch,
			},
		})
	},
})
