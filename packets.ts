// noinspection JSDeprecatedSymbols

import type { Position, ServerConnection } from '@lilithmod/unborn-mcproto'
import type { NBT } from 'prismarine-nbt'
import type { LilithClient } from '@/client.js'
import { serialize } from '@/packets/deserialize.js'
import type { EntityMetadata, f32, f64, i8, i16, i32, i64, Slot, UUID, u8, u16, varint } from '../shared.js'
import type { Ids } from './ids.js'

export namespace Play {
	export namespace toClient {
		export type KeepAlivePacket = {
			metadata: {
				knownName?: 'keep_alive'
				name: 'keep_alive'
				state: 'play'
				id: Ids.Play.toClient.keep_alive
			}
			data: {
				keepAliveId: varint
			}
		}
		export type LoginPacket = {
			metadata: {
				name: 'login'
				state: 'play'
				id: Ids.Play.toClient.login
			}
			data: {
				entityId: i32
				gameMode: u8
				dimension: i8
				difficulty: u8
				maxPlayers: u8
				levelType: string
				reducedDebugInfo: boolean
			}
		}
		export type ChatPacket = {
			metadata: {
				name: 'chat'
				state: 'play'
				id: Ids.Play.toClient.chat
			}
			data: {
				message: string
				position: i8
			}
		}
		export type UpdateTimePacket = {
			metadata: {
				name: 'update_time'
				state: 'play'
				id: Ids.Play.toClient.update_time
			}
			data: {
				age: i64
				time: i64
			}
		}
		export type EntityEquipmentPacket = {
			metadata: {
				name: 'entity_equipment'
				state: 'play'
				id: Ids.Play.toClient.entity_equipment
			}
			data: {
				entityId: varint
				slot: i16
				item: Slot
			}
		}
		export type SpawnPositionPacket = {
			metadata: {
				name: 'spawn_position'
				state: 'play'
				id: Ids.Play.toClient.spawn_position
			}
			data: {
				location: Position
			}
		}
		export type UpdateHealthPacket = {
			metadata: {
				name: 'update_health'
				state: 'play'
				id: Ids.Play.toClient.update_health
			}
			data: {
				health: f32
				food: varint
				foodSaturation: f32
			}
		}
		export type RespawnPacket = {
			metadata: {
				name: 'respawn'
				state: 'play'
				id: Ids.Play.toClient.respawn
			}
			data: {
				dimension: i32
				difficulty: u8
				gamemode: u8
				levelType: string
			}
		}
		export type PositionPacket = {
			metadata: {
				name: 'position'
				state: 'play'
				id: Ids.Play.toClient.position
			}
			data: {
				x: f64
				y: f64
				z: f64
				yaw: f32
				pitch: f32
				flags: i8
			}
		}
		export type HeldItemSlotPacket = {
			metadata: {
				name: 'held_item_slot'
				state: 'play'
				id: Ids.Play.toClient.held_item_slot
			}
			data: {
				slot: i8
			}
		}
		export type BedPacket = {
			metadata: {
				name: 'bed'
				state: 'play'
				id: Ids.Play.toClient.bed
			}
			data: {
				entityId: varint
				location: Position
			}
		}
		export type AnimationPacket = {
			metadata: {
				name: 'animation'
				state: 'play'
				id: Ids.Play.toClient.animation
			}
			data: {
				entityId: varint
				animation: u8
			}
		}
		export type NamedEntitySpawnPacket = {
			metadata: {
				name: 'named_entity_spawn'
				state: 'play'
				id: Ids.Play.toClient.named_entity_spawn
			}
			data: {
				entityId: varint
				playerUUID: UUID
				x: i32
				y: i32
				z: i32
				yaw: i8
				pitch: i8
				currentItem: i16
				metadata: EntityMetadata
			}
		}
		export type CollectPacket = {
			metadata: {
				name: 'collect'
				state: 'play'
				id: Ids.Play.toClient.collect
			}
			data: {
				collectedEntityId: varint
				collectorEntityId: varint
			}
		}
		export type SpawnEntityPacket = {
			metadata: {
				name: 'spawn_entity'
				state: 'play'
				id: Ids.Play.toClient.spawn_entity
			}
			data: {
				entityId: varint
				x: i8
				y: i32
				z: i32
				yaw: i8
				pitch: i8
				objectData: {
					intField: i32
					velocityX?: i16
					velocityY?: i16
					velocityZ?: i16
				}
			}
		}
		export type SpawnEntityLivingPacket = {
			metadata: {
				name: 'spawn_entity_living'
				state: 'play'
				id: Ids.Play.toClient.spawn_entity_living
			}
			data: {
				entityId: varint
				type: u8
				x: i32
				y: i32
				z: i32
				yaw: i8
				pitch: i8
				headPitch: i8
				velocityX: i16
				velocityY: i16
				velocityZ: i16
				metadata: EntityMetadata
			}
		}
		export type SpawnEntityPaintingPacket = {
			metadata: {
				name: 'spawn_entity_painting'
				state: 'play'
				id: Ids.Play.toClient.spawn_entity_painting
			}
			data: {
				entityId: varint
				title: string
				location: Position
				direction: u8
			}
		}
		export type SpawnEntityExperienceOrbPacket = {
			metadata: {
				name: 'spawn_entity_experience_orb'
				state: 'play'
				id: Ids.Play.toClient.spawn_entity_experience_orb
			}
			data: {
				entityId: varint
				x: i32
				y: i32
				z: i32
				count: i16
			}
		}
		export type EntityVelocityPacket = {
			metadata: {
				name: 'entity_velocity'
				state: 'play'
				id: Ids.Play.toClient.entity_velocity
			}
			data: {
				entityId: varint
				velocityX: i16
				velocityY: i16
				velocityZ: i16
			}
		}
		export type EntityDestroyPacket = {
			metadata: {
				name: 'entity_destroy'
				state: 'play'
				id: Ids.Play.toClient.entity_destroy
			}
			data: {
				entityIds: Array<varint>
			}
		}
		export type EntityPacket = {
			metadata: {
				name: 'entity'
				state: 'play'
				id: Ids.Play.toClient.entity
			}
			data: {
				entityId: varint
			}
		}
		export type RelEntityMovePacket = {
			metadata: {
				name: 'rel_entity_move'
				state: 'play'
				id: Ids.Play.toClient.rel_entity_move
			}
			data: {
				entityId: varint
				dX: i8
				dY: i8
				dZ: i8
				onGround: boolean
			}
		}
		export type EntityLookPacket = {
			metadata: {
				name: 'entity_look'
				state: 'play'
				id: Ids.Play.toClient.entity_look
			}
			data: {
				entityId: varint
				yaw: i8
				pitch: i8
				onGround: boolean
			}
		}
		export type EntityMoveLookPacket = {
			metadata: {
				name: 'entity_move_look'
				state: 'play'
				id: Ids.Play.toClient.entity_move_look
			}
			data: {
				entityId: varint
				dX: i8
				dY: i8
				dZ: i8
				yaw: i8
				pitch: i8
				onGround: boolean
			}
		}
		export type EntityTeleportPacket = {
			metadata: {
				name: 'entity_teleport'
				state: 'play'
				id: Ids.Play.toClient.entity_teleport
			}
			data: {
				entityId: varint
				x: i32
				y: i32
				z: i32
				yaw: i8
				pitch: i8
				onGround: boolean
			}
		}
		export type EntityHeadRotationPacket = {
			metadata: {
				name: 'entity_head_rotation'
				state: 'play'
				id: Ids.Play.toClient.entity_head_rotation
			}
			data: {
				entityId: varint
				headYaw: i8
			}
		}
		export type EntityStatusPacket = {
			metadata: {
				name: 'entity_status'
				state: 'play'
				id: Ids.Play.toClient.entity_status
			}
			data: {
				entityId: i32
				entityStatus: i8
			}
		}
		export type AttachEntityPacket = {
			metadata: {
				name: 'attach_entity'
				state: 'play'
				id: Ids.Play.toClient.attach_entity
			}
			data: {
				entityId: i32
				vehicleId: i32
				leash: boolean
			}
		}
		export type EntityMetadataPacket = {
			metadata: {
				name: 'entity_metadata'
				state: 'play'
				id: Ids.Play.toClient.entity_metadata
			}
			data: {
				entityId: varint
				metadata: EntityMetadata
			}
		}
		export type EntityEffectPacket = {
			metadata: {
				name: 'entity_effect'
				state: 'play'
				id: Ids.Play.toClient.entity_effect
			}
			data: {
				entityId: varint
				effectId: i8
				amplifier: i8
				duration: varint
				hideParticles: boolean
			}
		}
		export type RemoveEntityEffectPacket = {
			metadata: {
				name: 'remove_entity_effect'
				state: 'play'
				id: Ids.Play.toClient.remove_entity_effect
			}
			data: {
				entityId: varint
				effectId: i8
			}
		}
		export type ExperiencePacket = {
			metadata: {
				name: 'experience'
				state: 'play'
				id: Ids.Play.toClient.experience
			}
			data: {
				experienceBar: f32
				level: varint
				totalExperience: varint
			}
		}
		export type UpdateAttributesPacket = {
			metadata: {
				name: 'update_attributes'
				state: 'play'
				id: Ids.Play.toClient.update_attributes
			}
			data: {
				entityId: varint
				properties: Array<{
					// i32
					key: string
					value: f64
					modifiers: Array<{
						UUID: string
						amount: f64
						operation: i8
					}>
				}>
			}
		}
		export type MapChunkPacket = {
			metadata: {
				name: 'map_chunk'
				state: 'play'
				id: Ids.Play.toClient.map_chunk
			}
			data: {
				x: i32
				z: i32
				groundUp: boolean
				bitMap: u16
				chunkData: Buffer
			}
		}
		export type MultiBlockChangePacket = {
			metadata: {
				name: 'multi_block_change'
				state: 'play'
				id: Ids.Play.toClient.multi_block_change
			}
			data: {
				chunkX: i32
				chunkZ: i32
				records: Array<{
					horizontalPos: u8
					y: u8
					blockId: varint
				}>
			}
		}
		export type BlockChangePacket = {
			metadata: {
				name: 'block_change'
				state: 'play'
				id: Ids.Play.toClient.block_change
			}
			data: {
				location: Position
				type: varint
			}
		}
		export type BlockActionPacket = {
			metadata: {
				name: 'block_action'
				state: 'play'
				id: Ids.Play.toClient.block_action
			}
			data: {
				location: Position
				byte1: u8
				byte2: u8
				blockId: varint
			}
		}
		export type BlockBreakAnimationPacket = {
			metadata: {
				name: 'block_break_animation'
				state: 'play'
				id: Ids.Play.toClient.block_break_animation
			}
			data: {
				entityId: varint
				location: Position
				destroyStage: i8
			}
		}
		export type MapChunkBulkPacket = {
			metadata: {
				name: 'map_chunk_bulk'
				state: 'play'
				id: Ids.Play.toClient.map_chunk_bulk
			}
			data: {
				skyLightSend: boolean
				meta: Array<{
					x: i32
					z: i32
					bitMap: u16
				}>
				data: Buffer
			}
		}
		export type ExplosionPacket = {
			metadata: {
				name: 'explosion'
				state: 'play'
				id: Ids.Play.toClient.explosion
			}
			data: {
				x: f32
				y: f32
				z: f32
				radius: f32
				affectedBlockOffsets: Array<Position>
				playerMotionX: f32
				playerMotionY: f32
				playerMotionZ: f32
			}
		}
		export type WorldEventPacket = {
			metadata: {
				name: 'world_event'
				state: 'play'
				id: Ids.Play.toClient.world_event
			}
			data: {
				effectId: i32
				location: Position
				data: i32
				global: boolean
			}
		}
		export type NamedSoundEffectPacket = {
			metadata: {
				name: 'named_sound_effect'
				state: 'play'
				id: Ids.Play.toClient.named_sound_effect
			}
			data: {
				soundName: string
				x: i32
				y: i32
				z: i32
				volume: f32
				pitch: u8
			}
		}
		export type WorldParticlesPacket = {
			metadata: {
				name: 'world_particles'
				state: 'play'
				id: Ids.Play.toClient.world_particles
			}
			data: {
				particleId: i32
				longDistance: boolean
				x: f32
				y: f32
				z: f32
				offsetX: f32
				offsetY: f32
				offsetZ: f32
				particleData: f32
				particles: i32
				data: Array<varint>
			}
		}
		export type GameStateChangePacket = {
			metadata: {
				name: 'game_state_change'
				state: 'play'
				id: Ids.Play.toClient.game_state_change
			}
			data: {
				reason: u8
				gameMode: f32
			}
		}
		export type SpawnEntityWeatherPacket = {
			metadata: {
				name: 'spawn_entity_weather'
				state: 'play'
				id: Ids.Play.toClient.spawn_entity_weather
			}
			data: {
				entityId: varint
				type: i8
				x: i32
				y: i32
				z: i32
			}
		}
		export type OpenWindowPacket = {
			metadata: {
				name: 'open_window'
				state: 'play'
				id: Ids.Play.toClient.open_window
			}
			data: {
				windowId: u8
				inventoryType: string
				windowTitle: string
				slotCount: u8
				entityId?: i32
			}
		}
		export type CloseWindowPacket = {
			metadata: {
				name: 'close_window'
				state: 'play'
				id: Ids.Play.toClient.close_window
			}
			data: {
				windowId: u8
			}
		}
		export type SetSlotPacket = {
			metadata: {
				name: 'set_slot'
				state: 'play'
				id: Ids.Play.toClient.set_slot
			}
			data: {
				windowId: i8
				slot: i16
				item: Slot
			}
		}
		export type WindowItemsPacket = {
			metadata: {
				name: 'window_items'
				state: 'play'
				id: Ids.Play.toClient.window_items
			}
			data: {
				windowId: u8
				items: Array<Slot>
			}
		}
		export type CraftProgressBarPacket = {
			metadata: {
				name: 'craft_progress_bar'
				state: 'play'
				id: Ids.Play.toClient.craft_progress_bar
			}
			data: {
				windowId: u8
				property: i16
				value: i16
			}
		}
		export type TransactionPacket = {
			metadata: {
				name: 'transaction'
				state: 'play'
				id: Ids.Play.toClient.transaction
			}
			data: {
				windowId: i8
				action: i16
				accepted: boolean
			}
		}
		export type UpdateSignPacket = {
			metadata: {
				name: 'update_sign'
				state: 'play'
				id: Ids.Play.toClient.update_sign
			}
			data: {
				location: Position
				text1: string
				text2: string
				text3: string
				text4: string
			}
		}
		export type MapPacket = {
			metadata: {
				name: 'map'
				state: 'play'
				id: Ids.Play.toClient.map
			}
			data:
				| {
						itemDamage: varint
						scale: i8
						icons: Array<{
							directionAndType: i8
							x: i8
							y: i8
						}>
						columns: i8
						rows: i8
						x: i8
						y: i8
						data: Buffer
				  }
				| {
						itemDamage: varint
						scale: i8
						icons: Array<{
							directionAndType: i8
							x: i8
							z: i8
						}>
						columns: 0
				  }
		}
		export type TileEntityDataPacket = {
			metadata: {
				name: 'tile_entity_data'
				state: 'play'
				id: Ids.Play.toClient.tile_entity_data
			}
			data: {
				location: Position
				action: u8
				nbtData?: NBT
			}
		}
		export type OpenSignEntityPacket = {
			metadata: {
				name: 'open_sign_entity'
				state: 'play'
				id: Ids.Play.toClient.open_sign_entity
			}
			data: {
				location: Position
			}
		}
		export type StatisticsPacket = {
			metadata: {
				name: 'statistics'
				state: 'play'
				id: Ids.Play.toClient.statistics
			}
			data: {
				entries: Array<{
					name: string
					value: varint
				}>
			}
		}
		export type PlayerInfoPacket = {
			metadata: {
				name: 'player_info'
				state: 'play'
				id: Ids.Play.toClient.player_info

				// TODO: continue cleaning up types
			}
			data:
				| {
						action: PlayerInfoAction.AddPlayer
						data: Array<{
							UUID: UUID
							name: string
							properties: Array<{
								name: string
								value: string
								signature?: string
							}>
							gamemode: varint
							ping: varint
							displayName?: string
						}>
				  }
				| {
						action: PlayerInfoAction.UpdateGamemode
						data: Array<{
							UUID: UUID
							gamemode: varint
						}>
				  }
				| {
						action: PlayerInfoAction.UpdatePing
						data: Array<{
							UUID: UUID
							ping: varint
						}>
				  }
				| {
						action: PlayerInfoAction.UpdateDisplayName
						data: Array<{
							UUID: UUID
							displayName?: string
						}>
				  }
				| {
						action: PlayerInfoAction.RemovePlayer
						data: Array<{
							UUID: UUID
						}>
				  }
		}
		export type AbilitiesPacket = {
			metadata: {
				name: 'abilities'
				state: 'play'
				id: Ids.Play.toClient.abilities
			}
			data: {
				flags: i8
				flyingSpeed: f32
				walkingSpeed: f32
			}
		}
		export type TabCompletePacket = {
			metadata: {
				name: 'tab_complete'
				state: 'play'
				id: Ids.Play.toClient.tab_complete
			}
			data: {
				matches: Array<string>
			}
		}

		export type ScoreboardObjectivePacket = {
			metadata: {
				name: 'scoreboard_objective'
				state: 'play'
				id: Ids.Play.toClient.scoreboard_objective
			}
			data:
				| {
						name: string
						action: ScoreboardObjectiveAction.Create | ScoreboardObjectiveAction.Update
						displayText: string
						type: string
				  }
				| {
						name: string
						action: ScoreboardObjectiveAction.Remove
				  }
		}
		export type ScoreboardScorePacket = {
			metadata: {
				name: 'scoreboard_score'
				state: 'play'
				id: Ids.Play.toClient.scoreboard_score
			}
			data: {
				itemName: string
				action: varint
				scoreName: string
				value?: varint
			}
		}
		export type ScoreboardDisplayObjectivePacket = {
			metadata: {
				name: 'scoreboard_display_objective'
				state: 'play'
				id: Ids.Play.toClient.scoreboard_display_objective
			}
			data: {
				position: i8
				name: string
			}
		}
		export type ScoreboardTeamPacket = {
			metadata: {
				name: 'scoreboard_team'
				state: 'play'
				id: Ids.Play.toClient.scoreboard_team
			}
			data:
				| {
						team: string
						mode: ScoreboardTeamMode.Create
						name: string
						prefix: string
						suffix: string
						friendlyFire: i8
						nameTagVisibility: 'always' | 'hideForOtherTeams' | 'hideForOwnTeam' | 'never'
						color: i8
						players: Array<string>
				  }
				| {
						team: string
						mode: ScoreboardTeamMode.Remove
				  }
				| {
						team: string
						mode: ScoreboardTeamMode.UpdateInformation
						name: string
						prefix: string
						suffix: string
						friendlyFire: i8
						nameTagVisibility: 'always' | 'hideForOtherTeams' | 'hideForOwnTeam' | 'never'
						color: i8
				  }
				| {
						team: string
						mode: ScoreboardTeamMode.AddPlayers | ScoreboardTeamMode.RemovePlayers
						players: Array<string>
				  }
		}
		export type CustomPayloadPacket = {
			metadata: {
				name: 'custom_payload'
				state: 'play'
				id: Ids.Play.toClient.custom_payload
			}
			data: {
				channel: string
				data: Buffer
			}
		}
		export type KickDisconnectPacket = {
			metadata: {
				name: 'kick_disconnect'
				state: 'play'
				id: Ids.Play.toClient.kick_disconnect
			}
			data: {
				reason: string
			}
		}
		export type DifficultyPacket = {
			metadata: {
				name: 'difficulty'
				state: 'play'
				id: Ids.Play.toClient.difficulty
			}
			data: {
				difficulty: Difficulty // u8
			}
		}
		export type CombatEventPacket = {
			metadata: {
				name: 'combat_event'
				state: 'play'
				id: Ids.Play.toClient.combat_event
			}
			data:
				| {
						event: CombatEvent.Enter // varint
				  }
				| {
						event: CombatEvent.End
						duration: varint
						entityId: i32
				  }
				| {
						event: CombatEvent.Dead
						playerId: varint
						entityId: i32
						message: string
				  }
		}
		export type CameraPacket = {
			metadata: {
				name: 'camera'
				state: 'play'
				id: Ids.Play.toClient.camera
			}
			data: {
				cameraId: varint
			}
		}
		export type WorldBorderPacket = {
			metadata: {
				name: 'world_border'
				state: 'play'
				id: Ids.Play.toClient.world_border
			}
			data:
				| {
						action: WorldBorderAction.SetSize
						radius: f64
				  }
				| {
						action: WorldBorderAction.LerpSize
						old_radius: f64
						new_radius: f64
						speed: varint // varlong
				  }
				| {
						action: WorldBorderAction.SetCenter
						x: f64
						z: f64
				  }
				| {
						action: WorldBorderAction.Initialize
						x: f64
						z: f64
						old_radius: f64
						new_radius: f64
						speed: varint // varlong
						portalBoundary: varint
						warning_time: varint
						warning_blocks: varint
				  }
				| {
						action: WorldBorderAction.SetWarningTime
						warning_time: varint
				  }
				| {
						action: WorldBorderAction.SetWarningBlocks
						warning_blocks: varint
				  }
		}
		export type TitlePacket = {
			metadata: {
				name: 'title'
				state: 'play'
				id: Ids.Play.toClient.title
			}
			data:
				| {
						action: TitleAction.SetTitle | TitleAction.SetSubtitle
						text: string
				  }
				| {
						action: TitleAction.SetTimesAndDisplay
						fadeIn: i32
						stay: i32
						fadeOut: i32
				  }
				| {
						action: TitleAction.Hide | TitleAction.Reset
				  }
		}
		/**
		 * @deprecated Use Login.toClient.CompressPacket instead
		 */
		export type SetCompressionPacket = {
			metadata: {
				name: 'set_compression'
				state: 'play'
				id: Ids.Play.toClient.set_compression
			}
			data: {
				time: varint
			}
		}
		export type PlayerlistHeaderPacket = {
			metadata: {
				name: 'playerlist_header'
				state: 'play'
				id: Ids.Play.toClient.playerlist_header
			}
			data: {
				header: string
				footer: string
			}
		}
		export type ResourcePackSendPacket = {
			metadata: {
				name: 'resource_pack_send'
				state: 'play'
				id: Ids.Play.toClient.resource_pack_send
			}
			data: {
				url: string
				hash: string
			}
		}
		export type UpdateEntityNBTPacket = {
			metadata: {
				name: 'update_entity_nbt'
				state: 'play'
				id: Ids.Play.toClient.update_entity_nbt
			}
			data: {
				entityId: varint
				tag: NBT
			}
		}
	}
	export namespace toServer {
		export type KeepAlivePacket = {
			metadata: {
				name: 'keep_alive'
				state: 'play'
				id: Ids.Play.toServer.keep_alive
			}
			data: {
				keepAliveId: varint
			}
		}
		export type ChatPacket = {
			metadata: {
				name: 'chat'
				state: 'play'
				id: Ids.Play.toServer.chat
			}
			data: {
				message: string
			}
		}
		export type UseEntityPacket = {
			metadata: {
				name: 'use_entity'
				state: 'play'
				id: Ids.Play.toServer.use_entity
			}
			data:
				| {
						target: varint
						mouse: varint
				  }
				| {
						target: varint
						mouse: 2
						x: f32
						y: f32
						z: f32
				  }
		}
		export type FlyingPacket = {
			metadata: {
				name: 'flying'
				state: 'play'
				id: Ids.Play.toServer.flying
			}
			data: {
				onGround: boolean
			}
		}
		export type PositionPacket = {
			metadata: {
				name: 'position'
				state: 'play'
				id: Ids.Play.toServer.position
			}
			data: {
				x: f64
				y: f64
				z: f64
				onGround: boolean
			}
		}
		export type LookPacket = {
			metadata: {
				name: 'look'
				state: 'play'
				id: Ids.Play.toServer.look
			}
			data: {
				yaw: f32
				pitch: f32
				onGround: boolean
			}
		}
		export type PositionLookPacket = {
			metadata: {
				name: 'position_look'
				state: 'play'
				id: Ids.Play.toServer.position_look
			}
			data: {
				x: f64
				y: f64
				z: f64
				yaw: f32
				pitch: f32
				onGround: boolean
			}
		}
		export type BlockDigPacket = {
			metadata: {
				name: 'block_dig'
				state: 'play'
				id: Ids.Play.toServer.block_dig
			}
			data: {
				status: varint
				location: Position
				face: i8
			}
		}
		export type BlockPlacePacket = {
			metadata: {
				name: 'block_place'
				state: 'play'
				id: Ids.Play.toServer.block_place
			}
			data: {
				location: Position
				direction: i8
				heldItem: Slot
				cursorX: i8
				cursorY: i8
				cursorZ: i8
			}
		}
		export type HeldItemSlotPacket = {
			metadata: {
				name: 'held_item_slot'
				state: 'play'
				id: Ids.Play.toServer.held_item_slot
			}
			data: {
				slotId: i16
			}
		}
		export type ArmAnimationPacket = {
			metadata: {
				name: 'arm_animation'
				state: 'play'
				id: Ids.Play.toServer.arm_animation
			}
			data: {}
		}
		export type EntityActionPacket = {
			metadata: {
				name: 'entity_action'
				state: 'play'
				id: Ids.Play.toServer.entity_action
			}
			data: {
				entityId: varint
				actionId: varint
				jumpBoost: varint
			}
		}
		export type SteerVehiclePacket = {
			metadata: {
				name: 'steer_vehicle'
				state: 'play'
				id: Ids.Play.toServer.steer_vehicle
			}
			data: {
				sideways: f32
				forward: f32
				jump: u8
			}
		}
		export type CloseWindowPacket = {
			metadata: {
				name: 'close_window'
				state: 'play'
				id: Ids.Play.toServer.close_window
			}
			data: {
				windowId: u8
			}
		}
		export type WindowClickPacket = {
			metadata: {
				name: 'window_click'
				state: 'play'
				id: Ids.Play.toServer.window_click
			}
			data: {
				windowId: u8
				slot: i16
				mouseButton: i8
				action: i16
				mode: i8
				item: Slot
			}
		}
		export type TransactionPacket = {
			metadata: {
				name: 'transaction'
				state: 'play'
				id: Ids.Play.toServer.transaction
			}
			data: {
				windowId: i8
				action: i16
				accepted: boolean
			}
		}
		export type SetCreativeSlotPacket = {
			metadata: {
				name: 'set_creative_slot'
				state: 'play'
				id: Ids.Play.toServer.set_creative_slot
			}
			data: {
				slot: i16
				item: Slot
			}
		}
		export type EnchantItemPacket = {
			metadata: {
				name: 'enchant_item'
				state: 'play'
				id: Ids.Play.toServer.enchant_item
			}
			data: {
				windowId: i8
				enchantment: i8
			}
		}
		export type UpdateSignPacket = {
			metadata: {
				name: 'update_sign'
				state: 'play'
				id: Ids.Play.toServer.update_sign
			}
			data: {
				location: Position
				text1: string
				text2: string
				text3: string
				text4: string
			}
		}
		export type AbilitiesPacket = {
			metadata: {
				name: 'abilities'
				state: 'play'
				id: Ids.Play.toServer.abilities
			}
			data: {
				flags: i8
				flyingSpeed: f32
				walkingSpeed: f32
			}
		}
		export type TabCompletePacket = {
			metadata: {
				name: 'tab_complete'
				state: 'play'
				id: Ids.Play.toServer.tab_complete
			}
			data: {
				text: string
				block?: Position
			}
		}
		export type SettingsPacket = {
			metadata: {
				name: 'settings'
				state: 'play'
				id: Ids.Play.toServer.settings
			}
			data: {
				locale: string
				viewDistance: i8
				chatFlags: i8
				chatColors: boolean
				skinParts: u8
			}
		}
		export type ClientCommandPacket = {
			metadata: {
				name: 'client_command'
				state: 'play'
				id: Ids.Play.toServer.client_command
			}
			data: {
				payload: varint
			}
		}
		export type CustomPayloadPacket = {
			metadata: {
				name: 'custom_payload'
				state: 'play'
				id: Ids.Play.toServer.custom_payload
			}
			data: {
				channel: string
				data: Buffer
			}
		}
		export type SpectatePacket = {
			metadata: {
				name: 'spectate_packet'
				state: 'play'
				id: Ids.Play.toServer.spectate
			}
			data: {
				target: UUID
			}
		}
		export type ResourcePackReceivePacket = {
			metadata: {
				name: 'resource_pack_receive'
				state: 'play'
				id: Ids.Play.toServer.resource_pack_receive
			}
			data: {
				hash: string
				result: varint
			}
		}
	}
}

export namespace Status {
	export namespace toClient {
		export type ServerInfoPacket = {
			metadata: {
				name: 'server_info'
				state: 'status'
				id: Ids.Status.toClient.server_info
			}
			data: {
				response: string
			}
		}
		export type PingPacket = {
			metadata: {
				name: 'ping'
				state: 'status'
				id: Ids.Status.toClient.ping
			}
			data: {
				time: i64
			}
		}
	}
	export namespace toServer {
		export type PingStartPacket = {
			metadata: {
				name: 'ping_start'
				state: 'status'
				id: Ids.Status.toServer.ping_start
			}
			data: {}
		}
		export type PingPacket = {
			metadata: {
				name: 'ping'
				state: 'status'
				id: Ids.Status.toServer.ping
			}
			data: {
				time: i64
			}
		}
	}
}

export namespace Handshaking {
	export namespace toServer {
		export type LegacyServerListPingPacket = {
			metadata: {
				name: 'legacy_server_list_ping'
				state: 'handshaking'
				id: Ids.Handshaking.toServer.legacy_server_list_ping
			}
			data: {
				payload: u8
			}
		}
		export type SetProtocolPacket = {
			metadata: {
				name: 'set_protocol'
				state: 'handshaking'
				id: Ids.Handshaking.toServer.set_protocol
			}
			data: {
				protocolVersion: varint
				serverHost: string
				serverPort: u16
				nextState: varint
			}
		}
	}
}

export namespace Login {
	export namespace toClient {
		export type DisconnectPacket = {
			metadata: {
				name: 'disconnect'
				state: 'login'
				id: Ids.Login.toClient.disconnect
			}
			data: {
				reason: string
			}
		}
		export type EncryptionBeginPacket = {
			metadata: {
				name: 'encryption_begin'
				state: 'login'
				id: Ids.Login.toClient.encryption_begin
			}
			data: {
				serverId: string
				publicKey: Buffer
				verifyToken: Buffer
			}
		}
		export type SuccessPacket = {
			metadata: {
				name: 'success'
				state: 'login'
				id: Ids.Login.toClient.success
			}
			data: {
				uuid: UUID
				username: string
			}
		}
		export type CompressPacket = {
			metadata: {
				name: 'compress'
				state: 'login'
				id: Ids.Login.toClient.compress
			}
			data: {
				threshold: varint
			}
		}
	}
	export namespace toServer {
		export type LoginStartPacket = {
			metadata: {
				name: 'login_start'
				state: 'login'
				id: Ids.Login.toServer.login_start
			}
			data: {
				username: string
			}
		}
		export type EncryptionBeginPacket = {
			metadata: {
				name: 'encryption_begin'
				state: 'login'
				id: Ids.Login.toServer.encryption_begin
			}
			data: {
				sharedSecret: Buffer
				verifyToken: Buffer
			}
		}
	}
}

export type PlayerInfoData =
	| {
			UUID: UUID
			name: string
			properties: Array<{
				name: string
				value: string
				signature?: string
			}>
			gamemode: number
			ping: number
			displayName?: string
	  }
	| {
			UUID: UUID
			gamemode: number
	  }
	| {
			UUID: UUID
			ping: number
	  }
	| {
			UUID: UUID
			displayName?: string
	  }
	| {
			UUID: UUID
	  }

export enum PlayerInfoAction {
	AddPlayer = 0,
	UpdateGamemode = 1,
	UpdatePing = 2,
	UpdateDisplayName = 3,
	RemovePlayer = 4,
}

export enum ScoreboardObjectiveAction {
	Create = 0,
	Remove = 1,
	Update = 2,
}

export enum ScoreboardTeamMode {
	Create = 0,
	Remove = 1,
	UpdateInformation = 2,
	AddPlayers = 3,
	RemovePlayers = 4,
}

export enum Difficulty {
	Peaceful = 0,
	Easy = 1,
	Normal = 2,
	Hard = 3,
}

export enum CombatEvent {
	Enter = 0,
	End = 1,
	Dead = 2,
}

export enum WorldBorderAction {
	SetSize = 0,
	LerpSize = 1,
	SetCenter = 2,
	Initialize = 3,
	SetWarningTime = 4,
	SetWarningBlocks = 5,
}

export enum TitleAction {
	SetTitle = 0,
	SetSubtitle = 1,
	SetTimesAndDisplay = 2,
	Hide = 3,
	Reset = 4,
}

export function isPacket(packet: any): packet is Packet {
	return 'data' in packet
}

export async function writePacket<P extends Packet>(client: LilithClient, direction: 'toClient' | 'toServer', packet: P) {
	if (isPacket(packet)) {
		if (direction === 'toClient') {
			await client.sendClientbound(serialize('minecraft', direction, packet))
		} else {
			await client.sendServerbound(serialize('minecraft', direction, packet))
		}
	}
}

export async function serverConnectionPacket<P extends Packet>(client: ServerConnection, direction: 'toClient' | 'toServer', packet: P) {
	if (isPacket(packet)) {
		if (direction === 'toClient') {
			await client.send(serialize('minecraft', direction, packet))
		} else {
			await client.send(serialize('minecraft', direction, packet))
		}
	}
}

export type Packet =
	| Play.toClient.KeepAlivePacket
	| Play.toClient.LoginPacket
	| Play.toClient.ChatPacket
	| Play.toClient.UpdateTimePacket
	| Play.toClient.EntityEquipmentPacket
	| Play.toClient.SpawnPositionPacket
	| Play.toClient.UpdateHealthPacket
	| Play.toClient.RespawnPacket
	| Play.toClient.PositionPacket
	| Play.toClient.HeldItemSlotPacket
	| Play.toClient.BedPacket
	| Play.toClient.AnimationPacket
	| Play.toClient.NamedEntitySpawnPacket
	| Play.toClient.CollectPacket
	| Play.toClient.SpawnEntityPacket
	| Play.toClient.SpawnEntityLivingPacket
	| Play.toClient.SpawnEntityPaintingPacket
	| Play.toClient.SpawnEntityExperienceOrbPacket
	| Play.toClient.EntityVelocityPacket
	| Play.toClient.EntityDestroyPacket
	| Play.toClient.EntityPacket
	| Play.toClient.RelEntityMovePacket
	| Play.toClient.EntityLookPacket
	| Play.toClient.EntityMoveLookPacket
	| Play.toClient.EntityTeleportPacket
	| Play.toClient.EntityHeadRotationPacket
	| Play.toClient.EntityStatusPacket
	| Play.toClient.AttachEntityPacket
	| Play.toClient.EntityMetadataPacket
	| Play.toClient.EntityEffectPacket
	| Play.toClient.RemoveEntityEffectPacket
	| Play.toClient.ExperiencePacket
	| Play.toClient.UpdateAttributesPacket
	| Play.toClient.MapChunkPacket
	| Play.toClient.MultiBlockChangePacket
	| Play.toClient.BlockChangePacket
	| Play.toClient.BlockActionPacket
	| Play.toClient.BlockBreakAnimationPacket
	| Play.toClient.MapChunkBulkPacket
	| Play.toClient.ExplosionPacket
	| Play.toClient.WorldEventPacket
	| Play.toClient.NamedSoundEffectPacket
	| Play.toClient.WorldParticlesPacket
	| Play.toClient.GameStateChangePacket
	| Play.toClient.SpawnEntityWeatherPacket
	| Play.toClient.OpenWindowPacket
	| Play.toClient.CloseWindowPacket
	| Play.toClient.SetSlotPacket
	| Play.toClient.WindowItemsPacket
	| Play.toClient.CraftProgressBarPacket
	| Play.toClient.TransactionPacket
	| Play.toClient.UpdateSignPacket
	| Play.toClient.MapPacket
	| Play.toClient.TileEntityDataPacket
	| Play.toClient.OpenSignEntityPacket
	| Play.toClient.StatisticsPacket
	| Play.toClient.PlayerInfoPacket
	| Play.toClient.AbilitiesPacket
	| Play.toClient.TabCompletePacket
	| Play.toClient.ScoreboardObjectivePacket
	| Play.toClient.ScoreboardScorePacket
	| Play.toClient.ScoreboardDisplayObjectivePacket
	| Play.toClient.ScoreboardTeamPacket
	| Play.toClient.CustomPayloadPacket
	| Play.toClient.KickDisconnectPacket
	| Play.toClient.DifficultyPacket
	| Play.toClient.CombatEventPacket
	| Play.toClient.CameraPacket
	| Play.toClient.WorldBorderPacket
	| Play.toClient.TitlePacket
	| Play.toClient.SetCompressionPacket
	| Play.toClient.PlayerlistHeaderPacket
	| Play.toClient.ResourcePackSendPacket
	| Play.toClient.UpdateEntityNBTPacket
	| Play.toServer.KeepAlivePacket
	| Play.toServer.ChatPacket
	| Play.toServer.UseEntityPacket
	| Play.toServer.FlyingPacket
	| Play.toServer.PositionPacket
	| Play.toServer.LookPacket
	| Play.toServer.PositionLookPacket
	| Play.toServer.BlockDigPacket
	| Play.toServer.BlockPlacePacket
	| Play.toServer.HeldItemSlotPacket
	| Play.toServer.ArmAnimationPacket
	| Play.toServer.EntityActionPacket
	| Play.toServer.SteerVehiclePacket
	| Play.toServer.CloseWindowPacket
	| Play.toServer.WindowClickPacket
	| Play.toServer.TransactionPacket
	| Play.toServer.SetCreativeSlotPacket
	| Play.toServer.EnchantItemPacket
	| Play.toServer.UpdateSignPacket
	| Play.toServer.AbilitiesPacket
	| Play.toServer.TabCompletePacket
	| Play.toServer.SettingsPacket
	| Play.toServer.ClientCommandPacket
	| Play.toServer.CustomPayloadPacket
	| Play.toServer.SpectatePacket
	| Play.toServer.ResourcePackReceivePacket
	| Handshaking.toServer.SetProtocolPacket
	| Handshaking.toServer.LegacyServerListPingPacket
	| Status.toClient.ServerInfoPacket
	| Status.toClient.PingPacket
	| Status.toServer.PingStartPacket
	| Status.toServer.PingPacket
	| Login.toClient.DisconnectPacket
	| Login.toClient.EncryptionBeginPacket
	| Login.toClient.SuccessPacket
	| Login.toClient.CompressPacket
	| Login.toServer.LoginStartPacket
	| Login.toServer.EncryptionBeginPacket
