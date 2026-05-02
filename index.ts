/*
import Subcommand from '../../utils/subcommands'
import { registerCommand } from '@/commands/handler'
import api from '@/commands/implementations/lilith/api'
import config from '@/commands/implementations/lilith/conf'
import dev from '@/commands/implementations/lilith/dev'
import {endpoint} from '@/commands/implementations/lilith/endpoint'
import { chat } from '@/utils/chat.js'

registerCommand('lilith', [], {
	execute: async (client, _raw, parsed) => {
		const cmd = new Subcommand({ usage: () => chat(client, '&cLilith &8> &7Please use either &cconfig &7or &capi&7.') })

		cmd.register('api').action((args) => api(args, parsed, client))
		cmd.register('config').action((args) => config(args, parsed, client))
		Lilith.app.devMode && cmd.register('dev').action((args) => dev(args, parsed, client))
		Lilith.app.devMode && cmd.register('endpoint').action((args) => endpoint(args, parsed, client))
		cmd.run(parsed)
	},
})
*/
