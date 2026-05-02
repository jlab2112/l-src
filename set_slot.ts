import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { readSlot, writeSlot } from '../utils/slot.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.set_slot
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.SetSlotPacket => {
	return {
		metadata: {
			name: 'set_slot',
			state: 'play',
			id,
		},
		data: {
			windowId: packet.readInt8(),
			slot: packet.readInt16(),
			item: readSlot(packet),
		},
	}
}

export const write = (packet: Play.toClient.SetSlotPacket): PacketWriter => {
	const writer = new PacketWriter(id).writeInt8(packet.data.windowId).writeInt16(packet.data.slot)

	writeSlot(packet.data.item, writer)
	return writer
}
