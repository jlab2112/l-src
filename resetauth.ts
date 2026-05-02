import chalk from 'chalk'
import { registerCommand } from '@/commands/handler'
import log, { lc } from '@/log.js'
import { clearAuthentication } from '@/store.js'
import { chat } from '@/utils/chat.js'

/**
 * Filename: resetauth.mdx
 * Command: lresetauth
 * Byline: Reset Microsoft authentication.
 * Usage: `/lresetauth`
 * Added: Version 1.0.7
 *
 * Description:
 * This command will reset the Microsoft authentications tokens for all of your connected accounts.
 * This can be useful if you're stuck in the black void while joining Lilith.
 *
 * All of your accounts will need to be re-authorized once you join Lilith again.
 */

registerCommand('lresetauth', [], {
	execute: async (client, _raw, _parsed) => {
		try {
			await clearAuthentication()
			chat(client, '&cLilith &8> &7Authentication cache has been cleared, please rejoin!')
			log.raw(`${lc.darkAqua('Authentication')} ${lc.black('»')} ${chalk.white('Cache cleared')}`, 'CONFIG')
		} catch {
			chat(client, '&cLilith &8> &7Failed to clear cache.')
		}
	},
})
