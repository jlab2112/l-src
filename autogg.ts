import { ChatMessage } from 'prismarine-chat'
import { requeue } from '@/commands/implementations/game/requeue.js'
import config from '@/config.js'
import { addAsyncListener } from '@/events.js'
import autoggTriggers from '@/ressources/gameEndTrigger'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import { permission } from '@/utils/permissions.js'

let firstMessageTimeout: NodeJS.Timeout | null = null
let secondMessageTimeout: NodeJS.Timeout | null = null
let requeueTimeout: NodeJS.Timeout | null = null

const autoGGIndexes = { first: 0, second: 0 }

addAsyncListener<PacketEvent<Play.toClient.ChatPacket>>(
	Ids.Play.toClient.chat,
	'toClient',
	'AutoGG triggers',
	20,
	async ({ client, packet }) => {
		if (autoggTriggers.length === 0 || !config().autogg.enabled || !permission('lilith.autogg')) return
		const message = new ChatMessage(JSON.parse(packet.data.message)).toMotd().replace(/§./g, '')
		const result = autoggTriggers.find((regex) => regex.test(message))
		if (result != null) {
			if (config().autogg.first.enabled) {
				firstMessageTimeout = setTimeout(() => {
					const firstMessages = config().autogg.first.message.split(';')
					const firstMessage = firstMessages[autoGGIndexes.first]
					if (autoGGIndexes.first + 1 < firstMessages.length) {
						autoGGIndexes.first++
					} else if (autoGGIndexes.first + 1 === firstMessages.length) {
						autoGGIndexes.first = 0
					}
					writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
						metadata: {
							name: 'chat',
							state: 'play',
							id: Ids.Play.toServer.chat,
						},
						data: {
							message: firstMessage.startsWith('/') ? firstMessage : `/ac ${firstMessage}`,
						},
					})
					if (config().autogg.second.enabled) {
						const secondMessages = config().autogg.second.message.split(';')
						const secondMessage = secondMessages[autoGGIndexes.second]
						if (autoGGIndexes.second + 1 < secondMessages.length) {
							autoGGIndexes.second++
						} else if (autoGGIndexes.second + 1 === secondMessages.length) {
							autoGGIndexes.second = 0
						}
						secondMessageTimeout = setTimeout(() => {
							writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
								metadata: {
									name: 'chat',

									state: 'play',
									id: Ids.Play.toServer.chat,
								},
								data: {
									message: secondMessage.startsWith('/') ? secondMessage : `/ac ${secondMessage}`,
								},
							})
							if (config().autogg.requeue.enabled && permission('lilith.autogg.requeue')) {
								requeueTimeout = setTimeout(() => {
									if (
										config().autogg.requeue.on === 'both' ||
										config().autogg.requeue.on === client.gameInfo.endState
									)
										requeue(client, true)
								}, Number.parseInt(config().autogg.requeue.delay.toString()) + 20)
							}
						}, config().autogg.second.delay)
					} else if (config().autogg.requeue.enabled && client.location.mode !== 'HOLE_IN_THE_WALL') {
						requeueTimeout = setTimeout(() => {
							if (
								config().autogg.requeue.on === 'both' ||
								config().autogg.requeue.on === client.gameInfo.endState
							)
								requeue(client, true)
						}, Number.parseInt(config().autogg.requeue.delay.toString()) + 20)
					}
				}, config().autogg.first.delay)
			} else if (config().autogg.requeue.enabled && client.location.mode !== 'HOLE_IN_THE_WALL') {
				requeueTimeout = setTimeout(() => {
					if (config().autogg.requeue.on === 'both' || config().autogg.requeue.on === client.gameInfo.endState)
						requeue(client, true)
				}, Number.parseInt(config().autogg.requeue.delay.toString()) + 20)
			}
		}
	},
)

// Adds an async listener for login packets sent to the client
addAsyncListener<PacketEvent<Play.toClient.LoginPacket>>(
	Ids.Play.toClient.login,
	'toClient',
	'AutoGG timeout clearing',
	30,
	async (_event) => {
		clearTimeout(firstMessageTimeout)
		clearTimeout(secondMessageTimeout)
		clearTimeout(requeueTimeout)
	},
)
