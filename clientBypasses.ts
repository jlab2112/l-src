import config from '@/config.js'
import { addListener } from '@/events.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import { permission } from '@/utils/permissions.js'

addListener<PacketEvent<Play.toClient.CustomPayloadPacket>>(
	Ids.Play.toClient.custom_payload,
	'toClient',
	'Clientbound Custom Payload Modifiers',
	0,
	true,
	async ({ packet, setCancelled }) => {
		if (packet.data.channel === 'badlion:mods' && config().general.bypass.badlion && permission('lilith.bypass.badlion'))
			return setCancelled(true)
		if ((packet.data.channel === 'FML|HS' || packet.data.channel === 'FML') && config().general.bypass.forge && permission('lilith.bypass.forge'))
			return setCancelled(true)
		if (packet.data.channel === 'REGISTER' && config().general.bypass.lunar.disabled && permission('lilith.bypass.lunar'))
			return setCancelled(true)
		if (!config().general.bypass.lunar.disabled || !permission('lilith.bypass.lunar')) return
		if (packet.data.channel === 'MC|Brand') {
			packet.data.data = Buffer.from('<XeBungee (git:XeBungee-Bootstrap:1.16-R0.5-SNAPSHOT:a2e1df4)')
		} else if (packet.data.channel === 'lunarclient:pm' && config().general.bypass.lunar.disabled && permission('lilith.bypass.lunar')) {
			const packetId = packet.data.data.readInt8(0)
			if (packetId === 10) setCancelled(true)
		}
	},
)

addListener<PacketEvent<Play.toServer.CustomPayloadPacket>>(
	Ids.Play.toServer.custom_payload,
	'toServer',
	'Serverbound Custom Payload Modifiers',
	0,
	true,
	async ({ packet }) => {
		if (packet.data.channel === 'MC|Brand') packet.data.data = Buffer.from('\x07vanilla')
	},
)
