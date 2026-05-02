import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.tab_complete
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.TabCompletePacket => {
	return {
		metadata: {
			name: 'tab_complete',
			state: 'play',
			id,
		},
		data: {
			matches: packet.readArray<string>(packet.readString.bind(packet)),
		},
	}
}

export const write = (packet: Play.toClient.TabCompletePacket): PacketWriter => {
	const writer = new PacketWriter(id)
	writer.writeVarInt(packet.data.matches.length)
	packet.data.matches.forEach((match) => writer.writeString(match))
	return writer
}
