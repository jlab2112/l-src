import EventEmitter from 'node:events'
import type { IncomingPacketEvent } from '@/sources/events'
import type { State } from '@lilithmod/unborn-mcproto'
//@ts-ignore
import type { Packet, PacketReader } from '@lilithmod/unborn-mcproto/lib/packet'

export interface PacketSource {
	listen(status: (json: ServerStatus) => Promise<ServerStatus>, connected: (client: Connection) => Promise<void>): void
}

export class TypedEventEmitter<TEvents extends Record<string, any>> {
	private emitter = new EventEmitter()

	emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]) {
		this.emitter.emit(eventName, ...(eventArg as []))
	}

	on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
		this.emitter.on(eventName, handler as any)
	}

	once<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
		this.emitter.once(eventName, handler as any)
	}

	off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
		this.emitter.off(eventName, handler as any)
	}
}

export interface Connection
	extends TypedEventEmitter<{
		packetClientbound: [incoming: IncomingPacketEvent, state?: State]
		endClientbound: []
		errorClientbound: [error: Error]
		packetServerbound: [incoming: IncomingPacketEvent, state?: State]
		endServerbound: []
		errorServerbound: [error: Error]
		end: []
	}> {
	ended: boolean
	username: string
	uuid: string
	uuidShort: string
	authData?: any
	serverID?: string

	state: State

	onPacketClientbound(id: number, handler: (packet: PacketReader, state?: State) => void)

	oncePacketClientbound(id: number, handler: (packet: PacketReader, state?: State) => void)

	nextPacketClientbound(id?: number, expectNext?: boolean): Promise<PacketReader>

	sendClientbound(packet: Packet): Promise<void>

	onPacketServerbound(id: number, handler: (packet: PacketReader, state?: State) => void)

	oncePacketServerbound(id: number, handler: (packet: PacketReader, state?: State) => void)

	nextPacketServerbound(id?: number, expectNext?: boolean): Promise<PacketReader>

	sendServerbound(packet: Packet): Promise<void>

	end(packet?: Packet): Promise<void>
}

export interface ServerStatus {
	version: {
		name: string
		protocol: number
	}
	players: {
		max: number
		online: number
		sample: string[]
	}
	description: string
	favicon: string
}
