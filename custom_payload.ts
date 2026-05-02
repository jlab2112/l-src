import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.custom_payload
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.CustomPayloadPacket => {
	return {
		metadata: {
			name: 'custom_payload',
			state: 'play',
			id,
		},
		data: {
			channel: packet.readString(),
			data: packet.read(packet.buffer.length - packet.offset),
		},
	}
}

export const write = (packet: Play.toClient.CustomPayloadPacket): PacketWriter => {
	return new PacketWriter(id).writeString(packet.data.channel).write(packet.data.data)
}
