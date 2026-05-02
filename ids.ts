export namespace Ids {
	export type id = Handshaking.toServer | Status.toClient | Status.toServer | Login.toClient | Login.toServer | Play.toClient | Play.toServer
	export namespace Handshaking {
		export type id = toServer

		export enum toServer {
			set_protocol = 0x00,
			legacy_server_list_ping = 0xfe,
		}
	}
	export namespace Status {
		export type id = toClient | toServer

		export enum toClient {
			server_info = 0x00,
			ping,
		}

		export enum toServer {
			ping_start = 0x00,
			ping,
		}
	}
	export namespace Login {
		export type id = toClient | toServer

		export enum toClient {
			disconnect = 0x00,
			encryption_begin,
			success,
			compress,
		}

		export enum toServer {
			login_start = 0x00,
			encryption_begin,
		}
	}
	export namespace Play {
		export type id = toClient | toServer

		export enum toClient {
			keep_alive = 0x00,
			login,
			chat,
			update_time,
			entity_equipment,
			spawn_position,
			update_health,
			respawn,
			position,
			held_item_slot,
			bed,
			animation,
			named_entity_spawn,
			collect,
			spawn_entity,
			spawn_entity_living,
			spawn_entity_painting,
			spawn_entity_experience_orb,
			entity_velocity,
			entity_destroy,
			entity,
			rel_entity_move,
			entity_look,
			entity_move_look,
			entity_teleport,
			entity_head_rotation,
			entity_status,
			attach_entity,
			entity_metadata,
			entity_effect,
			remove_entity_effect,
			experience,
			update_attributes,
			map_chunk,
			multi_block_change,
			block_change,
			block_action,
			block_break_animation,
			map_chunk_bulk,
			explosion,
			world_event,
			named_sound_effect,
			world_particles,
			game_state_change,
			spawn_entity_weather,
			open_window,
			close_window,
			set_slot,
			window_items,
			craft_progress_bar,
			transaction,
			update_sign,
			map,
			tile_entity_data,
			open_sign_entity,
			statistics,
			player_info,
			abilities,
			tab_complete,
			scoreboard_objective,
			scoreboard_score,
			scoreboard_display_objective,
			scoreboard_team,
			custom_payload,
			kick_disconnect,
			difficulty,
			combat_event,
			camera,
			world_border,
			title,
			set_compression,
			playerlist_header,
			resource_pack_send,
			update_entity_nbt,
		}

		export enum toServer {
			keep_alive = 0x00,
			chat,
			use_entity,
			flying,
			position,
			look,
			position_look,
			block_dig,
			block_place,
			held_item_slot,
			arm_animation,
			entity_action,
			steer_vehicle,
			close_window,
			window_click,
			transaction,
			set_creative_slot,
			enchant_item,
			update_sign,
			abilities,
			tab_complete,
			settings,
			client_command,
			custom_payload,
			spectate,
			resource_pack_receive,
		}
	}
}
