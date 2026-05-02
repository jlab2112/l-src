import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import type { PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import type { Lunar } from '@/types/packets/lunar/packets.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Packet } from '@/types/packets/minecraft/packets.js'

export const serializers: Serializers = new Map()
export const deserializers: Deserializers = new Map()

type Deserializers = Map<
	string,
	{ toServer: Map<number, (packet: PacketReader) => unknown>; toClient: Map<number, (packet: PacketReader) => unknown> }
>
type Serializers = Map<
	string,
	{ toServer: Map<number, (packet: Packet | Lunar.Packet) => PacketWriter>; toClient: Map<number, (packet: Packet | Lunar.Packet) => PacketWriter> }
>

export function serialize(namespace: string, direction: 'toClient' | 'toServer', packet: Packet | Lunar.Packet): PacketWriter {
	if ('packetId' in packet) return serializers.get(namespace)[direction].get(packet.packetId)(packet)
	return serializers.get(namespace)[direction].get(Ids.Play[direction][packet.metadata.name])(packet)
}

export function deserialize(namespace: string, direction: 'toClient' | 'toServer', packet: PacketReader) {
	return deserializers.get(namespace)[direction].get(packet.id)(packet)
}

async function* readPackets(): AsyncIterableIterator<{
	namespace: string
	id: number
	direction: 'toClient' | 'toServer' | 'shared'
	read?: (packet: PacketReader) => Packet
	write?: (packet: Packet) => PacketWriter
}> {
	for (const namespace of await fs.readdir(__dirname)) {
		if (namespace.startsWith('deserialize')) continue
		for (const direction of await fs.readdir(path.join(__dirname, namespace))) {
			for (const packet of await fs.readdir(path.join(__dirname, namespace, direction))) {
				if (!packet.includes('.map')) {
					yield await import(path.join(__dirname, namespace, direction, packet))
				}
			}
		}
	}
}
;(async () => {
	for await (const { namespace, id, direction, read, write } of readPackets()) {
		if (read != null) {
			if (!deserializers.has(namespace))
				deserializers.set(namespace, {
					toClient: new Map(),
					toServer: new Map(),
				})
			if (direction === 'shared') {
				deserializers.get(namespace).toClient.set(id, read)
				deserializers.get(namespace).toServer.set(id, read)
			} else deserializers.get(namespace)[direction].set(id, read)
		}

		if (write != null) {
			if (!serializers.has(namespace))
				serializers.set(namespace, {
					toClient: new Map(),
					toServer: new Map(),
				})
			if (direction === 'shared') {
				serializers.get(namespace).toClient.set(id, write)
				serializers.get(namespace).toServer.set(id, write)
			} else serializers.get(namespace)[direction].set(id, write)
		}
	}
})()
