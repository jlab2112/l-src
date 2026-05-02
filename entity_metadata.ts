import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'
import { readEntityMetadata, writeEntityMetadata } from '../utils/entityMetadata'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.entity_metadata
export const direction = 'toClient'

export function read(packet: PacketReader): Play.toClient.EntityMetadataPacket {
	return {
		metadata: {
			name: 'entity_metadata',
			state: 'play',
			id,
		},
		data: {
			entityId: packet.readVarInt(),
			metadata: readEntityMetadata(packet),
		},
	}
}

export function write(packet: Play.toClient.EntityMetadataPacket): PacketWriter {
	const writer = new PacketWriter(id).writeVarInt(packet.data.entityId)

	return writeEntityMetadata(writer, packet.data.metadata)
}
