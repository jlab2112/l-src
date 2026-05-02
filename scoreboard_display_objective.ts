import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.scoreboard_display_objective
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.ScoreboardDisplayObjectivePacket => {
	return {
		metadata: {
			name: 'scoreboard_display_objective',
			state: 'play',
			id,
		},
		data: {
			position: packet.readInt8(),
			name: packet.readString(),
		},
	}
}

export const write = (packet: Play.toClient.ScoreboardDisplayObjectivePacket): PacketWriter => {
	return new PacketWriter(id).writeInt8(packet.data.position).writeString(packet.data.name)
}
