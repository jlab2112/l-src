import type { LilithClient } from '@/client.js'
import { registerCommand } from '@/commands/handler'
import config, { patchConfig } from '@/config'
import { chat } from '@/utils/chat.js'
import { completions } from '@/utils/completions.js'
import { Duration, DurationFormatter } from '@sapphire/time-utilities'
import * as lexure from 'lexure'

registerCommand('nododge', [], {
	execute: async (client, _, parsed) => {
		const args = new lexure.Args(parsed)
		const target = args.single()
		const dur = args.single()
		if (target == null) {
			compileNoDodgeList(client)
			if (client.noDodgePlayers.length === 0) {
				return chat(client, '&cLilith &8> &7There are no players on your no-dodge list!')
			}
			return chat(client, `&cLilith &8> &7Currently not dodging the following players: &c${client.noDodgePlayers}`)
		}

		const noDodgePlayers = client.noDodgePlayers
		const duration = new Duration(dur ?? '24h')
		noDodgePlayers[target.toLowerCase()] = duration.fromNow.toString()

		await patchConfig({
			autododge: { noDodgePlayers },
		})

		compileNoDodgeList(client)

		chat(client, `&cLilith &8> &7Will not dodge &c${target} &7for &c${new DurationFormatter().format(duration.offset)}&7.`)
	},
	completion: (client, input) => {
		return completions(client.players.map((p) => p.name))(client, input)
	},
})

export function compileNoDodgeList(client: LilithClient) {
	const oldDodgePlayers = client.noDodgePlayers
	client.noDodgePlayers = []
	const noDodgePlayers = {}

	for (const player of Object.keys(config().autododge.noDodgePlayers)) {
		const date = new Date(config().autododge.noDodgePlayers[player])
		if (date > new Date()) {
			noDodgePlayers[player] = date.toString()
			client.noDodgePlayers.push(player)
		}
	}
	if (Object.keys(noDodgePlayers) !== oldDodgePlayers)
		patchConfig({
			autododge: { noDodgePlayers },
		})
}
