import { HandshakeServiceServiceName } from '@lilithmod/protos/lilith/ipc/handshake/v1/service'
import type { Packet } from '@lilithmod/protos/lilith/ipc/packet/v1/common'
import type { MinecraftAccount } from '@lilithmod/protos/lilith/ipc/packet/v1/service'
import { IpcMessage } from '@lilithmod/protos/lilith/ipc/protocol/v1/common'
import type { State } from '@lilithmod/unborn-mcproto'
import { Server, type WebSocket } from 'ws'
import { TypedEventEmitter } from '@/types/sources'
import { HandshakeServiceImpl } from './implementations/handshake'
import { RpcDispatcher } from './rpc'

type ServerEvents = {
	connection: [IpcConnection]
}

type ConnectionEvents = {
	connection: [bigint, State]
	close: [bigint]
	account: [bigint, MinecraftAccount]
	updateState: [bigint, State]
}

type PacketHandler = (connection: bigint, packet: Packet) => Packet | undefined

export class IpcConnection extends TypedEventEmitter<ConnectionEvents> {
	public packetListener?: PacketHandler

	public constructor(private readonly socket: WebSocket) {
		super()
	}

	public push(id: string, buffer: Uint8Array) {
		this.socket.send(
			IpcMessage.encode(
				IpcMessage.create({
					push: {
						typeUrl: `type.googleapis.com/${id}`,
						value: buffer,
					},
				}),
			).finish(),
		)
	}

	public handlePacket(connection: bigint, packet: Packet): Packet | undefined {
		if (this.packetListener) return this.packetListener(connection, packet)

		return packet
	}
}

class IpcServer extends TypedEventEmitter<ServerEvents> {
	public listen() {
		new Server({
			port: 41348,
			perMessageDeflate: false,
		}).on('connection', (socket) => {
			const connection = new IpcConnection(socket)
			const dispatcher = new RpcDispatcher(connection)

			dispatcher.registerService(HandshakeServiceServiceName, new HandshakeServiceImpl(dispatcher))

			socket.on('message', async (message) => {
				if (message instanceof Uint8Array) {
					try {
						const decoded = IpcMessage.decode(message)

						if (!decoded.request) throw 'expected a request'

						try {
							socket.send(
								IpcMessage.encode(
									IpcMessage.create({
										response: await dispatcher.dispatch(decoded.request),
									}),
								).finish(),
							)
						} catch (e) {
							socket.send(
								IpcMessage.encode(
									IpcMessage.create({
										error: {
											id: decoded.request.id,
											message: typeof e === 'string' ? e : e.toString(),
										},
									}),
								).finish(),
							)
						}
					} catch (e) {
						socket.send(
							IpcMessage.encode(
								IpcMessage.create({
									error: {
										id: 0,
										message: typeof e === 'string' ? e : e.toString(),
									},
								}),
							).finish(),
						)
					}
				}
			})
		})
	}
}

export const ipcServer = new IpcServer()
