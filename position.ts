import { addAsyncListener } from '@/events'
import type { PacketEvent } from '@/types/events'
import { Ids } from '@/types/packets/minecraft/ids'
import type { Play } from '@/types/packets/minecraft/packets'

addAsyncListener<PacketEvent<Play.toClient.PositionPacket>>(
	Ids.Play.toClient.position,
	'toClient',
	'Clientbound Position Listener',
	1,
	async ({ packet, client }) => {
		client.position = {
			x: packet.data.x,
			y: packet.data.y,
			z: packet.data.z,
			yaw: packet.data.yaw,
			pitch: packet.data.pitch,
		}
	},
)

addAsyncListener<PacketEvent<Play.toServer.PositionPacket>>(
	Ids.Play.toServer.position,
	'toServer',
	'Serverbound Position Listener',
	1,
	async ({ packet, client }) => {
		client.position = {
			x: packet.data.x,
			y: packet.data.y,
			z: packet.data.z,
		}
	},
)

addAsyncListener<PacketEvent<Play.toServer.PositionLookPacket>>(
	Ids.Play.toServer.position,
	'toServer',
	'Serverbound Position/Look Listener',
	1,
	async ({ packet, client }) => {
		client.position = {
			x: packet.data.x,
			y: packet.data.y,
			z: packet.data.z,
			yaw: packet.data.yaw,
			pitch: packet.data.pitch,
		}
	},
)
