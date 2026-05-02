import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toServer.keep_alive
export const direction = 'toServer'

export const read = (packet: PacketReader): Play.toServer.KeepAlivePacket => {
	return {
		metadata: {
			name: 'keep_alive',
			state: 'play',
			id,
		},
		data: {
			keepAliveId: packet.readVarInt(),
		},
	}
}

export const write = (packet: Play.toServer.KeepAlivePacket): PacketWriter => {
	return new PacketWriter(id).writeVarInt(packet.data.keepAliveId)
}
