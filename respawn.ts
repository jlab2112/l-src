import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.respawn
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.RespawnPacket => {
	return {
		metadata: {
			name: 'respawn',
			state: 'play',
			id,
		},
		data: {
			dimension: packet.readInt32(),
			difficulty: packet.readUInt8(),
			gamemode: packet.readUInt8(),
			levelType: packet.readString(),
		},
	}
}

export const write = (packet: Play.toClient.RespawnPacket): PacketWriter => {
	return new PacketWriter(id)
		.writeInt32(packet.data.dimension)
		.writeUInt8(packet.data.difficulty)
		.writeUInt8(packet.data.gamemode)
		.writeString(packet.data.levelType)
}
