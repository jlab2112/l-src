import type { LilithClient } from '@/client'
import { addListener } from '@/events'
import { partyEmitter } from '@/listeners/emitters/locrawEmitter'
import type { PacketEvent } from '@/types/events'
import { Ids } from '@/types/packets/minecraft/ids'
import { type Play, writePacket } from '@/types/packets/minecraft/packets'
import { readClientboundPacket, writeServerboundPacket } from '@lilithmod/hypixel-mod-api'
import type { ClientboundPartyInfoPacketV1 } from '@lilithmod/hypixel-mod-api/dist/packets/clientbound/v1/party_info'

addListener<PacketEvent<Play.toClient.CustomPayloadPacket>>(
	Ids.Play.toClient.custom_payload,
	'toClient',
	'Location packet listener',
	0,
	true,
	async ({ client, packet }) => {
		if (packet.data.channel !== 'hypixel:party_info') return

		const clientBoundPartyInfoPacketResponse = readClientboundPacket('party_info', packet.data.data)

		if ('error' in clientBoundPartyInfoPacketResponse) {
			Lilith.log.error(`Invalid party info packet sent. Received this error from server: ${clientBoundPartyInfoPacketResponse.error}`)
			return
		}
		const partyInfoData = clientBoundPartyInfoPacketResponse as ClientboundPartyInfoPacketV1
		if (!partyInfoData.inParty) {
			client.partyMembers = []
			client.partyLeader = ''
			return
		}
		client.partyLeader = partyInfoData.leader
		client.partyMembers = partyInfoData.members
		partyEmitter.emit('party', partyInfoData)
	},
)

export function requestPartyInfo(client: LilithClient) {
	const request: Buffer = writeServerboundPacket('register', { version: 1 })

	writePacket<Play.toServer.CustomPayloadPacket>(client, 'toServer', {
		metadata: {
			id: Ids.Play.toServer.custom_payload,
			state: 'play',
			name: 'custom_payload',
		},
		data: {
			channel: 'hypixel:party_info',
			data: request,
		},
	})
}
