import {
	CloseConnectionRequest,
	CloseConnectionResponse,
	ConnectionState,
	CreateConnectionRequest,
	CreateConnectionResponse,
	PacketHandleRequest,
	PacketHandleResponse,
	type PacketService,
	UpdateConnectionRequest,
	UpdateConnectionResponse,
} from '@lilithmod/protos/lilith/ipc/packet/v1/service'
import { State } from '@lilithmod/unborn-mcproto'
import { longToBigInt } from '@/utils/bignum'
import type { IpcConnection } from '../server'
import type { Service } from '../service'

export class PacketServiceImpl implements PacketService, Service {
	public constructor(private readonly connection: IpcConnection) {}

	public async CreateConnection(request: CreateConnectionRequest): Promise<CreateConnectionResponse> {
		this.connection.emit('connection', longToBigInt(request.id), this.protobufStateToLilithState(request.state))

		return CreateConnectionResponse.create({})
	}

	public async UpdateConnection(request: UpdateConnectionRequest): Promise<UpdateConnectionResponse> {
		const id = longToBigInt(request.id)
		const state = this.protobufStateToLilithState(request.newState)

		if (request.account) this.connection.emit('account', id, request.account)

		this.connection.emit('updateState', id, state)

		return UpdateConnectionResponse.create({})
	}

	public async CloseConnection(request: CloseConnectionRequest): Promise<CloseConnectionResponse> {
		this.connection.emit('close', longToBigInt(request.id))

		return CloseConnectionResponse.create({})
	}

	public async Handle(request: PacketHandleRequest): Promise<PacketHandleResponse> {
		return PacketHandleResponse.create({
			packet: this.connection.handlePacket(longToBigInt(request.id), request.packet),
		})
	}

	public types(method: string) {
		switch (method) {
			case 'CreateConnection':
				return [CreateConnectionRequest, CreateConnectionResponse]
			case 'UpdateConnection':
				return [UpdateConnectionRequest, UpdateConnectionResponse]
			case 'CloseConnection':
				return [CloseConnectionRequest, CloseConnectionResponse]
			case 'Handle':
				return [PacketHandleRequest, PacketHandleResponse]
		}
	}

	private protobufStateToLilithState(protobuf: ConnectionState): State {
		switch (protobuf) {
			case ConnectionState.HANDSHAKING:
				return State.Handshake
			case ConnectionState.STATUS:
				return State.Status
			case ConnectionState.LOGIN:
				return State.Login
			case ConnectionState.PLAY:
				return State.Play
			default:
				throw 'unrecognized state'
		}
	}
}
