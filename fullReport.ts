import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import config from '@/config'
import { Ids } from '@/types/packets/minecraft/ids'
import { type Play, writePacket } from '@/types/packets/minecraft/packets'
import { chat } from '@/utils/chat'

/**
 * Filename: fullreport.mdx
 * Command: wdr
 * Byline: Fuly report a player.
 * Usage: `/wdr <player>`
 * Added: 2.0.0
 *
 * Description:
 * This command will automatically add `killaura autoclicker reach speed antik` as the reasons for your Hypixel watch-dog report.
 * You can disable this in the [panel](https://me.lilith.rip).
 */

registerCommand('wdr', [], {
	execute: async (client, raw, parsed) => {
		if (!config().chat.autoFullReport) {
			writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
				metadata: {
					name: 'chat',
					state: 'play',
					id: Ids.Play.toServer.chat,
				},
				data: {
					message: raw,
				},
			})
			return
		}
		const args = new lexure.Args(parsed)
		const target = args.single()
		if (target == null) {
			chat(client, '&cPlease specify a player you would like to report (/report playerName)')
			return
		}
		writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
			metadata: {
				name: 'chat',
				state: 'play',
				id: Ids.Play.toServer.chat,
			},
			data: {
				message: `/wdr ${target} killaura autoclicker reach speed antikb`,
			},
		})
	},
})
