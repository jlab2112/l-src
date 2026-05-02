import { type PacketReader, PacketWriter, type Position } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toServer.tab_complete
export const direction = 'toServer'

export const read = (packet: PacketReader): Play.toServer.TabCompletePacket => {
	const text = packet.readString()
	return {
		metadata: {
			name: 'tab_complete',
			state: 'play',
			id,
		},
		data: {
			text,
			block: packet.readOptional<Position>(packet.readPosition.bind(packet)),
		},
	}
}

export const write = (packet: Play.toServer.TabCompletePacket): PacketWriter => {
	const writer = new PacketWriter(id).writeString(packet.data.text)
	writer.writeOptional(packet.data.block, writer.writePosition.bind(writer))
	return writer
}
