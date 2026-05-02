import chalk from 'chalk'
import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import config, { patchConfig } from '@/config.js'
import log, { lc } from '@/log.js'
import { chat } from '@/utils/chat.js'
import { completions } from '@/utils/completions.js'
import { capitalize } from '@/utils/strings.js'

/**
 * Filename: autododge.mdx
 * Command: autododge
 * Byline: Toggle autododge for a gamemode.
 * Usage: `/autododge [skywars|murdermystery|wool]`
 * Added: Before Full Release
 *
 * Description:
 * This command will toggle autododge on or off for the specified game type. If no game type is specified, it will attempt to use your current location's game type.
 */

registerCommand('autododge', [], {
	execute: async (client, _raw, parsed) => {
		const args = new lexure.Args(parsed)
		let target = args.single()
		if (target == null) {
			if (client.location != null) {
				target = client.location.serverType.toLowerCase()
			} else {
				chat(client, '&cLilith &8> &7Please specify a target gamemode with &c/autododge [gamemode]')
				return
			}
		}
		if (config().autododge[target] == null) {
			chat(
				client,
				`&cLilith &8> &7Autododge for &c${target}&c doesn't seem to exist. Supported gamemodes are &c${Object.keys(config().autododge).join(
					', ',
				)}`,
			)
			return
		}
		const body = { autododge: {} }
		body.autododge[target] = {
			enabled: !config().autododge[target].enabled,
		}
		try {
			await patchConfig(body)
			Lilith.log.trace(config().autododge[target].enabled)
			chat(client, `&cLilith &8> &7Autododge for ${capitalize(target)} is now ${config().autododge[target].enabled ? '&aon' : '&coff'}&7.`)
		} catch (err) {
			Lilith.error(err)
			chat(client, '&cLilith &8> &7Failed to toggle autododge. Please try again.')
			log.raw(`${lc.red('Error')} ${lc.black('»')} ${chalk.white('Failed to toggle autododge')}`, 'ERROR')
		}
	},
	completion: completions(Object.keys(config().autododge)),
})
