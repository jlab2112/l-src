import { type PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, ScoreboardTeamMode } from '@/types/packets/minecraft/packets.js'

export const namespace = 'minecraft'
export const id = Ids.Play.toClient.scoreboard_team
export const direction = 'toClient'

export const read = (packet: PacketReader): Play.toClient.ScoreboardTeamPacket => {
	const team = packet.readString()
	const mode = packet.readInt8()
	if (mode === ScoreboardTeamMode.Create) {
		return {
			metadata: {
				name: 'scoreboard_team',
				state: 'play',
				id,
			},
			data: {
				team,
				mode,
				name: packet.readString(),
				prefix: packet.readString(),
				suffix: packet.readString(),
				friendlyFire: packet.readInt8(),
				nameTagVisibility: packet.readString() as 'always' | 'hideForOtherTeams' | 'hideForOwnTeam' | 'never',
				color: packet.readInt8(),
				players: packet.readArray<string>(packet.readString.bind(packet)),
			},
		}
	}
	if (mode === ScoreboardTeamMode.Remove) {
		return {
			metadata: {
				name: 'scoreboard_team',
				state: 'play',
				id,
			},
			data: { team, mode },
		}
	}
	if (mode === ScoreboardTeamMode.UpdateInformation) {
		return {
			metadata: {
				name: 'scoreboard_team',
				state: 'play',
				id,
			},
			data: {
				team,
				mode,
				name: packet.readString(),
				prefix: packet.readString(),
				suffix: packet.readString(),
				friendlyFire: packet.readInt8(),
				nameTagVisibility: packet.readString() as 'always' | 'hideForOtherTeams' | 'hideForOwnTeam' | 'never',
				color: packet.readInt8(),
			},
		}
	}
	return {
		metadata: {
			name: 'scoreboard_team',
			state: 'play',
			id,
		},
		data: {
			team,
			mode,
			players: packet.readArray<string>(packet.readString.bind(packet)),
		},
	}
}

export const write = (packet: Play.toClient.ScoreboardTeamPacket): PacketWriter => {
	const writer = new PacketWriter(id)
	writer.writeString(packet.data.team)
	writer.writeInt8(packet.data.mode)
	if (packet.data.mode === ScoreboardTeamMode.Create || packet.data.mode === ScoreboardTeamMode.UpdateInformation) {
		writer.writeString(packet.data.name)
		writer.writeString(packet.data.prefix)
		writer.writeString(packet.data.suffix)
		writer.writeInt8(packet.data.friendlyFire)
		writer.writeString(packet.data.nameTagVisibility)
		writer.writeInt8(packet.data.color)
	}
	if (packet.data.mode !== ScoreboardTeamMode.Remove && packet.data.mode !== ScoreboardTeamMode.UpdateInformation)
		writer.writeArray<string>(packet.data.players, writer.writeString.bind(writer))
	return writer
}
