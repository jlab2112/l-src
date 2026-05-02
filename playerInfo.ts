import { readClientboundPacket } from '@lilithmod/hypixel-mod-api'
import type { ClientboundPlayerInfoPacketV1 } from '@lilithmod/hypixel-mod-api/dist/packets/clientbound/v1/player_info'
import { addListener } from '@/events'
import type { PacketEvent } from '@/types/events'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'

addListener<PacketEvent<Play.toClient.CustomPayloadPacket>>(
	Ids.Play.toClient.custom_payload,
	'toClient',
	'Player info packet listener',
	0,
	true,
	async ({ packet }) => {
		if (packet.data.channel !== 'hypixel:player_info') return

		const clientBoundPlayerInfoPacketResponse = readClientboundPacket('player_info', packet.data.data)

		if ('error' in clientBoundPlayerInfoPacketResponse) {
			Lilith.log.error(
				`Invalid player info packet sent. Received this error from server: ${clientBoundPlayerInfoPacketResponse.error}`,
			)
			return
		}
		const partyInfoData = clientBoundPlayerInfoPacketResponse as ClientboundPlayerInfoPacketV1
	},
)
