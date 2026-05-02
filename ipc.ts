import type { u8 } from '@/types/packets/shared.js'

export enum Instructions {
	LIST = 0,
	REPORTCB = 1,
	REPORTSB = 2,
	SENDCB = 3,
	SENDSB = 4,
	CANCEL = 5,
}

export interface BaseInstruction {
	instructionId: Instructions // u8
}

export enum PacketMode {
	PASS = 0,
	CANCEL = 1,
	AWAIT = 2,
}

export enum PacketDirection {
	CLIENTBOUND = 0,
	SERVERBOUND = 1,
}

type ReportListInstructionPacket = {
	packetId: u8
	mode: PacketMode // u8
	direction: PacketDirection // u8
}

export interface ReportListInstruction extends BaseInstruction {
	instructionId: Instructions.LIST
	packets: Array<ReportListInstructionPacket>
}

export interface ReportClientboundPacketInstruction extends BaseInstruction {
	instructionId: Instructions.REPORTCB
	packet: Buffer
}

export interface ReportServerboundPacketInstruction extends BaseInstruction {
	instructionId: Instructions.REPORTSB
	packet: Buffer
}

export interface SendClientboundPacketInstruction extends BaseInstruction {
	instructionId: Instructions.SENDCB
	packet: Buffer
}

export interface SendServerboundPacketInstruction extends BaseInstruction {
	instructionId: Instructions.SENDSB
	packet: Buffer
}

export interface CancelInstruction extends BaseInstruction {
	instructionId: Instructions.CANCEL
}

export type IpcInstruction =
	| ReportListInstruction
	| ReportClientboundPacketInstruction
	| ReportServerboundPacketInstruction
	| SendClientboundPacketInstruction
	| SendServerboundPacketInstruction
	| CancelInstruction

export function read(buf: Buffer): IpcInstruction {
	let offset = 0

	const instructionId = buf.readUint8(offset)
	offset++

	const instruction: any = {
		instructionId,
	}

	switch (instructionId) {
		case 0: {
			const length = buf.readUint8(offset)
			offset++

			const arr = new Array<ReportListInstructionPacket>(length)
			for (let i = 0; i < length; i++) {
				const packetId = buf.readUint8(offset)
				offset++
				const mode = buf.readUint8(offset)
				offset++
				const direction = buf.readUint8(offset)
				offset++

				arr[i] = {
					packetId,
					mode,
					direction,
				}
			}
			instruction.packets = arr
			break
		}
		case 1:
		case 2:
		case 3:
		case 4:
			instruction.packet = buf.slice(offset)
			break
	}

	return instruction as IpcInstruction
}

export function encode(instruction: IpcInstruction): Buffer {
	let buf: Buffer
	switch (instruction.instructionId) {
		case Instructions.LIST: {
			buf = Buffer.alloc(instruction.packets.length * 3 + 2)
			let offset = 0

			buf.writeUInt8(Instructions.LIST)
			offset++

			buf.writeUInt8(instruction.packets.length, offset)
			offset++

			for (const packet of instruction.packets) {
				buf.writeUInt8(packet.packetId, offset)
				offset++
				buf.writeUInt8(packet.mode, offset)
				offset++
				buf.writeUInt8(packet.direction, offset)
				offset++
			}
			break
		}
		case Instructions.REPORTCB:
		case Instructions.REPORTSB:
		case Instructions.SENDSB:
		case Instructions.SENDCB:
			buf = Buffer.alloc(instruction.packet.length + 1)
			buf.writeUInt8(instruction.instructionId)
			instruction.packet.copy(buf, 1)
			break
		case Instructions.CANCEL:
			buf = Buffer.alloc(1)
			buf.writeUInt8(Instructions.CANCEL)
			break
	}
	return buf
}
