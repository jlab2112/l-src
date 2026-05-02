import { ChatMessage, MessageBuilder } from 'prismarine-chat'
import { addAsyncListener, addListener } from '@/events.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, ScoreboardTeamMode } from '@/types/packets/minecraft/packets.js'

let isInBedwars = false

addAsyncListener<PacketEvent<Play.toClient.ScoreboardObjectivePacket>>(
	Ids.Play.toClient.scoreboard_objective,
	'toClient',
	'Scoreboard team create',
	10,
	async ({ packet }) => {
		if (packet.data.action === 0 || packet.data.action === 2) {
			const message = new ChatMessage(MessageBuilder.fromString(packet.data.displayText)).toString()
			if (message === 'BED WARS') {
				if (!isInBedwars) {
					isInBedwars = true
					Lilith.log.info('in bedwars (lobby)')
				}
			}
		}
	},
)

addListener<PacketEvent<Play.toClient.ScoreboardTeamPacket>>(
	Ids.Play.toClient.scoreboard_team,
	'toClient',
	'delete scoreboard joins',
	10,
	true,
	async ({ client, packet, setCancelled }) => {
		Lilith.log.trace(packet)
		if (isInBedwars && !client.isLobby && !client.gameInfo.started) {
			if (packet.data.mode === ScoreboardTeamMode.AddPlayers || packet.data.mode === ScoreboardTeamMode.Create) {
				if (packet.data.team.length === 2) {
					Lilith.log.trace(packet)
					setCancelled(true)
				}
			}
		}
	},
)
