import type { Player } from '@lilithmod/unborn-hypixel'
import type { ChatMessage } from 'prismarine-chat'
import type ws from 'websocket'
import type { Player as PlayerInterface } from '@/listeners/playerlist.js'
import type { ScoreboardTeam } from '@/listeners/scoreboardteams.js'
import type { AutododgeResults } from '@/queuestats/autododge.js'
import { fetchStats } from '@/queuestats/queuestats.js'
import { registerIntervalClear } from '@/queuestats/tabstats'
import type { HypixelLocation } from '@/types/HypixelLocation.js'
import type { Connection } from '@/types/sources.js'

export type LilithClient = ServerClient & Connection

export function initializeClient(client: LilithClient) {
	client.brand = ''
	client.isLobby = true
	client.nicksToReal = new Map<string, string>()
	client.scoreboardTeams = new Map<string, ScoreboardTeam>()
	client.hasResourcePack = false
	client.partyMembers = []
	client.partyLeader = ''
	client.usernameCache = new Map<string, string>()
	client.emitPlayersOnLocraw = []
	client.lunarTeammates = []
	client.clearDisplayNames = []
	client.autododgeRedirect = ''
	client.autododgeRedirectStage = 0
	client.nextGameDuel = false
	client.noDodgePlayers = []
	client.appearingOffline = false
	client.shouldReplaceAllRanks = true
	client.tags = {}
	client.position = {
		x: 0,
		y: 0,
		z: 0,
	}
	client.scoreboardLocationPromise = false

	client.resetGameInfo = () => {
		const map = client.gameInfo?.playerStats ?? new Map<string, Player>()
		map.clear()
		client.gameInfo = {
			started: false,
			ended: null,
			currentPlayers: 0,
			maxPlayers: 0,
			timeLeft: -1,
			successfullyCheckedPlayers: 0,
			dodged: false,
			dodgeReason: '',
			fakePlayers: [],
			obfuscatedPlayers: [],
			nickedPlayers: [],
			dodgeResults: [],
			skywarsCorruptionChance: 0,
			playerStats: new Map<string, Player>(),
			detectedPurchases: new Map<string, number | null>(),
			playerInitials: new Map<string, string>(),
			friendNicknameUUIDs: new Map<string, string>(),
			skinParts: -1,
			skinGlitchTimeout: null,
			alreadyCheckedPlayers: [],
			endState: 'loss',
		}
	}
	client.tabStatsIntervals = []

	client.tagID = ''

	client.apiKey = { value: '', valid: true }
	client.apiToken = ''

	client.sessionStats = {}

	client.resetGameInfo()
	client.nextPlayer = async (value: string) => {
		await fetchStats(client, value)
	}
	registerIntervalClear(client)
}

export type ServerClient = {
	brand: string

	scoreboardTeams: Map<string, ScoreboardTeam>
	players: PlayerInterface[]
	lunarTeammates: string[]
	bots: string[]

	hasResourcePack: boolean

	nicksToReal: Map<string, string>
	usernameCache: Map<string, string>

	receivedPlayers: string[]
	nextPlayer: (value: string) => Promise<void>

	tablistHeader: ChatMessage
	tablistFooter: ChatMessage

	position: {
		x: number
		y: number
		z: number
		yaw?: number
		pitch?: number
	}

	partyMembers: string[]
	partyLeader: string
	checkOnLocraw: string[]
	emitPlayersOnLocraw: string[]
	limboLoop: number
	isLobby: boolean
	hideNextWho: boolean
	autododgeRedirect: string
	autododgeRedirectStage: number
	requeueInterval: NodeJS.Timeout
	dodgeInterval: NodeJS.Timeout
	emergencyTimeout: NodeJS.Timeout
	nextGameDuel: boolean
	noDodgePlayers: string[]
	gameInfo: {
		started: boolean
		ended: boolean
		currentPlayers: number
		maxPlayers: number
		timeLeft: number
		successfullyCheckedPlayers: number
		dodged: boolean
		dodgeReason: string
		fakePlayers: string[]
		obfuscatedPlayers: string[]
		nickedPlayers: string[]
		dodgeResults: AutododgeResults[]
		skywarsCorruptionChance: number
		playerStats: Map<string, Player>
		detectedPurchases: Map<string, number | null>
		playerInitials: Map<string, string>
		friendNicknameUUIDs: Map<string, string>
		skinParts: number
		skinGlitchTimeout?: NodeJS.Timeout
		alreadyCheckedPlayers: string[]
		endState: 'win' | 'loss'
	}
	resetGameInfo: () => void

	clearDisplayNames: NodeJS.Timeout[]

	location: HypixelLocation | null
	lastGame: HypixelLocation

	lunarAuthSocket: ws.client
	lunarAssetsSocket: ws.client
	lunarAssetsConnection: ws.connection

	scoreboardLocationPromise: boolean

	disconnectFromLunar: () => void | undefined

	appearingOffline: boolean
	hypixelData: Player
	tabStatsIntervals: any[]
	ranksHandler: any
	shouldReplaceAllRanks: boolean

	giftingRewardsClaimed: number
	rank: string

	tags: Record<string, { value: string; extra?: string }>

	tagID: string
	apiToken: string
	apiKey: {
		value: string
		valid: boolean
	}

	sessionStats: { [key in string]: { wins: number; losses: number } }
}
