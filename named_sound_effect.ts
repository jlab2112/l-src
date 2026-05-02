import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.named_sound_effect
export const direction = 'toClient'

export function read(packet: PacketReader): Play.toClient.NamedSoundEffectPacket {
	return {
		metadata: {
			name: 'named_sound_effect',
			state: 'play',
			id,
		},
		data: {
			soundName: packet.readString(),
			x: packet.readInt32() / 8,
			y: packet.readInt32() / 8,
			z: packet.readInt32() / 8,
			volume: packet.readFloat(),
			pitch: packet.readUInt8(),
		},
	}
}

export function write(packet: Play.toClient.NamedSoundEffectPacket): PacketWriter {
	return new PacketWriter(id)
		.writeString(packet.data.soundName)
		.writeInt32(Math.floor(packet.data.x * 8))
		.writeInt32(Math.floor(packet.data.y * 8))
		.writeInt32(Math.floor(packet.data.z * 8))
		.writeFloat(packet.data.volume)
		.writeUInt8(packet.data.pitch)
}
