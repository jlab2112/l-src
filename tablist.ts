import { ChatMessage } from 'prismarine-chat'
import { addAsyncListener } from '@/events'
import type { PacketEvent } from '@/types/events'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'

addAsyncListener<PacketEvent<Play.toClient.PlayerlistHeaderPacket>>(
	Ids.Play.toClient.playerlist_header,
	'toClient',
	'Tablist Header and Footer Cache',
	0,
	async ({ packet, client }) => {
		try {
			client.tablistHeader = new ChatMessage(JSON.parse(packet.data.header))
		} catch (err) {
			Lilith.error(err)
		}

		try {
			client.tablistFooter = new ChatMessage(JSON.parse(packet.data.footer))
		} catch (err) {
			Lilith.error(err)
		}
	},
)
