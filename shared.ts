import type { Position as Pos } from '@lilithmod/unborn-mcproto'
import type { Nbt } from '@/packets/minecraft/utils/nbt'

export type varint = number
export type i8 = number
export type i16 = number
export type i32 = number
export type i64 = bigint
export type u8 = number
export type u16 = number
export type u32 = number
export type u64 = bigint
export type f32 = number
export type f64 = number

export type UUID = string

export type Rotation = {
	pitch: number
	yaw: number
	roll: number
}

export type Slot =
	| {
			blockId: -1
	  }
	| {
			blockId: i16
			itemCount: i8
			itemDamage: i16
			nbt?: Nbt
	  }

export enum EntityMetadataType {
	Byte = 0,
	Short = 1,
	Int = 2,
	Float = 3,
	String = 4,
	Slot = 5,
	Position = 6,
	Rotation = 7,
}

export type EntityMetadata = Array<
	| {
			type: EntityMetadataType.Int | EntityMetadataType.Float | EntityMetadataType.Short
			value: number
			key: number
	  }
	| {
			type: EntityMetadataType.Byte
			value: any
			key: number
	  }
	| {
			type: EntityMetadataType.String
			value: string
			key: number
	  }
	| {
			type: EntityMetadataType.Slot
			value: Slot
			key: number
	  }
	| {
			type: EntityMetadataType.Position
			value: Pos
			key: number
	  }
	| {
			type: EntityMetadataType.Rotation
			value: Rotation
			key: number
	  }
>
