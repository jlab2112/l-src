import * as lexure from 'lexure'
import type { LilithClient } from '@/client.js'
import { registerCommand } from '@/commands/handler'
import config from '@/config'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import { chatJson, chatString } from '@/utils/chat.js'

/**
 * Filename: rq.mdx
 * Command: rq
 * Byline: Requeue into the same type of game.
 * Usage: `/rq [force]`
 * Aliases: requeue
 * Added: Before Full Release
 *
 * Description:
 * This command will run the `/play` command associated with the gamemode you are currently playing. If in a lobby, the last played gamemode will be used.
 * As of Lilith 2.0.0, `/rq` will not work by default when a game has already started. To requeue while in a game, use `/rq force`.
 *
 * While most gamemodes will work, and play commands can be updated remotely, newer gamemodes may not work as expected. Report any issues in a ticket.
 * Requeueing being blocked after a game start is only guaranteed to work in games supported by queuestats.
 *
 * Changelog - Version 2.0.0:
 * Requeueing after a game start is now blocked by default. Use `/rq force` to bypass this.
 * Added `/requeue` alias.
 */

registerCommand('rq', ['requeue'], {
	execute: (client, _raw, parsed) => {
		const lArgs = new lexure.Args(parsed)
		const arg = lArgs.single()
		if (arg !== null || arg === 'force') {
			requeue(client, true)
			return
		}
		requeue(client, false)
	},
})

// TODO: fix config maybe in autogg?
export function requeue(client: LilithClient, force = false) {
	if (client.gameInfo.started && !client.gameInfo.ended && !force && config().chat.noRequeueAfterGameStart) {
		const message = [
			'',
			{ text: 'Lilith ', color: 'red' },
			{ text: '> ', color: 'dark_gray' },
			{
				text: ' You did not requeue because you were in game. ',
				color: 'gray',
			},
			{
				text: 'Click here to force requeue',
				clickEvent: {
					action: 'run_command',
					value: '/rq force',
				},
				hoverEvent: {
					action: 'show_text',
					value: 'Force requeue.',
				},
				color: 'red',
				underlined: true,
			},
			{
				text: '.',
				color: 'gray',
			},
		]
		chatJson(client, message)
		return
	}

	let loc = client.location
	if (loc?.serverName?.includes('lobby') && client.lastGame != null) {
		loc = client.lastGame
	}
	if (loc === undefined || loc.mode == null) {
		chatString(client, '&cLilith &8> &7Requeue command failed. Sending to lobby')
		writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
			metadata: {
				name: 'chat',
				state: 'play',
				id: Ids.Play.toServer.chat,
			},
			data: {
				message: '/l',
			},
		})
		return
	}

	let playCommand: string
	try {
		playCommand = locHandlers[loc.serverType](loc.mode)
	} catch {
		playCommand = 'unsupported'
	}

	writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
		metadata: {
			name: 'chat',
			state: 'play',
			id: Ids.Play.toServer.chat,
		},
		data: {
			message: `/play ${playCommand}`,
		},
	})
}

const locHandlers: Record<string, (mode: string) => string> = {
	DUELS: (mode) => mode.toLowerCase(),
	BEDWARS: (mode) => mode.toLowerCase(),
	SKYWARS: (mode) => mode.toLowerCase(),
	MURDER_MYSTERY: (mode) => mode.toLowerCase(),
	BUILD_BATTLE: (mode) => mode.toLowerCase(),
	SUPER_SMASH: (mode) => `super_smash_${mode.toLowerCase()}`,
	MCGO: (mode) => `mcgo_${mode.toLowerCase()}`,
	ARENA: (mode) => `arena_${mode.toLowerCase()}`,
	TNTGAMES: (mode) => `tnt_${mode.toLowerCase()}`,
	WALLS3: (mode) => `mw_${mode.toLowerCase()}`,
	SURVIVAL_GAMES: (mode) => `blitz_${mode.toLowerCase()}`,
	BATTLEGROUND: (mode) => `warlords_${mode.toLowerCase()}`,
	QUAKECRAFT: (mode) => `quake_${mode.toLowerCase()}`,
	UHC: (mode) => `uhc_${mode.toLowerCase()}`,
	SPEED_UHC: (mode) => `speed_${mode.toLowerCase()}`,
	WOOL_GAMES: (mode) => `wool_${mode.toLowerCase()}`,
	GINGERBREAD: () => 'tkr',
	WALLS: () => 'walls',
	PAINTBALL: () => 'paintball',
	VAMPIREZ: () => 'vampirez',
	SKYBLOCK: () => 'sb',
	PROTOTYPE: (mode) => `prototype_${mode.toLowerCase()}`,
	ARCADE: (mode) => {
		switch (mode) {
			case 'HOLE_IN_THE_WALL':
				return 'arcade_hole_in_the_wall'
			case 'SOCCER':
				return 'arcade_soccer'
			case 'ONEINTHEQUIVER':
				return 'arcade_bounty_hunters'
			case 'DRAW_THEIR_THING':
				return 'arcade_pixel_painters'
			case 'DRAGONWARS2':
				return 'arcade_dragon_wars'
			case 'ENDER':
				return 'arcade_ender_spleef'
			case 'STARWARS':
				return 'arcade_starwars'
			case 'THROW_OUT':
				return 'arcade_throw_out'
			case 'DEFENDER':
				return 'arcade_creeper_attack'
			case 'PARTY':
				return 'arcade_party_games_1'
			case 'FARM_HUNT':
				return 'arcade_farm_hunt'
			case 'ZOMBIES_DEAD_END':
				return 'arcade_zombies_dead_end'
			case 'ZOMBIES_BAD_BLOOD':
				return 'arcade_zombies_bad_blood'
			case 'ZOMBIES_ALIEN_ARCADIUM':
				return 'arcade_zombies_alien_arcadium'
			case 'HIDE_AND_SEEK_PROP_HUNT':
				return 'arcade_hide_and_seek_prop_hunt'
			case 'HIDE_AND_SEEK_PARTY_POOPER':
				return 'arcade_hide_and_seek_party_pooper'
			case 'SIMON_SAYS':
				return 'arcade_simon_says'
			case 'SANTA_SAYS':
				return 'arcade_santa_says'
			case 'MINIWALLS':
				return 'arcade_mini_walls'
			case 'DAYONE':
				return 'arcade_day_one'
			case 'PVP_CTW':
				return 'arcade_pvp_ctw'
			case 'PIXEL_PARTY':
				return 'arcade_pixel_party'
			default:
				return 'unsupported'
		}
	},
}
