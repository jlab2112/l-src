import EventEmitter from 'node:events'
import type { ClientRequestArgs } from 'node:http'
import type { Packet, PacketTypes } from '@lilithmod/types/websocket'
import WebSocket from 'ws'
import log, { lc } from '@/log.js'

export interface LilithWebsocket extends EventEmitter {
	on: <Name extends keyof PacketTypes>(
		name: PacketTypes[Name]['name'],
		listener: (data: PacketTypes[Name]['data']) => void,
	) => this
	once: <Name extends keyof PacketTypes>(
		name: PacketTypes[Name]['name'],
		listener: (data: PacketTypes[Name]['data']) => void,
	) => this
	send: <Name extends keyof PacketTypes>(name: PacketTypes[Name]['name'], data: PacketTypes[Name]['data']) => void
}

let ws: WebSocket

let first = true

const WEBSOCKET_URL = 'wss://ws.lilith.rip/'
// if (process.argv.includes('--dev-ws')) {
// 	WEBSOCKET_URL = 'ws://localhost:5175'
// }

let WEBSOCKET_OPTIONS: WebSocket.ClientOptions | ClientRequestArgs = {
	family: 4,
}
if (process.argv.includes('--dev-ws')) {
	WEBSOCKET_OPTIONS = {}
}

let queue: Array<Packet> = []
const lilithWebsocket: LilithWebsocket = new EventEmitter() as unknown as LilithWebsocket
lilithWebsocket.setMaxListeners(50)
let reconnectSeconds = 0

function connect() {
	try {
		Lilith.log.info('Connecting to Websocket')
		ws = new WebSocket(WEBSOCKET_URL, WEBSOCKET_OPTIONS)

		ws.on('error', () => {})

		ws.on('open', () => {
			lilithWebsocket.emit('open')

			if (first) {
				first = false
			} else if (reconnectSeconds > 0) {
				log.raw(lc.blue('Websocket') + lc.black(' » ') + lc.gray('Reconnected'), 'WEBSOCKET')
			}
			reconnectSeconds = 0
			Lilith.log.success('Connected to Websocket')
			for (const packet of queue) {
				lilithWebsocket.send(packet.name, packet.data)
			}
			queue = []
		})

		ws.on('close', (code, reason) => {
			Lilith.log.debug('code', code)
			Lilith.log.debug('reason', reason.toString())

			if (reconnectSeconds > 0) {
				log.raw(
					lc.blue('Websocket') +
						lc.black(' » ') +
						lc.gray(`Disconnected! Retrying in ${reconnectSeconds} seconds...`),
					'WEBSOCKET',
				)
			}
			setTimeout(connect, reconnectSeconds * 1000)
			if (reconnectSeconds === 0) reconnectSeconds = 2
			else if (reconnectSeconds === 2) reconnectSeconds = 5
		})

		ws.on('message', (data) => {
			try {
				const packet = JSON.parse(data.toString())
				lilithWebsocket.emit(packet.name, packet.data)
			} catch (err) {
				Lilith.error('Received invalid packet from websocket: ', err)
			}
		})
	} catch (err) {
		Lilith.error(err)
		log.raw(lc.blue('Websocket') + lc.black(' » ') + lc.gray('Disconnected! Please report this error.'), 'WEBSOCKET')
		// setTimeout(connect, 5000)
	}
}

connect()

lilithWebsocket.send = (name, data) => {
	if (ws != null && ws.readyState === WebSocket.OPEN) {
		ws.send(
			JSON.stringify({
				name,
				data,
			}),
		)
	} else {
		queue.push({
			name,
			data,
		})
	}
}

export default lilithWebsocket
