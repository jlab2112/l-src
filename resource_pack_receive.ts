import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toServer.resource_pack_receive
export const direction = 'toServer'

export const read = (packet: PacketReader): Play.toServer.ResourcePackReceivePacket => {
	return {
		metadata: {
			name: 'resource_pack_receive',
			state: 'play',
			id,
		},
		data: {
			hash: packet.readString(),
			result: packet.readVarInt(),
		},
	}
}

export const write = (packet: Play.toServer.ResourcePackReceivePacket): PacketWriter => {
	return new PacketWriter(id).writeString(packet.data.hash).writeVarInt(packet.data.result)
}
