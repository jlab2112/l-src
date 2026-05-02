import type { LilithClient } from '@/client.js'
import { addAsyncListener } from '@/events.js'
import { sendToLauncher } from '@/index.js'
import autoggTriggers from '@/ressources/gameEndTrigger'
import { locationToGamemodeConvertor } from '@/stats/getStatsMessage.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { ChatPosition } from '@/utils/chat.js'
import lilithWebsocket from '@/websocket/socket.js'
import gameEmitter from './emitters/gameEmitter.js'

const ChatMessage = require('prismarine-chat').ChatMessage

const gameStartMessage = [
	'§r§f§lBed Wars§r',
	'§r§5§lSkyWars§r', // corrupted game
	'§r§f§lSkyWars§r',
	'§r§f§lBridge Duel§r',
	'§r§f§lBridge Doubles§r',
	'§r§f§lBridge 3v3§r',
	'§r§f§lBridge Teams§r',
	'§r§f§lBridge CTF Threes§r',
	'§r§f§lBridge 2v2v2v2§r',
	'§r§f§lBridge 3v3v3v3§r',
	'§r§f§lUHC Duel§r',
	'§r§f§lUHC Doubles§r',

	'§r§f§lUHC Teams§r',
	'§r§f§lUHC Deathmatch§r',
	'§r§f§lNoDebuff Duel§r',
	'§r§f§lBoxing Duel§r',
	'§r§f§lBow Duel§r',
	'§r§f§lClassic Duel§r',
	'§r§f§lOP Duel§r',
	'§r§f§lMegaWalls Duel§r',
	'§r§f§lBlitz Duel§r',
	'§r§f§lSkyWars Duel§r',
	'§r§f§lCombo Duel§r',
	'§r§f§lBow Spleef Duel§r',
	'§r§f§lSumo Duel§r',
	'§r§f§lHypixel Parkour§r',
	'§r§f§lDuel Arena§r',
	'§r§f§lSkyWars Doubles§r',
	'§r§f§lMegaWalls Doubles§r',
	'§r§f§lOP Doubles§r',
	'§r§f§lQuakecraft Duel§r',
	'§r§f§lBed Wars Duels§r',
	'§r§f§lSpleef Duel§r',
]

function addToSession(client: LilithClient, gm: string, type: 'wins' | 'losses') {
	if (!client.sessionStats[gm]) {
		client.sessionStats[gm] = type === 'wins' ? { losses: 0, wins: 1 } : { losses: 1, wins: 0 }
	} else {
		client.sessionStats[gm][type] += 1
	}
}

gameEmitter.on('defeat', (client: LilithClient) => {
	const gamemode = locationToGamemodeConvertor(client.location, true)
	Lilith.msg('\u001b[38;5;196m┗━━━━━━━━━━━━━━━━\u001b[0m Defeat')
	Lilith.log.info(`${client.username} (${client.uuid}) has lost a ${gamemode} game`)
	sendToLauncher({ data: `loss:${gamemode}`, type: 'game' })
	addToSession(client, gamemode, 'losses')
})

gameEmitter.on('victory', (client: LilithClient) => {
	const gamemode = locationToGamemodeConvertor(client.location, true)
	Lilith.msg('\u001b[38;5;70m┗━━━━━━━━━━━━━━━━\u001b[0m Victory')
	Lilith.log.info(`${client.username} (${client.uuid}) has won a ${gamemode} game`)
	sendToLauncher({ data: `win:${gamemode}`, type: 'game' })
	addToSession(client, gamemode, 'wins')
})

addAsyncListener<PacketEvent<Play.toClient.LoginPacket>>(
	Ids.Play.toClient.login,
	'toClient',
	'Game Start Reset',
	0,
	async ({ client }) => {
		if (client.gameInfo.endState === 'loss' && client.gameInfo.started && !client.gameInfo.ended) {
			gameEmitter.emit('defeat', client)
		}
		client.resetGameInfo()
		if (client.nextGameDuel) {
			setTimeout(() => {
				client.nextGameDuel = false
			}, 8000)
		}
	},
)

const isStarted = (str) => {
	for (const msg of gameStartMessage) {
		if (str.endsWith(msg)) return true
	}
	return false
}

const killMessageRegex =
	/^§(?<victimColor>.)(?<victim>\w{1,16}) ?§r.+(by|of|to|for|with|the|from|was|fighting|against|meet) §r§(?<killerColor>.)(?<killer>\w{1,16})/
const deathMessageRegex = /^§(?<victimColor>.)(?<victim>\w{1,16}) §r§7(fell|died|disconnected).*\.§r$/

addAsyncListener<PacketEvent<Play.toClient.ChatPacket>>(
	Ids.Play.toClient.chat,
	'toClient',
	'Game Listener',
	5,
	async ({ client, packet }) => {
		if (packet.data.position === ChatPosition.ActionBar) return
		const message = new ChatMessage(JSON.parse(packet.data.message))
		const motd = message.toMotd()
		const str: string = motd.replace(/§./g, '')

		const autoGGMatchResult = autoggTriggers.find((regex) => regex.test(str))
		Lilith.log.trace(message.toMotd())

		if (str.startsWith('Woah there')) {
			gameEmitter.emit('woah', client)
			return
		}

		if (isStarted(motd)) {
			if (!client.gameInfo.started && client.gameInfo.ended == null) {
				gameEmitter.emit('start', client)
				client.gameInfo.started = true
				client.gameInfo.ended = false
				const gamemode = locationToGamemodeConvertor(client.location, true)
				lilithWebsocket.send<'gamePlayed'>('gamePlayed', gamemode)
			}
			Lilith.log.info(
				`${client.username} (${client.uuid}) has started a ${locationToGamemodeConvertor(client.location, true)} game`,
			)
			return
		}

		if (motd.endsWith('§r§e§lWINNER!§r') || str === '§cYou have been eliminated!') {
			client.gameInfo.ended = true
			client.gameInfo.endState = 'loss'

			gameEmitter.emit('defeat', client)
			return
		}
		if (motd.includes('§r§e§lWINNER!  ')) {
			client.gameInfo.endState = 'win'
			client.gameInfo.ended = true

			//	const victory = str.match(/\s+(?:\[.+] )?(.{1,16}) WINNER! {2}(?:\[.+] )?(.{1,16})/)

			gameEmitter.emit('victory', client)

			return
		}

		if (str.match(/^.{1,16} reconnected\.$/)) {
			const player = str.split(' ')[0]
			if (player === client.username) gameEmitter.emit('start', client)
			return
		}

		if (autoGGMatchResult) {
			client.gameInfo.ended = true
			return
		}

		const killMatch = motd.match(killMessageRegex)
		if (killMatch != null) {
			const killer = killMatch.groups.killer
			const victim = killMatch.groups.victim

			gameEmitter.emit('kill', client, killer, victim)
			return
		}

		const deathMatch = motd.match(deathMessageRegex)
		if (deathMatch != null) {
			const victim = deathMatch.groups.victim

			gameEmitter.emit('death', client, victim)

			return
		}

		const joined = str.match(/ \((\d+)\/(\d+)\)!/)
		if (joined != null) {
			const current = joined[1]
			const max = joined[2]
			const player = str.substring(0, str.indexOf(' '))
			client.gameInfo.currentPlayers = Number.parseInt(current)
			client.gameInfo.maxPlayers = Number.parseInt(max)
			gameEmitter.emit('player-joined', client, player)
			Lilith.log.debug(`${player}-${current}/${max}`)
		} else {
			const quit = str.match(/(\w+) has quit!/)
			if (quit != null) {
				const player = quit[1]
				client.gameInfo.currentPlayers--
				gameEmitter.emit('player-left', client, player)
				Lilith.log.debug(`-${player}-${client.gameInfo.currentPlayers}/${client.gameInfo.maxPlayers}`)
			} else {
				const timer = str.match(/The game starts in (\d+) seconds?!/)
				if (timer != null) {
					const time = Number.parseInt(timer[1])
					client.gameInfo.timeLeft = time
					gameEmitter.emit('timer', client, time)
					Lilith.log.trace(time)
				} else if (motd.includes("§r§a's Duel request!§r") || motd.includes('§r§a accepted the Duel request!§r')) {
					client.nextGameDuel = true
				}
			}
		}
	},
)
