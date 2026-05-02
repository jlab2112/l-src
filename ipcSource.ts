import { Packet, Packet_Direction } from '@lilithmod/protos/lilith/ipc/packet/v1/common'
import { AddPacketPush } from '@lilithmod/protos/lilith/ipc/packet/v1/push'
import { PacketReader, PacketWriter, State } from '@lilithmod/unborn-mcproto'
import { ipcServer } from '@/ipc/server'
import { type Connection, type PacketSource, type ServerStatus, TypedEventEmitter } from '@/types/sources'
import { bigIntToLong } from '@/utils/bignum'
import { IncomingPacketEvent } from './events'

type PacketHandler = (packet: PacketReader) => void
type SendablePacket = PacketReader | Buffer | PacketWriter

function packetIntoBuffer(packet: SendablePacket): Buffer {
	return packet instanceof PacketWriter ? packet.encode() : packet instanceof PacketReader ? packet.buffer : packet
}

class IpcSource implements PacketSource {
	public listen(status: (json: ServerStatus) => Promise<ServerStatus>, connected: (client: Connection) => Promise<void>) {
		ipcServer.on('connection', (ipcConnection) => {
			const connections = new Map<bigint, { connection: Connection }>()

			ipcConnection.on('connection', (id, state) => {
				const connection = new TypedEventEmitter() as Connection

				console.log(`new connection: ${id}`)

				connection.ended = false
				connection.state = state

				connection.onPacketClientbound = (id, handler) => {
					connection.on('packetClientbound', (incoming, state) => {
						if (typeof id !== 'number' || id === incoming.packet.id) handler(incoming.packet, state)
					})
				}

				connection.onPacketServerbound = (id, handler) => {
					connection.on('packetServerbound', (incoming, state) => {
						if (typeof id !== 'number' || id === incoming.packet.id) handler(incoming.packet, state)
					})
				}

				connection.oncePacketClientbound = (id, handler) => {
					const callback = (incoming: IncomingPacketEvent, state: State) => {
						if (typeof id !== 'number' || id === incoming.packet.id) {
							handler(incoming.packet, state)

							connection.off('packetClientbound', callback)
						}
					}

					connection.on('packetClientbound', callback)
				}

				connection.oncePacketServerbound = (id, handler) => {
					const callback = (incoming: IncomingPacketEvent, state: State) => {
						if (typeof id !== 'number' || id === incoming.packet.id) {
							handler(incoming.packet, state)

							connection.off('packetServerbound', callback)
						}
					}

					connection.on('packetServerbound', callback)
				}

				connection.nextPacketClientbound = (id, expectNext) => {
					return new Promise((resolve, reject) => {
						const listener = (incoming: IncomingPacketEvent, state: State) => {
							if (typeof id !== 'number' || id === incoming.packet.id) {
								resolve(incoming.packet)

								connection.off('packetClientbound', listener)
							} else if (expectNext && typeof id === 'number' && incoming.packet.id !== id) {
								reject(new Error(`Expected packet with id ${id} but got ${incoming.packet.id}`))
							}
						}

						connection.on('packetClientbound', listener)
					})
				}

				connection.nextPacketServerbound = (id, expectNext) => {
					return new Promise((resolve, reject) => {
						const listener = (incoming: IncomingPacketEvent, state: State) => {
							if (typeof id !== 'number' || id === incoming.packet.id) {
								resolve(incoming.packet)

								connection.off('packetServerbound', listener)
							} else if (expectNext && typeof id === 'number' && incoming.packet.id !== id) {
								reject(new Error(`Expected packet with id ${id} but got ${incoming.packet.id}`))
							}
						}

						connection.on('packetServerbound', listener)
					})
				}

				connection.sendClientbound = async (packet) => {
					return ipcConnection.push(
						'lilith.ipc.packet.v1.AddPacketPush',
						AddPacketPush.encode(
							AddPacketPush.create({
								id: bigIntToLong(id, false),
								packet: {
									direction: Packet_Direction.CLIENTBOUND,
									buffer: packetIntoBuffer(packet),
								},
							}),
						).finish(),
					)
				}

				connection.sendServerbound = async (packet) => {
					return ipcConnection.push(
						'lilith.ipc.packet.v1.AddPacketPush',
						AddPacketPush.encode(
							AddPacketPush.create({
								id: bigIntToLong(id, false),
								packet: {
									direction: Packet_Direction.SERVERBOUND,
									buffer: packetIntoBuffer(packet),
								},
							}),
						).finish(),
					)
				}

				connections.set(id, { connection })
			})

			ipcConnection.on('account', (id, account) => {
				const { connection } = connections.get(id)!

				connection.username = account.username
				connection.uuid = account.uuid
				connection.uuidShort = account.uuid.replace(/-/g, '')
			})

			ipcConnection.on('updateState', (id, state) => {
				const { connection } = connections.get(id)!

				connection.state = state

				if (state === State.Play) {
					connected(connection)
				}
			})

			ipcConnection.packetListener = (id, packet) => {
				const { connection } = connections.get(id)!

				const buffer = Buffer.from(packet.buffer)
				const incoming = new IncomingPacketEvent(new PacketReader(buffer))

				if (packet.direction === Packet_Direction.CLIENTBOUND) connection.emit('packetClientbound', incoming)
				else connection.emit('packetServerbound', incoming)

				if (incoming.cancelled) return
				if (!incoming.modified) return packet

				return Packet.create({
					direction: packet.direction,
					buffer: packetIntoBuffer(incoming.modified ?? buffer),
				})
			}
		})
	}
}

export const ipcSource = new IpcSource()
