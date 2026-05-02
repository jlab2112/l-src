import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.scoreboard_score
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.ScoreboardScorePacket => {
	const data: any = {
		metadata: {
			name: 'scoreboard_score',
			state: 'play',
			id,
		},
		data: {
			itemName: packet.readString(),
			action: packet.readVarInt(),
			scoreName: packet.readString(),
		},
	}

	if (data.data.action === 1) {
		data.data.value = packet.readVarInt()
	}

	return data
}

export const write = (packet: Play.toClient.ScoreboardScorePacket): PacketWriter => {
	const writer = new PacketWriter(id).writeString(packet.data.itemName).writeVarInt(packet.data.action).writeString(packet.data.scoreName)

	if (packet.data.action === 1) {
		writer.writeVarInt(packet.data.value)
	}
	return writer
}
