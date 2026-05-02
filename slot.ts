import type { PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import type { Slot } from '@/types/packets/shared.js'
import { type Nbt, readNbt, writeNbt } from './nbt'

export function readSlot(packet: PacketReader): Slot {
	const blockId = packet.readInt16()

	if (blockId === -1) {
		return { blockId }
	}
	const itemCount = packet.readInt8()
	const itemDamage = packet.readInt16()
	const nbtStart = packet.readInt8()

	if (nbtStart !== 0) {
		packet.offset -= 1

		return {
			blockId,
			itemCount,
			itemDamage,
			nbt: readNbt(packet),
		}
	}

	return {
		blockId,
		itemCount,
		itemDamage,
		nbt: null,
	}
}

export function writeSlot(value: Slot, writer: PacketWriter): void {
	writer.writeInt16(value.blockId)
	if (value.blockId !== -1) {
		const slot = value as { blockId: number; itemCount: number; itemDamage: number; nbt?: Nbt }

		writer.writeInt8(slot.itemCount)
		writer.writeInt16(slot.itemDamage)

		if (slot.nbt) {
			writeNbt(slot.nbt, writer)
		} else {
			writer.writeBool(false)
		}
	}
}
