import type { PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'

export enum NbtType {
	TAG_End = 0,
	TAG_Byte = 1,
	TAG_Short = 2,
	TAG_Int = 3,
	TAG_Long = 4,
	TAG_Float = 5,
	TAG_Double = 6,
	TAG_Byte_Array = 7,
	TAG_String = 8,
	TAG_List = 9,
	TAG_Compound = 10,
	TAG_Int_Array = 11,
	TAG_Long_Array = 12,
}

export type NbtComponent =
	| {
			type: NbtType.TAG_Byte
			value: number
	  }
	| {
			type: NbtType.TAG_Short
			value: number
	  }
	| {
			type: NbtType.TAG_Int
			value: number
	  }
	| {
			type: NbtType.TAG_Long
			value: bigint
	  }
	| {
			type: NbtType.TAG_Float
			value: number
	  }
	| {
			type: NbtType.TAG_Double
			value: number
	  }
	| {
			type: NbtType.TAG_Byte_Array
			value: number[]
	  }
	| {
			type: NbtType.TAG_String
			value: string
	  }
	| {
			type: NbtType.TAG_List
			elementType: NbtType
			value: NbtComponent[]
	  }
	| {
			type: NbtType.TAG_Compound
			value: {
				[key: string]: NbtComponent
			}
	  }
	| {
			type: NbtType.TAG_Int_Array
			value: number[]
	  }
	| {
			type: NbtType.TAG_Long_Array
			value: bigint[]
	  }

export type Nbt = { [key: string]: NbtComponent & { type: NbtType.TAG_Compound } }

function readRawComponent(type: NbtType, reader: PacketReader): NbtComponent | null {
	switch (type) {
		case NbtType.TAG_End:
			return null
		case NbtType.TAG_Byte:
			return {
				type,
				value: reader.readInt8(),
			}
		case NbtType.TAG_Short:
			return {
				type,
				value: reader.readInt16(),
			}
		case NbtType.TAG_Int:
			return {
				type,
				value: reader.readInt32(),
			}
		case NbtType.TAG_Long:
			return {
				type,
				value: reader.readInt64(),
			}
		case NbtType.TAG_Float:
			return {
				type,
				value: reader.readFloat(),
			}
		case NbtType.TAG_Double:
			return {
				type,
				value: reader.readDouble(),
			}
		case NbtType.TAG_Byte_Array: {
			return {
				type,
				value: new Array(reader.readInt32()).fill(undefined).map(() => reader.readInt8()),
			}
		}
		case NbtType.TAG_String: {
			return {
				type,
				value: reader.read(reader.readInt16()).toString('utf-8'),
			}
		}
		case NbtType.TAG_List: {
			const elementType = reader.readInt8() as NbtType

			if (elementType === NbtType.TAG_End) {
				return {
					type,
					elementType,
					value: [],
				}
			}

			return {
				type,
				elementType,
				value: new Array(reader.readInt32()).fill(undefined).map(() => readRawComponent(elementType, reader)),
			}
		}
		case NbtType.TAG_Compound: {
			let lastComponent = readNamedComponent(reader)

			if (!lastComponent) {
				return {
					type,
					value: {},
				}
			}

			const value = {} as { [key: string]: NbtComponent }

			while (lastComponent) {
				value[lastComponent[0]] = lastComponent[1]

				lastComponent = readNamedComponent(reader)
			}

			return {
				type,
				value,
			}
		}
		case NbtType.TAG_Int_Array: {
			return {
				type,
				value: new Array(reader.readInt32()).fill(undefined).map(() => reader.readInt32()),
			}
		}
		case NbtType.TAG_Long_Array: {
			return {
				type,
				value: new Array(reader.readInt32()).fill(undefined).map(() => reader.readInt64()),
			}
		}
	}
}

function readNamedComponent(reader: PacketReader): [string, NbtComponent] | null {
	const type = reader.readInt8() as NbtType

	if (type === NbtType.TAG_End) return null

	const name = reader.read(reader.readInt16()).toString('utf-8')

	return [name, readRawComponent(type, reader)]
}

export function readNbt(reader: PacketReader): Nbt {
	const component = readNamedComponent(reader)!

	return {
		[component[0]]: component[1] as NbtComponent & { type: NbtType.TAG_Compound },
	}
}

function writeRawComponent(component: NbtComponent, writer: PacketWriter) {
	switch (component.type) {
		case NbtType.TAG_Byte:
			writer.writeInt8(component.value)
			break
		case NbtType.TAG_Short:
			writer.writeInt16(component.value)
			break
		case NbtType.TAG_Int:
			writer.writeInt32(component.value)
			break
		case NbtType.TAG_Long:
			writer.writeInt64(component.value)
			break
		case NbtType.TAG_Float:
			writer.writeFloat(component.value)
			break
		case NbtType.TAG_Double:
			writer.writeDouble(component.value)
			break
		case NbtType.TAG_Byte_Array: {
			writer.writeInt32(component.value.length)
			component.value.forEach(writer.writeInt8)

			break
		}
		case NbtType.TAG_String: {
			const buffer = Buffer.from(component.value)

			writer.writeInt16(buffer.length).write(buffer)

			break
		}
		case NbtType.TAG_List: {
			writer.writeInt8(component.elementType).writeInt32(component.value.length)

			component.value.forEach((element) => writeRawComponent(element, writer))

			break
		}
		case NbtType.TAG_Compound: {
			Object.entries(component.value).forEach((named) => {
				writeNamedComponent(named, writer)
			})

			writer.writeInt8(NbtType.TAG_End)

			break
		}
		case NbtType.TAG_Int_Array: {
			writer.writeInt32(component.value.length)
			component.value.forEach(writer.writeInt32)

			break
		}
		case NbtType.TAG_Long_Array: {
			writer.writeInt32(component.value.length)
			component.value.forEach(writer.writeInt64)

			break
		}
	}
}

function writeNamedComponent([name, component]: [string, NbtComponent], writer: PacketWriter) {
	const nameBuffer = Buffer.from(name)

	writer.writeInt8(component.type).writeInt16(nameBuffer.length).write(nameBuffer)

	writeRawComponent(component, writer)
}

export function writeNbt(nbt: Nbt, writer: PacketWriter) {
	const rootTag = Object.entries(nbt)[0]

	writeNamedComponent(rootTag, writer)
}
