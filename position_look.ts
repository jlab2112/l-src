import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'

export const namespace = 'minecraft'
export const id = Ids.Play.toServer.position_look
export const direction = 'toServer'

export function read(packet: PacketReader): Play.toServer.PositionLookPacket {
	return {
		metadata: {
			name: 'position_look',
			state: 'play',
			id,
		},
		data: {
			x: packet.readDouble(),
			y: packet.readDouble(),
			z: packet.readDouble(),
			yaw: packet.readFloat(),
			pitch: packet.readFloat(),
			onGround: packet.readBool(),
		},
	}
}

export function write(packet: Play.toServer.PositionLookPacket): PacketWriter {
	return new PacketWriter(id)
		.writeDouble(packet.data.x)
		.writeDouble(packet.data.y)
		.writeDouble(packet.data.z)
		.writeFloat(packet.data.yaw)
		.writeFloat(packet.data.pitch)
		.writeBool(packet.data.onGround)
}
