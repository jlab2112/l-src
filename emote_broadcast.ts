import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import type { Lunar } from '@/types/packets/lunar/packets'

export const namespace = 'lunar'
export const id = 0x1a
export const direction = 'shared'

export const read = (packet: PacketReader): Lunar.Shared.EmoteBroadcast => {
	return {
		packetId: id,
		player: packet.readUUID(),
		emoteId: packet.readInt32(),
	}
}

export const write = (packet: Lunar.Shared.EmoteBroadcast): PacketWriter => {
	return new PacketWriter(id).writeString(packet.player).writeInt32(packet.emoteId)
}
