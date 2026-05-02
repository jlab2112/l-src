import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, PlayerInfoAction, type PlayerInfoData } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.player_info
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.PlayerInfoPacket => {
	const action = packet.readVarInt()
	return {
		metadata: {
			name: 'player_info',
			state: 'play',
			id,
		},
		data: {
			action,
			data: packet.readArrayComplex<PlayerInfoData>((packet2) => {
				if (action === PlayerInfoAction.AddPlayer) {
					return {
						UUID: packet2.readUUID(),
						name: packet2.readString(),
						properties: packet2.readArrayComplex<{
							name: string
							value: string
							signature?: string
						}>((packet3) => {
							return {
								name: packet3.readString(),
								value: packet3.readString(),
								signature: packet3.readOptional<string>(packet3.readString.bind(packet3)),
							}
						}),
						gamemode: packet2.readVarInt(),
						ping: packet2.readVarInt(),
						displayName: packet2.readOptional<string>(packet2.readString.bind(packet2)),
					}
				}
				if (action === PlayerInfoAction.UpdateGamemode) {
					return {
						UUID: packet2.readUUID(),
						gamemode: packet2.readVarInt(),
					}
				}
				if (action === PlayerInfoAction.UpdatePing) {
					return {
						UUID: packet2.readUUID(),
						ping: packet2.readVarInt(),
					}
				}
				if (action === PlayerInfoAction.UpdateDisplayName) {
					return {
						UUID: packet2.readUUID(),
						displayName: packet2.readOptional<string>(packet2.readString.bind(packet2)),
					}
				}
				return {
					UUID: packet2.readUUID(),
				}
			}),
		},
	}
}

export const write = (packet: Play.toClient.PlayerInfoPacket): PacketWriter => {
	const writer = new PacketWriter(id)
	writer.writeVarInt(packet.data.action)
	writer.writeArrayComplex<PlayerInfoData>(packet.data.data, (value) => {
		writer.writeUUID(value.UUID)
		if (packet.data.action === PlayerInfoAction.AddPlayer && 'properties' in value) {
			writer.writeString(value.name)
			writer.writeArrayComplex(value.properties, (value2) => {
				writer.writeString(value2.name)
				writer.writeString(value2.value)
				writer.writeOptional<string>(value2.signature, writer.writeString.bind(writer))
			})
			writer.writeVarInt(value.gamemode)
			writer.writeVarInt(value.ping)
			writer.writeOptional<string>(value.displayName, writer.writeString.bind(writer))
		} else if (packet.data.action === PlayerInfoAction.UpdateGamemode && 'gamemode' in value) {
			writer.writeVarInt(value.gamemode)
		} else if (packet.data.action === PlayerInfoAction.UpdatePing && 'ping' in value) {
			writer.writeVarInt(value.ping)
		} else if (packet.data.action === PlayerInfoAction.UpdateDisplayName) {
			writer.writeOptional<string>((value as any).displayName, writer.writeString.bind(writer))
		}
	})
	return writer
}
