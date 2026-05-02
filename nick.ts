import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import { addAsyncListener } from '@/events.js'
import store, { updateStore } from '@/store.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, PlayerInfoAction } from '@/types/packets/minecraft/packets.js'
import { chat } from '@/utils/chat.js'
import lilithWebsocket from '@/websocket/socket.js'

registerCommand('lnick', [], {
	execute: async (client, _raw, parsed) => {
		const args = new lexure.Args(parsed)
		const nickname = args.single()
		const target = args.single()
		if (nickname == null) {
			chat(client, '&cSyntax &8> &7Please specify a nickname and a target (defaults to yourself)')
		} else if (nickname === 'reset') {
			chat(client, `&cLilith &8> &7Reset stored nickname from ${store().nickname}`)
			// noinspection JSIgnoredPromiseFromCall
			updateStore({ nickname: '' })
		} else {
			if (target == null || target === client.username) {
				chat(client, `&cLilith &8> &7Your stored nickname is now &c${nickname}`)
				// noinspection JSIgnoredPromiseFromCall
				updateStore({ nickname })
			} else {
				chat(client, `&cLilith &8> &c${target}&7's stored nickname is now &c${nickname}`)
				const nicknames = {}
				nicknames[nickname.toLowerCase()] = target
				// noinspection JSIgnoredPromiseFromCall
				updateStore({ nicknames })
			}
		}
	},
})

addAsyncListener<PacketEvent<Play.toClient.PlayerInfoPacket>>(
	Ids.Play.toClient.player_info,
	'toClient',
	'Nick Listener',
	1,
	async ({ client, packet }) => {
		if (packet.data.action === PlayerInfoAction.AddPlayer) {
			packet.data.data.forEach((p) => {
				if (p.UUID === client.uuid && p.name !== client.username) {
					updateStore({ nickname: p.name })
					lilithWebsocket.send<'nickname'>('nickname', {
						nickname: p.name,
						uuid: client.uuidShort,
					})
				}
			})
		}
	},
)
