import config from '@/config.js'
import { addListener } from '@/events.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { ChatPosition } from '@/utils/chat.js'
import { permission } from '@/utils/permissions.js'

const ChatMessage = require('prismarine-chat').ChatMessage

addListener<PacketEvent<Play.toClient.ChatPacket>>(Ids.Play.toClient.chat, 'toClient', 'Chat Logger', 1000, false, async ({ packet }) => {
	if (packet.data.position !== ChatPosition.ActionBar && config().general.proxy.logChatMessages && permission('lilith.log_chat')) {
		const message = new ChatMessage(JSON.parse(packet.data.message))
		if (message.toString().startsWith('{')) return
		Lilith.msg(message.toAnsi())
	}
})
