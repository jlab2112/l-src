import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.playerlist_header
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.PlayerlistHeaderPacket => {
	return {
		metadata: {
			name: 'playerlist_header',
			state: 'play',
			id,
		},
		data: {
			header: packet.readString(),
			footer: packet.readString(),
		},
	}
}

export const write = (packet: Play.toClient.PlayerlistHeaderPacket): PacketWriter => {
	return new PacketWriter(id).writeString(packet.data.header).writeString(packet.data.footer)
}
