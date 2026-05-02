import getNameHistory from '@lilithmod/unborn-namehistory'
import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import { chatArray, chatString } from '@/utils/chat.js'
import { playerCompletions } from '@/utils/completions.js'

/**
 * Filename: namehistory.mdx
 * Command: nh
 * Byline: Name History of a player.
 * Usage: `/nh <player>`
 * Aliases: `namehistory`
 * Added: 0.6.0-alpha.1
 *
 * Description:
 * This command prints out the name history of a player.
 */

registerCommand('nh', ['namehistory'], {
	execute: async (client, _raw, parsed) => {
		const args = new lexure.Args(parsed)
		let target = args.single()
		if (target == null) {
			target = client.uuid
		}

		try {
			const profile = await getNameHistory(target)

			// if ('error' in history) {
			//     return chatString(client, `&cLilith &8> &7Error while fetching name history: ${history.error}: ${history.errorMessage}`)
			// }

			const nameArray = [
				`&7-------- &2Name History for &a${profile.username}`,
				`&7Original &2>> &a${profile.history[0].username}`,
			]
			profile.history.shift()
			profile.history.forEach((entry) => {
				nameArray.push(
					`&7${entry.changeDate.getMonth()}/${entry.changeDate.getDate()}/${entry.changeDate.getFullYear().toString().substring(2)} &2>> &a${entry.username}`,
				)
			})
			nameArray.push('&7--------')
			chatArray(client, nameArray)
		} catch {
			chatString(client, '&cLilith &8> &7An error occured while fetching name history.')
		}
	},
	completion: playerCompletions,
})
