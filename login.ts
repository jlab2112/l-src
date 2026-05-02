import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.login
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.LoginPacket => {
	return {
		metadata: {
			name: 'login',
			state: 'play',
			id,
		},
		data: {
			entityId: packet.readInt32(),
			gameMode: packet.readUInt8(),
			dimension: packet.readInt8(),
			difficulty: packet.readUInt8(),
			maxPlayers: packet.readUInt8(),
			levelType: packet.readString(),
			reducedDebugInfo: packet.readBool(),
		},
	}
}

export const write = (packet: Play.toClient.LoginPacket): PacketWriter => {
	return new PacketWriter(id)
		.writeInt32(packet.data.entityId)
		.writeUInt8(packet.data.gameMode)
		.writeInt8(packet.data.dimension)
		.writeUInt8(packet.data.difficulty)
		.writeUInt8(packet.data.maxPlayers)
		.writeString(packet.data.levelType)
		.writeBool(packet.data.reducedDebugInfo)
}
