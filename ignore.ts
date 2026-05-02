import { registerCommand } from '@/commands/handler'
import { Ids } from '@/types/packets/minecraft/ids'
import { Play, writePacket } from '@/types/packets/minecraft/packets'

import ChatPacket = Play.toServer.ChatPacket

/**
 * Filename: ignore.mdx
 * Command: ignore
 * Byline: Block List helper
 * Usage: `/i <player>`
 * Added: 2.0.0
 *
 * Description:
 * This command shortcuts Hypixel's `/block add <player>`.
 */

registerCommand('ignore', ['i'], {
	execute: (client, raw, _) => {
		const arg = raw.split(' ')[1].toLowerCase()

		let command: string

		if (arg === 'removeall') {
			command = '/block removeall'
		} else if (arg === 'list' || arg === 'add' || arg === 'remove') {
			const target = raw.split(' ').length === 2 ? '' : (raw.split(' ')[2] ?? arg)
			command = `/block ${arg} ${target}`
		} else if (arg === 'help' || raw.split(' ').length === 1) command = '/block help'
		else {
			const target = raw.split(' ').length === 2 ? '' : (raw.split(' ')[2] ?? arg)
			command = `/block add ${arg} ${target}`
		}

		writePacket<ChatPacket>(client, 'toServer', {
			metadata: {
				name: 'chat',
				state: 'play',
				id: Ids.Play.toServer.chat,
			},
			data: {
				message: command,
			},
		})
	},
})
