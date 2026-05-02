import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { readSlot, writeSlot } from '../utils/slot.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.entity_equipment
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.EntityEquipmentPacket => {
	return {
		metadata: {
			name: 'entity_equipment',
			state: 'play',
			id,
		},
		data: {
			entityId: packet.readVarInt(),
			slot: packet.readInt16(),
			item: readSlot(packet),
		},
	}
}

export const write = (packet: Play.toClient.EntityEquipmentPacket): PacketWriter => {
	const writer = new PacketWriter(id).writeVarInt(packet.data.entityId).writeInt16(packet.data.slot).writeInt16(packet.data.item.blockId)
	writeSlot(packet.data.item, writer)
	return new PacketWriter(id).writeVarInt(packet.data.entityId).writeInt16(packet.data.slot).writeInt16(packet.data.item.blockId)
}
