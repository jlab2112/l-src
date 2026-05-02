import { ChatMessage } from 'prismarine-chat'
import config from '@/config'
import { addAsyncListener } from '@/events.js'
import { generateStats, locationToGamemode } from '@/stats/getStatsMessage'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

// Adds an async listener for chat packets sent to the client
addAsyncListener<PacketEvent<Play.toClient.ChatPacket>>(
	Ids.Play.toClient.chat,
	'toClient',
	'Player Mention Listener',
	5,
	async ({ client, packet }) => {
		//TODO: proper config option
		if (packet.data.position !== 0 || !config()) return // If the message packet is not in the chat
		if (client.location == null || client.location.serverName == null || !client.location.serverName.includes('lobby'))
			return

		const message = new ChatMessage(JSON.parse(packet.data.message)).toString().toLowerCase()
		if (!message.includes(client.username.toLowerCase())) return
		if (message.startsWith('guild >')) return

		const match = /(?:\[\d*.])*(?: ?\[(?:mvp\+|mvp|vip\+|vip|mvp\+\+)])? ([a-zA-z]{1,16}):.*/gm.test(message)
		const player = /(?:\[\d*.])*(?: ?\[(?:mvp\+|mvp|vip\+|vip|mvp\+\+)])? ([a-zA-z]{1,16}):.*/gm.exec(message)

		if (!match) return

		if (player[1].toLowerCase() === client.username.toLowerCase()) return

		generateStats(player[1], locationToGamemode(client.location), client).catch((e) => console.log(e))
	},
)
