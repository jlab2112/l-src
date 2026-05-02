import EventEmitter from 'node:events'
import { API_URL } from '@/constants'
import type { Update } from '@/types/updatePath.js'
import { fetchJson, fetchLilithJson } from '@/utils/fetchJson.js'
import mergeObjects, { applyUpdates } from '@/utils/merge.js'
import lilithWebsocket from '@/websocket/socket.js'

export let ranks: LilithRanksDefinition = {}
export let usernameToRank: UsernameToRank = {}

export const discordInfo: { [id: string]: string } = {}

export interface LilithRanksDefinition {
	[id: string]: {
		prefix: string
		color: string
		uuid: string
		username: string
		toggled: boolean
		permission: boolean
	}
}

export interface LilithRank {
	discord: string
	prefix: string
	color: string
	uuid: string
	username: string
	toggled: boolean
	permission: boolean
}

export interface UsernameToRank {
	[username: string]: LilithRank
}

type DiscordLookupResponse = {
	id: string
	created_at: string
	tag: string
	badges: string[]
	avatar: {
		id: string
		link: string
		is_animated: boolean
	}
	banner: {
		id: string
		link: string
		is_animated: boolean
		color: string
	}
}

async function compileDiscordData() {
	const ids = Object.keys(ranks)
	for (const id of ids) {
		if (discordInfo[id] == null) {
			try {
				const data = await fetchJson<DiscordLookupResponse>(`${API_URL}/discordtag/${id}`)
				discordInfo[id] = data.tag
			} catch (err) {
				Lilith.log.error(err)
				Lilith.error(`REPORT IN #support: failed to fetch discord data for ${id}`)
			}
		}
	}
}

function compileUsernameToRank() {
	usernameToRank = {}
	for (const rank of Object.keys(ranks)) {
		Lilith.log.debug(ranks[rank])
		usernameToRank[ranks[rank].username.toLowerCase()] = {
			discord: rank,
			...ranks[rank],
		}
	}
}

export async function initializeRanks() {
	try {
		ranks = await fetchLilithJson<LilithRanksDefinition>('/ranks')
		delete ranks._id
		compileUsernameToRank()
		compileDiscordData().then(() => {})
	} catch (e) {
		console.error('Failed to fetch rank data', e)
	}
}

export const ranksListener = new EventEmitter()

function applyRankUpdates(updates: Update<LilithRanksDefinition>) {
	if (Object.keys(updates).some((key) => key.includes('.'))) {
		applyUpdates(ranks, updates)
	} else {
		ranks = mergeObjects(ranks, updates)
	}
	compileUsernameToRank()
	compileDiscordData().then(() => {})
	for (const rankId of Object.keys(ranks)) {
		const rank = ranks[rankId]
		// if (!rank.toggled || !rank.permission) return
		if (rank.permission && rank.toggled) ranksListener.emit('update', rank.username, rank)
	}
}

lilithWebsocket.on<'rankUpdate'>('rankUpdate', (updates) => {
	Lilith.log.trace(updates)
	applyRankUpdates(updates)
	Lilith.log.trace(ranks)
})
