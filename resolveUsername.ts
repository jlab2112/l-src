import type { LilithClient } from '@/client'
import { MOJANG_ENDPOINT } from '@/constants'
import { chat } from '@/utils/chat'

const mojang_url = MOJANG_ENDPOINT

export default async function (
	client: LilithClient | null,
	playerName: string,
	errorMessage = true,
	bypassCache = false,
): Promise<{ id: string; name: string } | null> {
	if (!bypassCache && client.usernameCache.has(playerName)) return { id: client.usernameCache.get(playerName), name: playerName }
	const mojangEndpoint = `${mojang_url}/${playerName}`

	Lilith.log.info(`Fetching Mojang UUID using ${mojangEndpoint}`)

	const mojangReq = await fetch(mojangEndpoint)

	if (!mojangReq.ok) {
		if (errorMessage && !bypassCache) chat(client, `&cLilith &8> &7Error while fetching UUID for &4${playerName}&7!`)
		return null
	}

	const mojangReqData = await mojangReq.json()

	const { id, name } = mojangReqData

	if (!bypassCache) client.usernameCache.set(name, id ?? null)
	return { id, name }
}
