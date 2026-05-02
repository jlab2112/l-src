import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import { chat } from '@/utils/chat.js'
import { completions } from '@/utils/completions.js'
import { permission } from '@/utils/permissions.js'

const plainAliases: Record<string, string> = {
	dropper: 'prototype_dropper',
	pixel: 'prototype_pixel_party',
	pixelparty: 'prototype_pixel_party',
	wool: 'wool_wool_wars_two_four',
	ww: 'wool_wool_wars_two_four',
	build: 'build_battle_solo_normal',
	buildbattle: 'build_battle_solo_normal',
	bb: 'build_battle_solo_normal',
	uhc: 'uhc_solo',
	speed: 'speed_solo_normal',
	bedwars: 'bedwars_eight_one',
	skywars: 'solo_insane',
	bw: 'bedwars_eight_one',
	sw: 'solo_insane',
	murder: 'murder_classic',
	mm: 'murder_classic',
	quake: 'quake_solo',
	quake2: 'quake_doubles',
	arena: 'arena_1v1',
	arena1: 'arena_1v1',
	arena2: 'arena_2v2',
	arena4: 'arena_4v4',
	smash: 'super_smash_solo_normal',
	sh: 'super_smash_solo_normal',
	mcgo: 'mcgo_normal',
	cvc: 'mcgo_normal',
	blitz: 'blitz_solo_normal',
	sg: 'blitz_solo_normal',
	mw: 'mw_standard',
	hitw: 'arcade_hole_in_the_wall',
	soccer: 'arcade_soccer',
	football: 'arcade_soccer',
	bounty: 'arcade_bounty_hunters',
	bh: 'arcade_bounty_hunters',
	paint: 'arcade_pixel_painters',
	dragon: 'arcade_dragon_wars',
	ender: 'arcade_ender_spleef',
	starwars: 'arcade_starwars',
	galaxy: 'arcade_starwars',
	throwout: 'arcade_throw_out',
	throw: 'arcade_throw_out',
	creeper: 'arcade_creeper_attack',
	party: 'arcade_party_games_1',
	farm: 'arcade_farm_hunt',
	simon: 'arcade_simon_says',
	simonsays: 'arcade_simon_says',
	hypixelsays: 'arcade_simon_says',
	santa: 'arcade_santa_says',
	santasays: 'arcade_santa_says',
	miniwalls: 'arcade_mini_walls',
	dayone: 'arcade_day_one',
	blockingdead: 'arcade_day_one',
	ctw: 'arcade_pvp_ctw',
	ctf: 'arcade_pvp_ctw',
}

const nestedAliases: Record<string, Record<string, string>> = {
	duels: {
		skywars: 'duels_sw_duel',
		skywars2: 'duels_sw_doubles',
		uhc8: 'duels_uhc_meetup',
		ndb: 'duels_potion_duel',
		nodebuff: 'duels_potion_duel',
		megawalls: 'duels_mw_duel',
		megawalls2: 'duels_mw_doubles',
		b: 'duels_bridge_duel',
		b2: 'duels_bridge_doubles',
		b3: 'duels_bridge_threes',
		b4: 'duels_bridge_four',
		b2v2: 'duels_bridge_2v2v2v2',
		b3v3: 'duels_bridge_3v3v3v3',
		b2s: 'duels_bridge_2v2v2v2',
		b3s: 'duels_bridge_3v3v3v3',
		bc3: 'duels_capture_threes',
		box: 'duels_boxing_duel',
		parkour: 'duels_parkour_eight',
		arena: 'duels_duel_arena',
	},
	bedwars: {
		solo: 'bedwars_eight_one',
		duos: 'bedwars_eight_two',
		doubles: 'bedwars_eight_two',
		threes: 'bedwars_four_three',
		fours: 'bedwars_four_four',
		'1': 'bedwars_eight_one',
		'2': 'bedwars_eight_two',
		'3': 'bedwars_four_three',
		'4': 'bedwars_four_four',
		capture: 'bedwars_capture',
		rush2: 'bedwars_eight_two_rush',
		rush4: 'bedwars_four_four_rush',
		ultimate2: 'bedwars_eight_two_ultimate',
		ultimate4: 'bedwars_four_four_ultimate',
		castle: 'bedwars_castle',
		'4v4': 'bedwars_two_four',
		void2: 'bedwars_eight_two_voidless',
		void4: 'bedwars_four_four_voidless',
		voidless2: 'bedwars_eight_two_voidless',
		voidless4: 'bedwars_four_four_voidless',
		armed2: 'bedwars_eight_two_armed',
		armed4: 'bedwars_four_four_armed',
		lucky2: 'bedwars_eight_two_lucky',
		lucky4: 'bedwars_four_four_lucky',
	},
	skywars: {
		ranked: 'ranked_normal',
		mega: 'mega_normal',
		mega2: 'mega_doubles',
		tnt: 'solo_insane_tnt_madness',
		tnt2: 'teams_insane_tnt_madness',
		rush: 'solo_insane_rush',
		rush2: 'teams_insane_rush',
		slime: 'solo_insane_slime',
		slime2: 'teams_insane_slime',
		lucky: 'solo_insane_lucky',
		lucky2: 'teams_insane_lucky',
		hvb: 'solo_insane_hunters_vs_beasts',
	},
	tnt: {
		run: 'tnt_tntrun',
		tntrun: 'tnt_tntrun',
		pvp: 'tnt_pvprun',
		pvprun: 'tnt_pvprun',
		bs: 'tnt_bowspleef',
		spleef: 'tnt_bowspleef',
		bowspleef: 'tnt_bowspleef',
		tag: 'tnt_tnttag',
		tnttag: 'tnt_tnttag',
		capture: 'tnt_capture',
		wizards: 'tnt_capture',
	},
	speed: {
		solo: 'speed_solo_normal',
		team: 'speed_team_normal',
		'1': 'speed_solo_normal',
		'2': 'speed_team_normal',
	},
	uhc: {
		solo: 'uhc_solo',
		team: 'uhc_teams',
		'1': 'uhc_solo',
		'4': 'uhc_teams',
		events: 'uhc_events',
	},
	build: {
		solo: 'build_battle_solo_normal',
		duos: 'build_battle_teams_normal',
		doubles: 'build_battle_teams_normal',
		teams: 'build_battle_teams_normal',
		'1': 'build_battle_solo_normal',
		'2': 'build_battle_teams_normal',
		pro: 'build_battle_solo_pro',
		gtb: 'build_battle_guess_the_build',
		guess: 'build_battle_guess_the_build',
	},
	murder: {
		classic: 'murder_classic',
		solo: 'murder_classic',
		'1': 'murder_classic',
		duos: 'murder_double_up',
		doubles: 'murder_double_up',
		'2': 'murder_double_up',
		assassins: 'murder_assassins',
		infection: 'murder_infection',
		zombies: 'murder_infection',
		infect: 'murder_infection',
	},
	smash: {
		solo: 'super_smash_solo_normal',
		duos: 'super_smash_teams_normal',
		doubles: 'super_smash_teams_normal',
		'1': 'super_smash_solo_normal',
		'2': 'super_smash_teams_normal',
		'1v1': 'super_smash_1v1_normal',
		'2v2': 'super_smash_2v2_normal',
		friends: 'super_smash_friends_normal',
	},
	mcgo: {
		defusal: 'mcgo_normal',
		deathmatch: 'mcgo_deathmatch',
		party: 'mcgo_normal_party',
		partydm: 'mcgo_deathmatch_party',
	},
	blitz: {
		solo: 'blitz_solo_normal',
		duos: 'blitz_teams_normal',
		doubles: 'blitz_teams_normal',
		teams: 'blitz_teams_normal',
		'1': 'blitz_solo_normal',
		'2': 'blitz_teams_normal',
	},
	warlords: {
		ctf: 'warlords_ctf_mini',
		dom: 'warlords_domination',
		domination: 'warlords_domination',
		deathmatch: 'warlords_team_deathmatch',
	},
	arcade: {
		hitw: 'arcade_hole_in_the_wall',
		soccer: 'arcade_soccer',
		football: 'arcade_soccer',
		bounty: 'arcade_bounty_hunters',
		bh: 'arcade_bounty_hunters',
		pixel: 'arcade_pixel_painters',
		paint: 'arcade_pixel_painters',
		dragon: 'arcade_dragon_wars',
		ender: 'arcade_ender_spleef',
		sw: 'arcade_starwars',
		starwars: 'arcade_starwars',
		galaxy: 'arcade_starwars',
		throwout: 'arcade_throw_out',
		throw: 'arcade_throw_out',
		creeper: 'arcade_creeper_attack',
		party: 'arcade_party_games_1',
		farm: 'arcade_farm_hunt',
		simon: 'arcade_simon_says',
		simonsays: 'arcade_simon_says',
		hypixelsays: 'arcade_simon_says',
		santa: 'arcade_santa_says',
		santasays: 'arcade_santa_says',
		miniwalls: 'arcade_mini_walls',
		mw: 'arcade_mini_walls',
		dayone: 'arcade_day_one',
		blockingdead: 'arcade_day_one',
		ctw: 'arcade_pvp_ctw',
		wool: 'arcade_pvp_ctw',
		ctf: 'arcade_pvp_ctw',
	},
	zombies: {
		deadend: 'arcade_zombies_dead_end',
		dead: 'arcade_zombies_dead_end',
		badblood: 'arcade_zombies_bad_blood',
		bad: 'arcade_zombies_bad_blood',
		blood: 'arcade_zombies_bad_blood',
		alien: 'arcade_zombies_alien_arcadium',
	},
	hide: {
		prop: 'arcade_hide_and_seek_prop_hunt',
		prophunt: 'arcade_hide_and_seek_prop_hunt',
		ph: 'arcade_hide_and_seek_prop_hunt',
		party: 'arcade_hide_and_seek_party_pooper',
		partypooper: 'arcade_hide_and_seek_party_pooper',
	},
}

const gametypeAliases: Record<string, string> = {
	duels: 'duels',
	d: 'duels',
	bw: 'bedwars',
	bedwars: 'bedwars',
	sw: 'skywars',
	skywars: 'skywars',
	tnt: 'tnt',
	speed: 'speed',
	uhc: 'uhc',
	build: 'build',
	buildbattle: 'build',
	bb: 'build',
	murder: 'murder',
	mm: 'murder',
	smash: 'smash',
	sh: 'smash',
	mcgo: 'mcgo',
	cvc: 'mcgo',
	blitz: 'blitz',
	sg: 'blitz',
	warlords: 'warlords',
	wl: 'warlords',
	arcade: 'arcade',
	a: 'arcade',
	zombies: 'zombies',
	z: 'zombies',
	hide: 'hide',
	hideandseek: 'hide',
}

const extraDuelsAliases = [
	'classic',
	'sw',
	'sw2',
	'bow',
	'uhc',
	'potion',
	'combo',
	'op',
	'op2',
	'mw',
	'mw2',
	'blitz',
	'sumo',
	'bridge',
	'bridge2',
	'bridge3',
	'bridge4',
	'bowspleef',
]

registerCommand('play', [], {
	execute: async (client, raw, parsed) => {
		const args = new lexure.Args(parsed)
		let first = args.single()
		if (first == null) {
			writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
				metadata: {
					name: 'chat',
					state: 'play',
					id: Ids.Play.toServer.chat,
				},
				data: {
					message: '/play',
				},
			})
			return
		}
		let second = args.single()
		if (second == null && !Object.keys(plainAliases).includes(first)) {
			for (const alias of Object.keys(gametypeAliases)) {
				Lilith.log.trace(alias)
				if (first !== alias && first.startsWith(alias)) {
					Lilith.log.info(first.substring(alias.length))
					second = first.substring(alias.length)
					first = alias
					break
				}
			}
		}
		let command = raw
		if (!raw.includes('_')) {
			if (first != null && second == null) {
				if (client.partyMembers != null && (first === 'bedwars' || first === 'bw')) {
					switch (client.partyMembers.length) {
						case 1:
							command = '/play bedwars_eight_one'
							break
						case 2:
							command = '/play bedwars_eight_two'
							break
						case 3:
							command = '/play bedwars_four_three'
							break
						case 4:
							command = '/play bedwars_four_four'
							break
						default:
							command = '/play bedwars_four_four'
					}
				} else if (client.partyMembers != null && (first === 'skywars' || first === 'sw')) {
					switch (client.partyMembers.length) {
						case 1:
							command = '/play solo_insane'
							break
						case 2:
							command = '/play teams_insane'
							break
						default:
							command = '/play solo_insane'
					}
				} else if (plainAliases[first] != null) {
					command = `/play ${plainAliases[first]}`
				}
			} else if (first != null && second != null) {
				first = gametypeAliases[first]
				if (first != null) {
					if (nestedAliases[first] != null && nestedAliases[first][second] != null) {
						command = `/play ${nestedAliases[first][second]}`
					} else if (first === 'duels') {
						if (second.endsWith('2')) {
							command = `/play duels_${second.substring(0, second.length - 1)}_doubles`
						} else if (second.endsWith('3')) {
							command = `/play duels_${second.substring(0, second.length - 1)}_threes`
						} else if (second.endsWith('4')) {
							command = `/play duels_${second.substring(0, second.length - 1)}_four`
						} else {
							command = `/play duels_${second}_duel`
						}
					} else if (first === 'skywars') {
						if (second.endsWith('2')) {
							command = `/play teams_${second.substring(0, second.length - 1)}`
						} else {
							command = `/play solo_${second}`
						}
					}
				}
			}
		}

		if (!permission('lilith.commands.play')) {
			if (command !== raw) chat(client, '&cLilith &8> &7This alias would work with Lilith Premium!')
			command = raw
		}

		writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
			metadata: {
				name: 'chat',
				state: 'play',
				id: Ids.Play.toServer.chat,
			},
			data: {
				message: command,
			},
		})
	},
	completion: (client, input) => {
		const argsCount = (input.match(/ /g) || []).length
		switch (argsCount) {
			case 1:
				return completions(Object.keys(plainAliases).concat(Object.keys(gametypeAliases)))(client, input)
			case 2: {
				const first = input.substring(input.indexOf(' ') + 1, input.lastIndexOf(' '))
				if (nestedAliases[gametypeAliases[first]] == null) return []
				if (gametypeAliases[first] === 'duels') {
					const list = Object.keys(nestedAliases[gametypeAliases[first]]).concat(extraDuelsAliases).sort()
					return completions(list)(client, input)
				}
				return completions(Object.keys(nestedAliases[gametypeAliases[first]]))(client, input)
			}
			default:
				return []
		}
	},
})
