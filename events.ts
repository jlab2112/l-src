import { type PacketReader, type PacketWriter, State } from '@lilithmod/unborn-mcproto'
import type { LilithClient } from '@/client.js'
import { clientboundEvents, clientboundEventsAsync, serverboundEvents, serverboundEventsAsync } from '@/events.js'
import { deserialize, deserializers, serialize } from '@/packets/deserialize.js'
import { PacketEvent } from '@/types/events.js'
import type { Packet } from '@/types/packets/minecraft/packets.js'

export class IncomingPacketEvent {
	public modified?: PacketReader | Buffer | PacketWriter
	public cancelled = false

	public constructor(public readonly packet: PacketReader) {}
}

export async function processClientboundPacket(incoming: IncomingPacketEvent, client: LilithClient) {
	if (client.ended) return (incoming.cancelled = true)

	const { packet } = incoming

	if (
		(client.state !== State.Play ||
			!deserializers.get('minecraft').toClient.has(packet.id) ||
			(!clientboundEvents.has(packet.id) && !clientboundEventsAsync.has(packet.id))) &&
		!client.ended
	)
		return

	const event = new PacketEvent(client, deserialize('minecraft', 'toClient', packet))
	const asyncEvents = clientboundEventsAsync.get(packet.id) ?? []

	for (const e of asyncEvents) {
		e.handler(event).catch((err) => {
			Lilith.error(`An event listener for ${e.description} failed with the reason ${err}`)
			Lilith.error(err)
		})
	}

	const syncEvents = clientboundEvents.get(packet.id) ?? []

	for (const e of syncEvents) {
		if (!e.ignoreCancelled && event.cancelled) continue
		try {
			await e.handler(event)
		} catch (err) {
			Lilith.error(`An event listener for ${e.description} failed with the reason ${err}`)
			Lilith.error(err)
		}
	}

	if (event.cancelled) return (incoming.cancelled = true)

	try {
		if (!client.ended) {
			if (syncEvents.length !== 0) incoming.modified = serialize('minecraft', 'toClient', event.packet as Packet).encode()
		} else incoming.cancelled = true
	} catch (e) {}
}

export async function processServerboundPacket(incoming: IncomingPacketEvent, client: LilithClient) {
	if (client.ended) return (incoming.cancelled = true)

	const { packet } = incoming

	if (
		(client.state !== State.Play ||
			!deserializers.get('minecraft').toServer.has(packet.id) ||
			(!serverboundEvents.has(packet.id) && !serverboundEventsAsync.has(packet.id))) &&
		!client.ended
	)
		return

	const event = new PacketEvent(client, deserialize('minecraft', 'toServer', packet))
	const asyncEvents = serverboundEventsAsync.get(packet.id) ?? []

	for (const e of asyncEvents) {
		e.handler(event).catch((err) => {
			Lilith.error(`An event listener for "${e.description}" failed with the reason ${err}`)
			Lilith.error(err)
		})
	}

	const syncEvents = serverboundEvents.get(packet.id) ?? []

	for (const e of syncEvents) {
		if (!e.ignoreCancelled && event.cancelled) continue
		try {
			await e.handler(event)
		} catch (err) {
			Lilith.error(`An event listener for "${e.description}" failed with the reason ${err}`)
			Lilith.error(err)
		}
	}

	if (event.cancelled) return (incoming.cancelled = true)

	try {
		if (!client.ended) {
			if (syncEvents.length !== 0) incoming.modified = serialize('minecraft', 'toServer', event.packet as Packet).encode()
		} else incoming.cancelled = true
	} catch (e) {}
}
