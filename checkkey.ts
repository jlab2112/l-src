import config from '@/config.js'
import { addAsyncListener } from '@/events.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { checkKey } from '@/utils/checkkey.js'

addAsyncListener<PacketEvent<Play.toClient.LoginPacket>>(Ids.Play.toClient.login, 'toClient', 'API Key Checker', 0, async ({ client }) => {
	checkKey(client, config().general.apiKey, config().general.useApiKeyLess)
})
