import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import type { Slot } from '@/types/packets/shared.js'
import { readSlot, writeSlot } from '../utils/slot.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.window_items
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.WindowItemsPacket => {
	return {
		metadata: {
			name: 'window_items',
			state: 'play',
			id,
		},
		data: {
			windowId: packet.readUInt8(),
			items: packet.readArrayComplex<Slot>(readSlot),
		},
	}
}

export const write = (packet: Play.toClient.WindowItemsPacket): PacketWriter => {
	return new PacketWriter(id).writeUInt8(packet.data.windowId).writeArrayComplex<Slot>(packet.data.items, writeSlot)
}
