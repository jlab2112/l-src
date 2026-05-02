import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.position
export const direction = 'toClient'

export function read(packet: PacketReader): Play.toClient.PositionPacket {
	return {
		metadata: {
			name: 'position',
			state: 'play',
			id,
		},
		data: {
			x: packet.readDouble(),
			y: packet.readDouble(),
			z: packet.readDouble(),
			yaw: packet.readFloat(),
			pitch: packet.readFloat(),
			flags: packet.readUInt8(),
		},
	}
}

export function write(packet: Play.toClient.PositionPacket): PacketWriter {
	return new PacketWriter(id)
		.writeDouble(packet.data.x)
		.writeDouble(packet.data.y)
		.writeDouble(packet.data.z)
		.writeFloat(packet.data.yaw)
		.writeFloat(packet.data.pitch)
		.writeUInt8(packet.data.flags)
}
