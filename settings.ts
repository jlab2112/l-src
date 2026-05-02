import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toServer.settings
export const direction = 'toServer'

export const read = (packet: PacketReader): Play.toServer.SettingsPacket => {
	return {
		metadata: {
			name: 'settings',
			state: 'play',
			id,
		},
		data: {
			locale: packet.readString(),
			viewDistance: packet.readInt8(),
			chatFlags: packet.readInt8(),
			chatColors: packet.readBool(),
			skinParts: packet.readUInt8(),
		},
	}
}

export const write = (packet: Play.toServer.SettingsPacket): PacketWriter => {
	return new PacketWriter(id)
		.writeString(packet.data.locale)
		.writeInt8(packet.data.viewDistance)
		.writeInt8(packet.data.chatFlags)
		.writeBool(packet.data.chatColors)
		.writeUInt8(packet.data.skinParts)
}
