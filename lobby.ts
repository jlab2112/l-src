import type { LilithClient } from '@/client.js'
import { addAsyncListener, addListener } from '@/events.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import type { Slot } from '@/types/packets/shared.js'

addListener<PacketEvent<Play.toClient.ChatPacket>>(
	Ids.Play.toClient.chat,
	'toClient',
	'Limbo Listener',
	0,
	true,
	async ({ packet, setCancelled }) => {
		if (
			packet.data.message === `{"extra":["Illegal characters in chat"],"text":""}` ||
			packet.data.message === `{"text":"A kick occurred in your connection, so you have been routed to limbo!","color":"red"}`
		)
			return setCancelled(true)
		const message = JSON.parse(packet.data.message)
		try {
			if (message.text.includes('A kick occurred in your connection')) return setCancelled(true)
		} catch {}
	},
)

function processSlot(client: LilithClient, slot: number, item: Slot) {
	if (slot === 36) {
		if (item.blockId === -1) {
			client.isLobby = false
			return
		}
		if (item.blockId === 345) {
			client.isLobby = true
			return
		}
	} else if (slot === 44) {
		if (item.blockId === 355) {
			client.isLobby = false
			return
		}
		if (item.blockId === 399) {
			client.isLobby = true
			return
		}
	}
}

addAsyncListener<PacketEvent<Play.toClient.WindowItemsPacket>>(
	Ids.Play.toClient.window_items,
	'toClient',
	'window items',
	0,
	async ({ client, packet }) => {
		for (let i = 0; i < packet.data.items.length; i++) {
			processSlot(client, i, packet.data.items[i])
		}
	},
)

addAsyncListener<PacketEvent<Play.toClient.SetSlotPacket>>(Ids.Play.toClient.set_slot, 'toClient', 'Set Slot', 0, async ({ client, packet }) => {
	processSlot(client, packet.data.slot, packet.data.item)
})
