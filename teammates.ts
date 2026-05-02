import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import type { Lunar } from '@/types/packets/lunar/packets'
import type { f64, UUID } from '@/types/packets/shared'

export const namespace = 'lunar'
export const id = 0xd
export const direction = 'toClient'

export const read = (packet: PacketReader): Lunar.toClient.Teammates => {
	return {
		packetId: id,
		leader: packet.readOptional<UUID>(packet.readUUID.bind(packet)),
		lastMs: packet.readInt64(),
		players: packet.readArrayComplex<{
			player: UUID
			posMap: Array<{
				key: string
				value: f64
			}>
		}>((packet2) => {
			return {
				player: packet2.readUUID(),
				posMap: packet2.readArrayComplex<{
					key: string
					value: f64
				}>((packet3) => {
					return {
						key: packet3.readString(),
						value: packet3.readDouble(),
					}
				}),
			}
		}),
	}
}

export const write = (packet: Lunar.toClient.Teammates): PacketWriter => {
	const writer = new PacketWriter(id)
	writer.writeOptional<UUID>(packet.leader, writer.writeUUID.bind(writer))
	writer.writeInt64(packet.lastMs)
	writer.writeArrayComplex(packet.players, (value, writer2) => {
		writer2.writeUUID(value.player)
		writer2.writeArrayComplex(value.posMap, (value2, writer3) => {
			writer3.writeString(value2.key)
			writer3.writeDouble(value2.value)
		})
	})
	return writer
}
