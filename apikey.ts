import { ChatMessage } from 'prismarine-chat'
import { patchConfig } from '@/config.js'
import { addAsyncListener } from '@/events.js'
import log, { lc } from '@/log.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { chat } from '@/utils/chat.js'

// Adds an async listener for chat packets sent to the client
addAsyncListener<PacketEvent<Play.toClient.ChatPacket>>(
	Ids.Play.toClient.chat,
	'toClient',
	'API Key Listener',
	5,
	async ({ client, packet }) => {
		const message = new ChatMessage(JSON.parse(packet.data.message)).toString()
		if (message.startsWith('Your new API key is ')) {
			const key = message.substring(20)
			Lilith.log.info(`Changed API key to ${key}`)
			patchConfig({ general: { apiKey: key } })
				.then((_response) => {
					chat(client, '&cLilith &8> &7Saved API key to config.')
					log.raw(`${lc.yellow('Config')} ${lc.black('»')} ${lc.white('Saved new API key')}`, 'CONFIG')
				})
				.catch((err) => {
					Lilith.error(err)
					chat(client, '&cLilith &8> &7Failed to save API key. Please try again.')
					log.raw(`${lc.red('Error')} ${lc.black('»')} ${lc.white('Failed to save API key to config')}`, 'ERROR')
				})
		}
	},
)
