import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'
import { readEntityMetadata, writeEntityMetadata } from '../utils/entityMetadata'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.spawn_entity_living
export const direction = 'toClient'

export function read(packet: PacketReader): Play.toClient.SpawnEntityLivingPacket {
	return {
		metadata: {
			name: 'spawn_entity_living',
			state: 'play',
			id,
		},
		data: {
			entityId: packet.readVarInt(),
			// @ts-ignore
			type: packet.readUInt8(),
			x: packet.readInt32(),
			y: packet.readInt32(),
			z: packet.readInt32(),
			yaw: packet.readInt8(),
			pitch: packet.readInt8(),
			headPitch: packet.readInt8(),
			velocityX: packet.readInt16(),
			velocityY: packet.readInt16(),
			velocityZ: packet.readInt16(),
			metadata: readEntityMetadata(packet),
		},
	}
}

export function write(packet: Play.toClient.SpawnEntityLivingPacket): PacketWriter {
	const writer = new PacketWriter(id)
		.writeVarInt(packet.data.entityId)
		.writeUInt8((<any>packet.data).type)
		.writeInt32(packet.data.x)
		.writeInt32(packet.data.y)
		.writeInt32(packet.data.z)
		.writeInt8(packet.data.yaw)
		.writeInt8(packet.data.pitch)
		.writeInt8(packet.data.headPitch)
		.writeInt16(packet.data.velocityX)
		.writeInt16(packet.data.velocityY)
		.writeInt16(packet.data.velocityZ)

	return writeEntityMetadata(writer, packet.data.metadata)
}
