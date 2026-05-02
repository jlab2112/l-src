/*
import Subcommand from '../utils/subcommands'
import config, { patchConfig } from '@/config'
import log, { lc } from '@/log'
import { chat } from '@/utils/chat'
import { checkKey } from '@/utils/checkkey'

/!**
 * Filename: lilith-api.mdx
 * Command: lilith api
 * Byline: Manage your Hypixel API key.
 * Usage: `/lilith api <get|set> [key]`
 * Added: Version 1.1.0
 *
 * Description:
 * This command will either display or set your Hypixel API key. To set a new API key, do `/lilith api set <key>`. To see your current API key, do `/lilith api get`.
 *!/

export default (args, parsed, client) => {
	const cmd = new Subcommand({ usage: () => chat(client, '&cLilith &8> &7Please specify whether to &cget&r or &cset&r your API key.') })

	cmd.register('set').action((args) => {
		patchConfig({ general: { apiKey: args[0] } })
			.then(() => {
				chat(client, '&cLilith &8> &7Saved API key to config.')
				checkKey(client, args[0], config().general.useApiKeyLess)
				log.raw(`${lc.yellow('Config')} ${lc.black('»')} ${lc.white('Saved new API key')}`, 'CONFIG')
			})
			.catch((err) => {
				Lilith.error(err)
				chat(client, '&cLilith &8> &7Failed to save API key. Please try again.')
				log.raw(`${lc.red('Error')} ${lc.black('»')} ${lc.white('Failed to save API key to config')}`, 'ERROR')
			})
	})

	cmd.register('get').action(() => {
		chat(client, `&cLilith &8> &7Your API key is currently: &c${config().general.apiKey}`)
	})

	parsed.ordered.shift()
	cmd.run(parsed)
}
*/
