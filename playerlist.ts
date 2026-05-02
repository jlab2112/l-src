import { addAsyncListener } from '@/events.js'
import store from '@/store'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, PlayerInfoAction } from '@/types/packets/minecraft/packets.js'

addAsyncListener<PacketEvent<Play.toClient.PlayerInfoPacket>>(
	Ids.Play.toClient.player_info,
	'toClient',
	'Playerlist Listener',
	5,
	async ({ client, packet }) => {
		if (!Array.isArray(client.players)) client.players = []
		if (!Array.isArray(client.bots)) client.bots = []
		switch (packet.data.action) {
			case PlayerInfoAction.AddPlayer:
				{
					for (const item of packet.data.data) {
						if (item.UUID.toString().substring(14, 15) === '2' && item.name !== '') {
							client.bots.push(item.name)
						}
						if (store().nicknames[item.name.toLowerCase()] != null) {
							client.gameInfo.friendNicknameUUIDs.set(store().nicknames[item.name.toLowerCase()].toLowerCase(), item.UUID)
						}
						client.players.push({
							uuid: item.UUID,
							name: item.name,
							properties: item.properties,
							gamemode: item.gamemode,
							ping: item.ping,
							displayName: item.displayName,
						})
						if (!client.bots.includes(item.name) && !item.name.startsWith('§k')) await client.nextPlayer(item.UUID.replaceAll('-', ''))
					}
				}
				break
			case PlayerInfoAction.RemovePlayer:
				{
					for (const item of packet.data.data) {
						client.players.splice(client.players.findIndex((p) => p.uuid === item.UUID))
					}
				}
				break
			case PlayerInfoAction.UpdateDisplayName:
				{
					for (const item of packet.data.data) {
						const index = client.players.findIndex((p) => p.uuid === item.UUID)
						const player = client.players[index]
						if (player != null) {
							player.displayName = item.displayName
							client.players[index] = player
						}
					}
				}
				break
			case PlayerInfoAction.UpdateGamemode:
				{
					for (const item of packet.data.data) {
						const index = client.players.findIndex((p) => p.uuid === item.UUID)
						const player = client.players[index]
						if (player != null) {
							player.gamemode = item.gamemode
							client.players[index] = player
						}
					}
				}
				break
			case PlayerInfoAction.UpdatePing: {
				for (const item of packet.data.data) {
					const index = client.players.findIndex((p) => p.uuid === item.UUID)
					const player = client.players[index]
					if (player != null) {
						player.ping = item.ping
						client.players[index] = player
					}
				}
			}
		}
	},
)

export interface Player {
	uuid: string
	name: string
	properties: Array<{
		name: string
		value: string
		signature?: string
	}>
	gamemode: number
	ping: number
	displayName?: string
}
