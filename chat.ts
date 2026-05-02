import { addListener } from '@/events.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

const ChatMessage = require('prismarine-chat').ChatMessage

addListener<PacketEvent<Play.toClient.ChatPacket>>(
	Ids.Play.toClient.chat,
	'toClient',
	'Player Join Chat Listener',
	9,
	true,
	async ({ client, packet }) => {
		if (packet.data.message.includes('has quit')) {
			const jsonMessage = JSON.parse(packet.data.message)
			if (jsonMessage.extra?.[4]?.text !== ' has quit!') return
			const message: string = new ChatMessage(jsonMessage).toString()
			const quitMatch = message.match(/^(\w{1,16}) has quit!$/)
			if (quitMatch == null) return
			const username = quitMatch[1]
			Lilith.log.info(username, ' left')
			if (client.gameInfo.dodgeResults.some((v) => v.username === username)) {
				client.gameInfo.dodgeResults = client.gameInfo.dodgeResults.filter((v) => v.username !== username)
			} else {
				// TODO: test
				setTimeout(() => {
					if (client.gameInfo.dodgeResults.some((v) => v.username === username)) {
						client.gameInfo.dodgeResults = client.gameInfo.dodgeResults.filter((v) => v.username !== username)
					}
				}, 200)
			}
		}
	},
)
