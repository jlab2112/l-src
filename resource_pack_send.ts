import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.resource_pack_send
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.ResourcePackSendPacket => {
	return {
		metadata: {
			name: 'resource_pack_send',
			state: 'play',
			id,
		},
		data: {
			url: packet.readString(),
			hash: packet.readString(),
		},
	}
}

export const write = (packet: Play.toClient.ResourcePackSendPacket): PacketWriter => {
	return new PacketWriter(id).writeString(packet.data.url).writeString(packet.data.hash)
}
