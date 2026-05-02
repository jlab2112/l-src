import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.scoreboard_objective
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.ScoreboardObjectivePacket => {
	const name = packet.readString()
	const action = packet.readInt8()

	const packetData: any = {
		name,
		action,
	}

	if (action === 0 || action === 2) {
		packetData.displayText = packet.readString()
		packetData.type = packet.readString()
	}

	return {
		metadata: {
			name: 'scoreboard_objective',
			state: 'play',
			id,
		},
		data: packetData,
	}
}

export const write = (packet: Play.toClient.ScoreboardObjectivePacket): PacketWriter => {
	const writer = new PacketWriter(id).writeString(packet.data.name).writeInt8(packet.data.action)

	if (packet.data.action === 0 || packet.data.action === 2) {
		writer.writeString(packet.data.displayText)
		writer.writeString(packet.data.type)
	}
	return writer
}
