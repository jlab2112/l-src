import { type IpcRequest, IpcResponse } from '@lilithmod/protos/lilith/ipc/protocol/v1/common'
import type { IpcConnection } from './server'
import type { Service } from './service'

export class RpcDispatcher {
	private readonly services = new Map<string, Service>()

	public constructor(public readonly connection: IpcConnection) {}

	public async dispatch(request: IpcRequest): Promise<IpcResponse> {
		const id = request.id
		const service = this.services.get(request.service)
		const types = service.types(request.method)
		const reply = await service[request.method](types[0].decode(request.message))

		return IpcResponse.create({
			id,
			message: types[1].encode(reply).finish(),
		})
	}

	public registerService(name: string, service: Service) {
		this.services.set(name, service)
	}
}
