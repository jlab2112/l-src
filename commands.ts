import { LexureParser, commands } from '@/commands/handler'
import { addAsyncListener, addListener } from '@/events.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { chat } from '@/utils/chat.js'

addListener<PacketEvent<Play.toServer.ChatPacket>>(
	Ids.Play.toServer.chat,
	'toServer',
	'Command Listener',
	1,
	false,
	async ({ client, packet, setCancelled }) => {
		const message = packet.data.message
		if (!message.startsWith('/')) return
		let command: string
		if (message.includes(' ')) {
			command = message.substring(1, message.indexOf(' ')).toLowerCase()
		} else {
			command = message.substring(1).toLowerCase()
		}

		if (commands.has(command)) {
			const handler = commands.get(command)
			if (handler.execute == null) return
			setCancelled(true)

			try {
				handler.execute(client, message, LexureParser.parseInput(message))
			} catch (e) {
				Lilith.error(e)
				chat(client, `&cLilith &8> &7An error occurred while executing &c/${command}: &c${e.name}`)
			}
		}
	},
)

let latestRequest = ''

addAsyncListener<PacketEvent<Play.toServer.TabCompletePacket>>(
	Ids.Play.toServer.tab_complete,
	'toServer',
	'Serverbound Tab Complete Listener',
	0,
	async ({ packet }) => {
		latestRequest = packet.data.text
	},
)

addListener<PacketEvent<Play.toClient.TabCompletePacket>>(
	Ids.Play.toClient.tab_complete,
	'toClient',
	'Clientbound Tab Complete Listener',
	0,
	false,
	async ({ client, packet }) => {
		if (latestRequest.startsWith('/')) {
			if (latestRequest.includes(' ')) {
				const command = latestRequest.substring(1, latestRequest.indexOf(' '))
				if (commands.has(command)) {
					const handler = commands.get(command)
					if (handler.completion == null) return
					packet.data.matches = [...packet.data.matches, ...handler.completion(client, latestRequest)].sort()
				}
			} else {
				const command = latestRequest.substring(1)
				const aliases = [...commands.keys()]
				const matches = aliases.filter((a) => a.startsWith(command)).map((a) => `/${a}`)
				packet.data.matches = [...packet.data.matches, ...matches].sort()
			}
		}
		// TODO: enable upon emoji release
		// else if (latestRequest.match(/ ?:[a-zA-Z0-9_*+]*$/)) {
		//     const emoji = latestRequest.substring(latestRequest.lastIndexOf(':'))
		//     const matches = [...emojiCharacterMap.keys()].filter(e => e.startsWith(emoji))
		//     packet.data.matches = [...packet.data.matches, ...matches].sort()
		//     Lilith.msg(matches)
		// }
	},
)
