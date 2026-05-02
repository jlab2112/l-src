import { HandshakeRequest, HandshakeResponse, type HandshakeService } from '@lilithmod/protos/lilith/ipc/handshake/v1/service'
import { PacketServiceServiceName } from '@lilithmod/protos/lilith/ipc/packet/v1/service'
import chalk from 'chalk'
import { clientboundEvents, clientboundEventsAsync, serverboundEvents, serverboundEventsAsync } from '@/events'
import { lc } from '@/log'
import type { RpcDispatcher } from '../rpc'
import { ipcServer } from '../server'
import type { Service } from '../service'
import { PacketServiceImpl } from './packet'

export class HandshakeServiceImpl implements HandshakeService, Service {
	constructor(private readonly dispatcher: RpcDispatcher) {}

	public async Login(request: HandshakeRequest): Promise<HandshakeResponse> {
		Lilith.msg(`${lc.blue('IPC')} ${chalk.gray('»')} ${lc.white(`Connected to Minecraft ${request.gameVersion.name}`)}`)

		this.dispatcher.registerService(PacketServiceServiceName, new PacketServiceImpl(this.dispatcher.connection))

		ipcServer.emit('connection', this.dispatcher.connection)

		return HandshakeResponse.create({
			successfulHandshake: {
				handledClientboundPackets: [...clientboundEvents.keys(), ...clientboundEventsAsync.keys()],
				handledServerboundPackets: [...serverboundEvents.keys(), ...serverboundEventsAsync.keys()],
			},
		})
	}

	public types(_method: string) {
		return [HandshakeRequest, HandshakeResponse]
	}
}
