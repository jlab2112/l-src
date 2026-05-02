import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.title
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.TitlePacket => {
	const action = packet.readVarInt()

	if (action === 0 || action === 1) {
		return {
			metadata: {
				name: 'title',
				state: 'play',
				id,
			},
			data: {
				action,
				text: packet.readString(),
			},
		}
	}
	if (action === 2) {
		return {
			metadata: {
				name: 'title',
				state: 'play',
				id,
			},
			data: {
				action,
				fadeIn: packet.readInt32(),
				stay: packet.readInt32(),
				fadeOut: packet.readInt32(),
			},
		}
	}
	return {
		metadata: {
			name: 'title',
			state: 'play',
			id,
		},
		data: {
			action,
		},
	}
}

export const write = (packet: Play.toClient.TitlePacket): PacketWriter => {
	if (packet.data.action === 0 || packet.data.action === 1) {
		return new PacketWriter(id).writeVarInt(packet.data.action).writeString(packet.data.text)
	}
	if (packet.data.action === 2) {
		return new PacketWriter(id)
			.writeVarInt(packet.data.action)
			.writeInt32(packet.data.fadeIn)
			.writeInt32(packet.data.stay)
			.writeInt32(packet.data.fadeOut)
	}
	return new PacketWriter(id).writeVarInt(packet.data.action)
}
