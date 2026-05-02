import { addAsyncListener } from '@/events.js'
import { getTeamInitial } from '@/queuestats/tabstats'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, ScoreboardTeamMode } from '@/types/packets/minecraft/packets.js'

addAsyncListener<PacketEvent<Play.toClient.ScoreboardTeamPacket>>(
	Ids.Play.toClient.scoreboard_team,
	'toClient',
	'Scoreboard Listener',
	0,
	async ({ client, packet }) => {
		// console.log(packet.data)
		switch (packet.data.mode) {
			case ScoreboardTeamMode.Create:
				{
					// if (packet.data.players.includes(client.username) || packet.data.players.includes(store().nickname)) {
					//     console.log(packet.data)
					// }
					if (getTeamInitial(packet.data.team).initial !== null) {
						for (const player of packet.data.players) {
							const { initial } = getTeamInitial(packet.data.team)
							client.gameInfo.playerInitials.set(player, initial)
						}
					}
					client.scoreboardTeams.set(packet.data.team, {
						name: packet.data.team,
						displayName: packet.data.name,
						prefix: packet.data.prefix,
						suffix: packet.data.suffix,
						friendlyFire: packet.data.friendlyFire,
						nameTagVisibility: packet.data.nameTagVisibility,
						color: packet.data.color,
						players: packet.data.players,
					})
				}
				break
			case ScoreboardTeamMode.Remove:
				{
					client.scoreboardTeams.delete(packet.data.team)
				}
				break
			case ScoreboardTeamMode.UpdateInformation:
				{
					const team = client.scoreboardTeams.get(packet.data.team)
					team.displayName = packet.data.name
					team.prefix = packet.data.prefix
					team.suffix = packet.data.suffix
					team.friendlyFire = packet.data.friendlyFire
					team.nameTagVisibility = packet.data.nameTagVisibility
					team.color = packet.data.color
					client.scoreboardTeams.set(team.name, team)
				}
				break
			case ScoreboardTeamMode.AddPlayers:
				{
					// if (packet.data.players.includes(client.username) || packet.data.players.includes(store().nickname)) {
					//     console.log('added client to team name', packet.data.team)
					// }
					if (getTeamInitial(packet.data.team).initial !== null) {
						for (const player of packet.data.players) {
							const { initial } = getTeamInitial(packet.data.team)
							client.gameInfo.playerInitials.set(player, initial)
						}
					}
					const team = client.scoreboardTeams.get(packet.data.team)
					team.players.push(...packet.data.players)
				}
				break
			case ScoreboardTeamMode.RemovePlayers: {
				const team = client.scoreboardTeams.get(packet.data.team)
				const remove = new Set(packet.data.players)
				team.players = team.players.filter((x) => !remove.has(x))
			}
		}
	},
)

export interface ScoreboardTeam {
	name: string
	displayName?: string
	prefix?: string
	suffix?: string
	friendlyFire?: number
	nameTagVisibility?: 'always' | 'hideForOtherTeams' | 'hideForOwnTeam' | 'never'
	color?: number
	players: string[]
}
