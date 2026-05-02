import type { PacketReader, PacketWriter, Position } from '@lilithmod/unborn-mcproto'
import { type EntityMetadata, EntityMetadataType, type Rotation, type Slot } from '@/types/packets/shared'
import { readSlot, writeSlot } from './slot'

export function readEntityMetadata(packet: PacketReader): EntityMetadata {
	const metadata: EntityMetadata = []

	while (true) {
		if (packet.offset >= packet.buffer.byteLength) break

		const item = packet.readUInt8()

		if (item === 0x7f) break

		const index = item & 0x1f
		const type = item >> 5

		let value: string | number | Slot | Rotation | Position

		switch (type) {
			case EntityMetadataType.Byte:
				value = packet.readInt8()
				break
			case EntityMetadataType.Short:
				value = packet.readInt16()
				break
			case EntityMetadataType.Int:
				value = packet.readInt32()
				break
			case EntityMetadataType.Float:
				value = packet.readFloat()
				break
			case EntityMetadataType.String:
				value = packet.readString()
				break
			case EntityMetadataType.Slot:
				value = readSlot(packet)
				break
			case EntityMetadataType.Position:
				value = {
					x: packet.readInt32(),
					y: packet.readInt32(),
					z: packet.readInt32(),
				}
				break
			case EntityMetadataType.Rotation:
				value = {
					pitch: packet.readFloat(),
					yaw: packet.readFloat(),
					roll: packet.readFloat(),
				}
				break
		}

		metadata.push({
			type,
			value,
			key: index,
		})
	}

	return metadata
}

export function writeEntityMetadata(writer: PacketWriter, metadata: EntityMetadata): PacketWriter {
	for (const meta of metadata) {
		const item = ((meta.type << 5) | (meta.key & 0x1f)) & 0xff

		writer.writeUInt8(item)

		switch (meta.type) {
			case EntityMetadataType.Byte:
				writer.writeInt8(meta.value)
				break
			case EntityMetadataType.Short:
				writer.writeInt16(meta.value)
				break
			case EntityMetadataType.Int:
				writer.writeInt32(meta.value)
				break
			case EntityMetadataType.Float:
				writer.writeFloat(meta.value)
				break
			case EntityMetadataType.String:
				writer.writeString(meta.value)
				break
			case EntityMetadataType.Slot:
				writeSlot(meta.value, writer)
				break
			case EntityMetadataType.Position:
				writer.writeInt32(meta.value.x)
				writer.writeInt32(meta.value.y)
				writer.writeInt32(meta.value.z)
				break
			case EntityMetadataType.Rotation:
				writer.writeFloat(meta.value.pitch)
				writer.writeFloat(meta.value.yaw)
				writer.writeFloat(meta.value.roll)
				break
		}
	}

	writer.writeUInt8(0x7f)

	return writer
}
