import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toServer.chat
export const direction = 'toServer'

export const read = (packet: PacketReader): Play.toServer.ChatPacket => {
	return {
		metadata: {
			name: 'chat',
			state: 'play',
			id,
		},
		data: {
			message: packet.readString(),
		},
	}
}

export const write = (packet: Play.toServer.ChatPacket): PacketWriter => {
	return new PacketWriter(id).writeString(packet.data.message)
}
