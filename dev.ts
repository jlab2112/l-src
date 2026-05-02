/*
import Subcommand from '../utils/subcommands'
import config from '@/config'
import store from '@/store'
import { chat } from '@/utils/chat'

export default (args, parsed, client) => {
	const cmd = new Subcommand({ usage: () => chat(client, '&cLilith &8> &7You are not supposed to be here.') })

	cmd.register('info', { default: true }).action(() => chat(client, `&cLilith &8> &7"Lilith": ${JSON.stringify(Lilith, null, 2)}`))
	cmd.register('store').action(() => chat(client, `&cLilith &8> &7"store": ${JSON.stringify(store(), null, 2)}`))
	cmd.register('config').action(() => chat(client, `&cLilith &8> &7"config": ${JSON.stringify(config(), null, 2)}`))

	parsed.ordered.shift()
	cmd.run(parsed)
}
*/
