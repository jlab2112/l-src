import * as timers from 'node:timers/promises'
import { readClientboundPacket } from '@lilithmod/hypixel-mod-api'
import type { ClientboundLocationPacketV1 } from '@lilithmod/hypixel-mod-api/dist/packets/clientbound/v1/location'
import { compileNoDodgeList } from '@/commands/implementations/dodge/nododge.js'
import { addAsyncListener, addListener } from '@/events.js'
import { requestPartyInfo } from '@/listeners/partyInfo'
import { isLobby } from '@/queuestats/queuestats.js'
import type { PacketEvent } from '@/types/events.js'
import type { HypixelLocation } from '@/types/HypixelLocation.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import lilithWebsocket from '@/websocket/socket.js'
import gameEmitter from './emitters/gameEmitter.js'
import { locationEmitter, movedEmitter } from './emitters/locrawEmitter.js'

const shouldSaveLastGame = (location: HypixelLocation) =>
	location?.serverName != null &&
	location.serverName !== 'limbo' &&
	!location.serverName.includes('lobby') &&
	location.lobbyName == null

addListener<PacketEvent<Play.toClient.CustomPayloadPacket>>(
	Ids.Play.toClient.custom_payload,
	'toClient',
	'Location packet listener',
	0,
	true,
	async ({ client, packet }) => {
		if (packet.data.channel === 'hyevent:location') {
			const clientboundLocationPacketResponse = readClientboundPacket('location', packet.data.data)
			if ('error' in clientboundLocationPacketResponse) {
				Lilith.log.error(
					`Invalid location packet sent. Received this error from server: ${clientboundLocationPacketResponse.error}`,
				)
				return
			}
			const locationData = clientboundLocationPacketResponse as ClientboundLocationPacketV1
			if (locationData.serverName === 'limbo') Lilith.log.trace(JSON.stringify(locationData))

			delete locationData.version
			client.isLobby = isLobby(locationData)
			client.location = locationData
			locationEmitter.emit('location', locationData, client)
			lilithWebsocket.send<'location'>('location', {
				location: locationData,
				requeue: shouldSaveLastGame(locationData),
			})
			/* Always calling nextPlayer on location change since player_info packet for the current player (on obfuscated gamemodes) is only sent
  		    a the start of the game and sent at the end of the game. It's way easier to just call nextPLayer on every location change and let queueStats'
      		fetchStats function to check if the player is in a game and then send the stats message if needed... */
			setTimeout(() => client.nextPlayer(client.username), 1000)
		}
	},
)

addAsyncListener<PacketEvent<Play.toClient.LoginPacket>>(
	Ids.Play.toClient.login,
	'toClient',
	'Locraw Resetter',
	10,
	async ({ client }) => {
		movedEmitter.emit('moved', client)
		clearTimeout(client.emergencyTimeout)
		if (shouldSaveLastGame(client.location)) client.lastGame = client.location
		compileNoDodgeList(client)
		client.scoreboardTeams.clear()

		setTimeout(() => {
			requestPartyInfo(client)
  		}, 200)
    client.location = null;
		await timers.setTimeout(750)
		gameEmitter.removeAllListeners('woah')
	},
)
