import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.kick_disconnect
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.KickDisconnectPacket => {
	return {
		metadata: {
			name: 'kick_disconnect',
			state: 'play',
			id,
		},
		data: {
			reason: packet.readString(),
		},
	}
}

export const write = (packet: Play.toClient.KickDisconnectPacket): PacketWriter => {
	return new PacketWriter(id).writeString(packet.data.reason)
}
