/*
import Subcommand from '../utils/subcommands'
import config, { fetchConfigAsync } from '@/config'
import { hwid } from '@/hwid'
import { cacheStringArrays } from '@/input'
import { UsageMessage, UsageMessageDev } from '@/json/usage'
import { checkHwid } from '@/licensing'
import log, { lc } from '@/log'
import { chat, chatJson } from '@/utils/chat'
import { checkKey } from '@/utils/checkkey'

export default (args, parsed, client) => {
	const cmd = new Subcommand({ usage: () => chat(client, '&cLilith &8> &7Please use either &creload &7or &cinfo&7.') })

	cmd.register('info', { default: true }).action(() => {
		if (Lilith.app.devMode) chatJson(client, UsageMessageDev)
		else chatJson(client, UsageMessage)
	})

	cmd.register('reload').action(async () => {
		try {
			checkHwid(hwid, false, true)
			chat(client, '&cLilith &8> &7Reloading config...')
			await fetchConfigAsync()
			cacheStringArrays(client)
			chat(client, '&cLilith &8> &7Config has been reloaded!')
			checkKey(client, config().general.apiKey, config().general.useApiKeyLess)
		} catch (err) {
			Lilith.log.error(err)
			chat(client, '&cLilith &8> &7Failed to reload config.')
			log.raw(`${lc.red('Error')} ${lc.black('»')} ${lc.white('Failed to reload')}`, 'CONFIG')
		}
	})

	parsed.ordered.shift()
	cmd.run(parsed)
}
*/
import { registerCommand } from '@/commands/handler'
import { chat } from '@/utils/chat'

registerCommand('lreload', [], {
	execute: async (client, _raw, _parsed) => {
		chat(client, '&cLilith &8> &7Guess what! Lilith automatically reloads your config for you! Pretty neat huh?')
	},
})
