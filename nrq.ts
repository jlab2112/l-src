import { registerCommand } from '@/commands/handler'
import { locationEmitter } from '@/listeners/emitters/locrawEmitter.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import { chat, chatPurchase } from '@/utils/chat.js'
import { permission } from '@/utils/permissions.js'

/**
 * Filename: nrq.mdx
 * Command: nrq
 * Byline: Stops you from requeueing after autododging.
 * Usage: `/nrq`
 * Added: Version 1.0 Alpha 6
 *
 * Description:
 *
 * This command will stop you from automatically requeueing after autododging. A Lilith Pro subscription is required.
 */

registerCommand('nrq', [], {
	execute: async (client, _raw, _parsed) => {
		if (!permission('lilith.autododge.requeue')) {
			chatPurchase(client, 'Autododge requeue', 'lilith.sub.t1')
			return
		}
		if (client.location == null) {
			locationEmitter.onceWithReason('location', 'wait for nrq', async () => {
				if (client.autododgeRedirectStage > 0) {
					client.autododgeRedirectStage = 0
					chat(client, '&cLilith &8> &7Requeue cancelled!')
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
				}
			})
		} else {
			if (client.autododgeRedirectStage > 0) {
				client.autododgeRedirectStage = 0
				chat(client, '&cLilith &8> &7Requeue cancelled!')
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
			}
		}
	},
})
