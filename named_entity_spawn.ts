import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'
import { readEntityMetadata, writeEntityMetadata } from '../utils/entityMetadata'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.named_entity_spawn
export const direction = 'toClient'

export function read(packet: PacketReader): Play.toClient.NamedEntitySpawnPacket {
	return {
		metadata: {
			name: 'named_entity_spawn',
			state: 'play',
			id,
		},
		data: {
			entityId: packet.readVarInt(),
			playerUUID: packet.readUUID(),
			x: packet.readInt32(),
			y: packet.readInt32(),
			z: packet.readInt32(),
			yaw: packet.readInt8(),
			pitch: packet.readInt8(),
			currentItem: packet.readInt16(),
			metadata: readEntityMetadata(packet),
		},
	}
}

export function write(packet: Play.toClient.NamedEntitySpawnPacket): PacketWriter {
	const writer = new PacketWriter(id)
		.writeVarInt(packet.data.entityId)
		.writeUUID(packet.data.playerUUID)
		.writeInt32(packet.data.x)
		.writeInt32(packet.data.y)
		.writeInt32(packet.data.z)
		.writeInt8(packet.data.yaw)
		.writeInt8(packet.data.pitch)
		.writeInt16(packet.data.currentItem)

	return writeEntityMetadata(writer, packet.data.metadata)
}
