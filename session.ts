import { registerCommand } from '@/commands/handler'
import { chatPurchase, chatString } from '@/utils/chat'
import { permission } from '@/utils/permissions'

/**
 * Filename: session.mdx
 * Command: session
 * Byline: Session stats
 * Usage: `/session`
 * Added: 2.0.5
 *
 * Description:
 * <Note>
 *  This **alpha** feature is only available with [Lilith Pro](https://lilith.rip/#pricing).
 * </Note>
 *
 * Displays your session stats for each mode of each gamemode you played.
 */

registerCommand('session', [], {
	execute: async (client) => {
		if (!permission('lilith.analytics.session')) {
			chatPurchase(client, 'Session', 'lilith.sub.t1')
			return
		}
		const messages = ['', '&cLilith &4(ALPHA) &8> &7Current Session: ']
		for (const gm of Object.keys(client.sessionStats)) {
			const prettyGameMode = gm
				.split('.')
				.map((lGM) => lGM[0].toUpperCase() + lGM.slice(1))
				.join(' ')
			messages.push(
				`&7${prettyGameMode}: &fW: &7${client.sessionStats[gm].wins}&f, L: &7${client.sessionStats[gm].losses}`,
			)
		}
		messages.push('')
		chatString(client, messages.join('\n'))
	},
})
