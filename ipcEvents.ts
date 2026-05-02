import { type PacketReader, State } from '@lilithmod/unborn-mcproto'
import type { LilithClient } from '@/client.js'
import {
	clientboundEvents,
	clientboundEventsAsync,
	clientboundPacketDelay,
	serverboundEvents,
	serverboundEventsAsync,
	serverboundPacketDelay,
} from '@/events.js'
import { deserialize, deserializers, serialize } from '@/packets/deserialize.js'
import { PacketEvent } from '@/types/events.js'
import type { Packet } from '@/types/packets/minecraft/packets.js'

export async function processClientboundPacket(packet: PacketReader, client: LilithClient) {
	if (client.ended) return

	if (
		(client.state !== State.Play ||
			!deserializers.get('minecraft').toClient.has(packet.id) ||
			(!clientboundEvents.has(packet.id) && !clientboundEventsAsync.has(packet.id))) &&
		!client.ended
	)
		return client.sendClientbound(packet)

	const event = new PacketEvent(client, deserialize('minecraft', 'toClient', packet))
	const asyncEvents = clientboundEventsAsync.get(packet.id) ?? []

	for (const e of asyncEvents) {
		e.handler(event).catch((err) => {
			console.log(`An event listener for ${e.description} failed with the reason ${err}`)
			console.log(err)
		})
	}

	const syncEvents = clientboundEvents.get(packet.id) ?? []

	for (const e of syncEvents) {
		if (!e.ignoreCancelled && event.cancelled) continue
		try {
			await e.handler(event)
		} catch (err) {
			console.log(`An event listener for ${e.description} failed with the reason ${err}`)
			console.log(err)
		}
	}

	if (event.cancelled) return

	try {
		if (clientboundPacketDelay < 4) {
			if (!client.ended)
				client.sendClientbound(syncEvents.length === 0 ? packet.buffer : serialize('minecraft', 'toClient', event.packet as Packet).encode())
		} else {
			setTimeout(() => {
				if (!client.ended)
					client.sendClientbound(
						syncEvents.length === 0 ? packet.buffer : serialize('minecraft', 'toClient', event.packet as Packet).encode(),
					)
			}, clientboundPacketDelay)
		}
	} catch (e) {}
}

export async function processServerboundPacket(packet: PacketReader, client: LilithClient) {
	if (client.ended) return

	if (
		(client.state !== State.Play ||
			!deserializers.get('minecraft').toServer.has(packet.id) ||
			(!serverboundEvents.has(packet.id) && !serverboundEventsAsync.has(packet.id))) &&
		!client.ended
	)
		return client.sendServerbound(packet)

	const event = new PacketEvent(client, deserialize('minecraft', 'toServer', packet))
	const asyncEvents = serverboundEventsAsync.get(packet.id) ?? []

	for (const e of asyncEvents) {
		e.handler(event).catch((err) => {
			console.log(`An event listener for "${e.description}" failed with the reason ${err}`)
			console.log(err)
		})
	}

	const syncEvents = serverboundEvents.get(packet.id) ?? []

	for (const e of syncEvents) {
		if (!e.ignoreCancelled && event.cancelled) continue
		try {
			await e.handler(event)
		} catch (err) {
			console.log(`An event listener for "${e.description}" failed with the reason ${err}`)
			console.log(err)
		}
	}

	if (event.cancelled) return

	try {
		if (serverboundPacketDelay < 4) {
			if (!client.ended) client.sendServerbound(syncEvents.length === 0 ? packet : serialize('minecraft', 'toServer', event.packet as Packet))
		} else {
			setTimeout(() => {
				if (!client.ended)
					client.sendServerbound(syncEvents.length === 0 ? packet : serialize('minecraft', 'toServer', event.packet as Packet))
			}, serverboundPacketDelay)
		}
	} catch (e) {}
}
