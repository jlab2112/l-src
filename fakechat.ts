import { registerCommand } from '@/commands/handler'
import { chat } from '@/utils/chat.js'

/**
 * Filename: fakechat.mdx
 * Command: fakechat
 * Byline: Send a fake chat message.
 * Usage: `/fakechat <message>`
 * Added: Before Full Release
 *
 * Description:
 * This command will send a fake chat message. All Bukkit color codes with `&` are supported. Multiple lines are also supported in one command with `\n`.
 */

registerCommand('fakechat', [], {
	execute: async (client, raw, _parsed) => {
		const lines = raw.substring(raw.indexOf(' ') + 1).split('\\n')
		lines.forEach((line) => {
			chat(client, line)
		})
	},
	completion: (client, input) => {
		const lastArg = input.substring(input.lastIndexOf(' ') + 1)
		if (client.username.startsWith(lastArg)) {
			return [client.username, ...colorCompletions]
		}
		return colorCompletions
	},
})

const colorCompletions = [
	'&0',
	'&1',
	'&2',
	'&3',
	'&4',
	'&5',
	'&6',
	'&7',
	'&8',
	'&9',
	'&a',
	'&b',
	'&c',
	'&d',
	'&e',
	'&f',
	'&k',
	'&l',
	'&m',
	'&n',
	'&o',
	'&r',
]
