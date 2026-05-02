import { Player } from '@lilithmod/unborn-hypixel'
import type { LilithClient } from '@/client'
import { fetchStats } from '@/stats/fetchStats'
import lilithWebsocket from '@/websocket/socket'

export default async function getUserGiftedRanks(client: LilithClient) {
	const rawPlayer = await fetchStats(client.uuid, 'getUserGiftedRanks', client, 'player') // there's no way the uuid would be null, meaning the only way this could be null is that the fetch is not succesfull aka hypixel api error: faulty key or idk, so i can just forget about it and just stop fetching and assume the gifted ranks are 1

	lilithWebsocket.send<'hypixelApiRequestReport'>('hypixelApiRequestReport', {
		endpoint: `https://api.hypixel.net/player?uuid=${client.uuid}`,
	})

	if (rawPlayer == null) {
		client.giftingRewardsClaimed = 0
		client.rank = 'unknown'
	} else {
		const player = new Player(rawPlayer)
		client.giftingRewardsClaimed = player.rawData?.giftingMeta?.rankgiftingmilestones?.length ?? 0
		client.rank = player.rank
	}
}
