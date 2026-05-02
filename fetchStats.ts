import type { LilithClient } from '@/client'
import config from '@/config'
import { API_URL } from '@/constants'
import { chat, chatJson } from '@/utils/chat'
import { permission } from '@/utils/permissions'
import resolveUsername from '@/utils/resolveUsername'

export async function fetchStats(
	player: string,
	context: string,
	client: LilithClient,
	type: 'status' | 'player',
	showErrorFetchMessage = false,
): Promise<Record<string, any> | null | undefined> {
	if (player.match(/^[a-zA-Z0-9_]{2,16}$/)) {
		const mojangReq = await resolveUsername(client, player, showErrorFetchMessage)
		if (mojangReq === null) return null
		player = mojangReq.id
	}

	if (
		!client.apiKey.valid &&
		permission('lilith.apiKeyLess') &&
		config().general.useApiKeyLess &&
		client.apiToken !== ''
	) {
		Lilith.log.info(`Fetching Hypixel stats for ${player}, using API.`)

		const res = await fetch(`${API_URL}/hypixel/stats/${player}?type=${type}`, { headers: { token: client.apiToken } })
		const data = await res.json()
		if (!res.ok) {
			chat(client, `&cLilith &4(REMOTE) &8> &7${data.error}.`)
			Lilith.log.info(`API Key-less fetch failed with cause: ${data.error}`)
			return undefined
		}
		if (data.data.success) {
			if (type === 'status') {
				return data.data
			}
			return data.data.player
		}
		return undefined
	}
	Lilith.log.info(`Fetching Hypixel ${type} for ${player}, using user's API key, from ${context}.`)
	const statsReq = await fetch(`https://api.hypixel.net/${type}?uuid=${player}`, {
		headers: { 'API-Key': config().general.apiKey },
	})

	if (!statsReq.ok) {
		client.apiKey.valid = false
		chatJson(client, [
			'',
			{ text: 'Lilith ', color: 'red' },
			{ text: '> ', color: 'dark_gray' },
			{ text: 'Your API Key is invalid! Refer to the ', color: 'gray' },
			{
				text: 'Lilith documentation',
				color: 'red',
				underlined: true,
				clickEvent: {
					action: 'open_url',
					value: 'https://docs.lilith.rip/lilith/config/getting-an-api-key',
				},
			},
			{ text: ' for instructions.', color: 'gray' },
		])
		Lilith.log.info(`Invalid API Key! Fetch requested by: ${context} for: ${player}`)
		return null
	}

	const statsReqData = await statsReq.json()
	if (type === 'status') return statsReqData
	return statsReqData.player
}
