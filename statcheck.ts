import type { AllModes } from '@lilithmod/unborn-statgen'
import * as lexure from 'lexure'
import type { LilithClient } from '@/client'
import { registerCommand } from '@/commands/handler'
import { partyEmitter } from '@/listeners/emitters/locrawEmitter'
import { requestPartyInfo } from '@/listeners/partyInfo'
import { generateStats } from '@/stats/getStatsMessage'
import { chat, chatJson } from '@/utils/chat.js'
import { completions, playerCompletions } from '@/utils/completions.js'
import { waitFor } from '@/utils/events'

/**
 * Filename: statcheck.mdx
 * Command: sc
 * Byline: Check any player's stats.
 * Usage: `/sc [gamemode1,gamemode2,...] [player1] [player2] ...`
 * Aliases: statcheck
 * Added: Before Full Release
 *
 * Description:
 * This command will display one or more players' stats in chat.
 *
 * Most major gamemodes or supported such as Overall stats, Duels, BedWars, SkyWars, Wool Wars, Murder Mystery and some Arcade modes.
 * You can provide multiple gamemodes using a `,` as the separator.
 *
 * Statcheck also comes with selectors such as `@p` to statcheck your party, `@a` to statcheck your whole entire lobby and `@me` to statcheck yourself. Do note that not providing a target, will make you the target.
 * You can provide multiple targets using a space as the separator.
 *
 * Changelog - Version 2.0:
 * You can now use `,` to statcheck multiple gamemodes at once. Providing no arguments at all will display your overall stats.
 * Changelog - Version 1.0 Alpha 1:
 * Statcheck yourself with /sc when no targets are specified.
 * Statcheck multiple people at the same time, as well as @a, @p, and @me that statcheck the whole lobby, your party, and yourself.
 *

 */

registerCommand('sc', ['statcheck'], {
	execute: async (client, _raw, parsed) => {
		const args = new lexure.Args(parsed)
		let gm = args.single() // Get the first arg from the command. It will be our gamemode BUT IT'S NOT SURE YET! We need to check if it is valid first...
		let gamemode = ''
		if (gm == null) {
			// If there's no gamemode OR even no args! Because it's the first arg. I think later it could return overall stats but idk for now.
			// return chat(
			// 	client,
			// 	`&cSyntax &8> &7Please specify a gamemode or targets: &7${Object.keys(store().gamemodeAliases)
			// 		.map((a) => '&7' + a)
			// 		.join(', ')}`,
			// )
			gm = 'overall'
		}

		let targets = args.many().map((v) => v.raw) // Map all of the other args as targets.
		if (gm.split(',').length > 1) {
			gm.split(',').forEach((x) => {
				if (!Object.keys(gamemodeAliases).includes(x) && !Object.values(gamemodeAliases).includes(x as AllModes)) {
					const message = [
						'',
						{ text: 'Syntax ', color: 'red' },
						{ text: '> ', color: 'dark_gray' },
						{ text: `${x} is not a valid gamemode.`, color: 'gray' },
					]
					chatJson(client, message)
					return
				}
				gamemode = `${gamemode === '' ? '' : `${gamemode},`}${gamemodeAliases[x]}`
				// Otherwise if the 1st arg is a gamemode, we need to get its corresponding value as something parse-able by the statgen library. We are getting the store library with our unparsed gamemode to get a new and fresh parsed one!
			})
		} else {
			if (!Object.keys(gamemodeAliases).includes(gm) && !Object.values(gamemodeAliases).includes(gm as AllModes)) {
				// If the first arg is not a gamemode it is a target! So we are updating the target array by adding the gamemode which is in fact a target! We then change the gamemode (which is now a real gamemode!) to overall.
				targets = [gm, ...targets]
				gamemode = 'overall'
			} else gamemode = gamemodeAliases[gm] // Otherwise if the 1st arg is a gamemode, we need to get its corresponding value as something parse-able by the statgen library. We are getting the store library with our unparsed gamemode to get a new and fresh parsed one!
		}
		if (targets.length === 0) {
			// If there's only the gamemode provided (no targets) make the target the current user of lilith. Seriously you really needed to read this to understand?
			targets = [client.uuid]
		}

		for (const target of targets) {
			switch (target) {
				case '@a': {
					const duplicates = []
					for (const player of client.players) {
						if (!duplicates.includes(player.uuid)) {
							duplicates.push(player.uuid)
						} else continue
						try {
							await generateStats(player.uuid, gamemode, client, { showErrorFetchMessage: true })
						} catch {
							chat(client, `&cLilith &8> &7Failed to fetch stats for ${player.name}!`)
						}
					}
					break
				}
				case '@p': {
					await refreshPartyMembers(client)
					if (client.partyMembers.length === 0) {
						try {
							await generateStats(client.uuid, gamemode, client, { showErrorFetchMessage: true })
						} catch {
							chat(client, `&cLilith &8> &7Failed to fetch stats for ${client.username}!`)
						}
					} else {
						for (const player of client.partyMembers) {
							try {
								await generateStats(player, gamemode, client, { showErrorFetchMessage: true })
							} catch {
								chat(client, `&cLilith &8> &7Failed to fetch stats for ${player}!`)
							}
						}
					}
					break
				}
				case '@me': {
					try {
						// lilithWebsocket.send<'hypixelApiRequest'>('hypixelApiRequest', {
						// 	context: 'statcheck',
						// 	uuid: '',
						// })
						await generateStats(client.uuid, gamemode, client, { showErrorFetchMessage: true })
					} catch {
						chat(client, `&cLilith &8> &7Failed to fetch stats for ${client.username}!`)
					}
					break
				}
				default: {
					try {
						await generateStats(target, gamemode, client, { showErrorFetchMessage: true })
					} catch {
						chat(client, `&cLilith &8> &7Failed to fetch stats for ${target}!`)
					}
				}
			}
		}
	},
	completion: (client, input) => {
		const argsCount = (input.match(/ /g) || []).length
		switch (argsCount) {
			case 1:
				return completions(Object.keys(gamemodeAliases))(client, input)
			case 2:
				return playerCompletions(client, input)
			default:
				return []
		}
	},
})

async function refreshPartyMembers(client: LilithClient) {
	client.partyMembers = []
	requestPartyInfo(client)
	await waitFor('party', partyEmitter)
}

type GameModeAliases = {
	[key: string]: AllModes
}

const gamemodeAliases: GameModeAliases = {
	// Overall
	overall: 'overall',
	all: 'overall',
	hypixel: 'overall',
	general: 'overall',
	/* ------------------ DUELS ------------------ */
	// Duels Overall
	d: 'duels.overall',
	duels: 'duels.overall',
	duel: 'duels.overall',
	// Duels Arena
	arena: 'duels.arena',
	arenad: 'duels.arena',
	arenaduel: 'duels.arena',
	arena_duel: 'duels.arena',
	duelsarena: 'duels.arena',
	duels_arena: 'duels.arena',
	// Bridge Overall
	b: 'duels.bridge.overall',
	bridge: 'duels.bridge.overall',
	// Bridge Solo
	b1: 'duels.bridge.solo',
	bridge1: 'duels.bridge.solo',
	bridgesolo: 'duels.bridge.solo',
	bridge_solo: 'duels.bridge.solo',
	// Bridge Doubles
	b2: 'duels.bridge.doubles',
	bridge2: 'duels.bridge.doubles',
	bridgedoubles: 'duels.bridge.doubles',
	bridge_doubles: 'duels.bridge.doubles',
	// Bridge Threes
	b3: 'duels.bridge.threes',
	bridge3: 'duels.bridge.threes',
	bridgethrees: 'duels.bridge.threes',
	bridge_threes: 'duels.bridge.threes',
	// Bridge Fours
	b4: 'duels.bridge.fours',
	bridge4: 'duels.bridge.fours',
	bridgefours: 'duels.bridge.fours',
	bridge_fours: 'duels.bridge.fours',

	// Blitz Duel
	blitz: 'duels.blitzsg',
	blitzd: 'duels.blitzsg',
	blitzduel: 'duels.blitzsg',
	blitz_duel: 'duels.blitzsg',
	// Bow Duel
	bow: 'duels.bow',
	bowd: 'duels.bow',
	bowduel: 'duels.bow',
	bow_duel: 'duels.bow',
	// Bowspleef
	bs: 'duels.spleef.bowSpleef',
	sd: 'duels.spleef.spleef',
	bsd: 'duels.spleef.bowSpleef',
	spleefd: 'duels.spleef.spleef',
	bowspleef: 'duels.spleef.bowSpleef',
	bowspleefd: 'duels.spleef.bowSpleef',
	bow_spleef: 'duels.spleef.bowSpleef',
	bow_spleefd: 'duels.spleef.bowSpleef',
	tntd: 'duels.spleef.bowSpleef',
	tntduel: 'duels.spleef.bowSpleef',
	tnt_duel: 'duels.spleef.bowSpleef',
	// Boxing Duel
	boxing: 'duels.boxing',
	boxingd: 'duels.boxing',
	boxingduel: 'duels.boxing',
	boxing_duel: 'duels.boxing',
	// Classic Duel
	classic: 'duels.classic.overall',
	classicd: 'duels.classic.overall',
	classicduel: 'duels.classic.overall',
	classic_duel: 'duels.classic.overall',
	classic_duel_solo: 'duels.classic.solo',
	classic_duel_double: 'duels.classic.doubles',
	// Combo Duel
	combo: 'duels.combo',
	combod: 'duels.combo',
	comboduel: 'duels.combo',
	combo_duel: 'duels.combo',
	// Nodebuff Duel
	ndb: 'duels.nodebuff',
	nodebuff: 'duels.nodebuff',
	nodebuffd: 'duels.nodebuff',
	nodebuffduel: 'duels.nodebuff',
	nodebuff_duel: 'duels.nodebuff',
	// Sumo Duel
	sumo: 'duels.sumo',
	sumod: 'duels.sumo',
	sumoduel: 'duels.sumo',
	sumo_duel: 'duels.sumo',
	// UHC Overall
	u: 'duels.uhc.overall',
	uhc: 'duels.uhc.overall',
	// UHC Solo
	u1: 'duels.uhc.solo',
	uhc1: 'duels.uhc.solo',
	uhcsolo: 'duels.uhc.solo',
	uhc_solo: 'duels.uhc.solo',
	// UHC Doubles
	u2: 'duels.uhc.doubles',
	uhc2: 'duels.uhc.doubles',
	uhcdoubles: 'duels.uhc.doubles',
	uhc_doubles: 'duels.uhc.doubles',
	// UHC Fours
	u4: 'duels.uhc.fours',
	uhc4: 'duels.uhc.fours',
	uhcfours: 'duels.uhc.fours',
	uhc_fours: 'duels.uhc.fours',
	// UHC Deathmatch
	ud: 'duels.uhc.deathmatch',
	u8: 'duels.uhc.deathmatch',
	uhcd: 'duels.uhc.deathmatch',
	uhc8: 'duels.uhc.deathmatch',
	uhcdeathmatch: 'duels.uhc.deathmatch',
	uhc_deathmatch: 'duels.uhc.deathmatch',
	// Megawalls Overall
	mw: 'duels.megawalls',
	megawalls: 'duels.megawalls',
	// Megawalls Solo
	mw1: 'duels.megawalls',
	mwd: 'duels.megawalls',
	megawalls1: 'duels.megawalls',
	megawallsd: 'duels.megawalls',
	megawallssolo: 'duels.megawalls',
	megawalls_solo: 'duels.megawalls',
	// OP Overall
	op: 'duels.op.overall',
	// OP Solo
	op1: 'duels.op.solo',
	opd: 'duels.op.solo',
	opsolo: 'duels.op.solo',
	op_solo: 'duels.op.solo',
	// OP Doubles
	op2: 'duels.op.doubles',
	opdoubles: 'duels.op.doubles',
	op_doubles: 'duels.op.doubles',
	// Parkour Duels
	parkour: 'duels.parkour',
	parkourd: 'duels.parkour',
	// Skywars Duels Overall
	swd: 'duels.skywars.overall',
	skywarsd: 'duels.skywars.overall',
	skywarsduels: 'duels.skywars.overall',
	skywars_duels: 'duels.skywars.overall',
	// Skywars Duels Solo
	swd1: 'duels.skywars.solo',
	skywarsd1: 'duels.skywars.solo',
	// Skywars Duels Doubles
	swd2: 'duels.skywars.doubles',
	skywarsd2: 'duels.skywars.doubles',
	//BedWars duel
	bwd: 'duels.bedwars.overall',
	bedwarsd: 'duels.bedwars.overall',
	bedwars_duels: 'duels.bedwars.overall',
	bwdr: 'duels.bedwars.rush',
	bedwars_duels_rush: 'duels.bedwars.rush',
	bedwarsdr: 'duels.bedwars.rush',
	bwdb: 'duels.bedwars.bedwars',
	bedwarsdb: 'duels.bedwars.bedwars',
	bedwars_duels_bedwars: 'duels.bedwars.bedwars',
	//Quake duel
	quaked: 'duels.quake',
	qd: 'duels.quake',

	/* ------------------ BEDWARS ------------------ */
	// Bedwars Overall
	bw: 'bedwars.overall',
	bedwars: 'bedwars.overall',
	bed: 'bedwars.overall',
	// Bedwars Solo
	bw1: 'bedwars.solo',
	bedwars1: 'bedwars.solo',
	bedwarssolo: 'bedwars.solo',
	bedwars_solo: 'bedwars.solo',
	// Bedwars Doubles
	bw2: 'bedwars.doubles',
	bw2s: 'bedwars.doubles',
	bedwars2: 'bedwars.doubles',
	bedwarsdoubles: 'bedwars.doubles',
	bedwars_doubles: 'bedwars.doubles',
	// Bedwars Threes
	bw3: 'bedwars.threes',
	bw3s: 'bedwars.threes',
	bedwars3: 'bedwars.threes',
	bedwarsthrees: 'bedwars.threes',
	bedwars_threes: 'bedwars.threes',
	// Bedwars Fours
	bw4: 'bedwars.fours',
	bw4s: 'bedwars.fours',
	bedwars4: 'bedwars.fours',
	bedwarsfours: 'bedwars.fours',
	bedwars_fours: 'bedwars.fours',
	// Bedwars Core
	bwc: 'bedwars.core',
	bwcore: 'bedwars.core',
	bw_core: 'bedwars.core',
	bedwarscore: 'bedwars.core',
	bedwars_core: 'bedwars.core',
	// Bedwars 4v4
	bw44: 'bedwars.4v4',
	bw4v4: 'bedwars.4v4',
	bedwars44: 'bedwars.4v4',
	bedwars_4v4: 'bedwars.4v4',
	// Bedwars Armed
	armed: 'bedwars.armed',
	bwarmed: 'bedwars.armed',
	bw_armed: 'bedwars.armed',
	bedwarsarmed: 'bedwars.armed',
	bedwars_armed: 'bedwars.armed',
	// Bedwars Castle
	castle: 'bedwars.castle',
	bwcastle: 'bedwars.castle',
	bw_castle: 'bedwars.castle',
	bedwarscastle: 'bedwars.castle',
	bedwars_castle: 'bedwars.castle',
	// Bedwars Lucky
	bwlucky: 'bedwars.lucky',
	bw_lucky: 'bedwars.lucky',
	bedwarslucky: 'bedwars.lucky',
	bedwars_lucky: 'bedwars.lucky',
	// Bedwars Rush
	bwrush: 'bedwars.rush',
	bw_rush: 'bedwars.rush',
	bedwarsrush: 'bedwars.rush',
	bedwars_rush: 'bedwars.rush',
	// Bedwars Swap
	swap: 'bedwars.swap',
	bwswap: 'bedwars.swap',
	bw_swap: 'bedwars.swap',
	bedwarsswap: 'bedwars.swap',
	bedwars_swap: 'bedwars.swap',
	// Bedwars Ultimate
	bwultimate: 'bedwars.ultimate',
	bw_ultimate: 'bedwars.ultimate',
	bedwarsultimate: 'bedwars.ultimate',
	bedwars_ultimate: 'bedwars.ultimate',
	// Bedwars Underworld
	underworld: 'bedwars.underworld',
	bwunderworld: 'bedwars.underworld',
	bw_underworld: 'bedwars.underworld',
	bedwarsunderworld: 'bedwars.underworld',
	bedwars_underworld: 'bedwars.underworld',
	// Bedwars Voidless
	voidless: 'bedwars.voidless',
	bwvoidless: 'bedwars.voidless',
	bw_voidless: 'bedwars.voidless',
	bedwarsvoidless: 'bedwars.voidless',
	bedwars_voidless: 'bedwars.voidless',

	/* ------------------ SKYWARS ------------------ */
	// Skywars Overall
	sw: 'skywars.overall',
	skywars: 'skywars.overall',
	// Skywars Solo
	sw1: 'skywars.solo',
	skywars1: 'skywars.solo',
	skywarssolo: 'skywars.solo',
	skywars_solo: 'skywars.solo',
	// Skywars Doubles
	sw2: 'skywars.doubles',
	skywars2: 'skywars.doubles',
	skywarsdoubles: 'skywars.doubles',
	skywars_doubles: 'skywars.doubles',
	// Skywars Threes
	lab: 'skywars.lab',
	swlab: 'skywars.lab',
	skywarslab: 'skywars.lab',
	skywars_lab: 'skywars.lab',
	// Skywars Mega
	mega: 'skywars.mega',
	swmega: 'skywars.mega',
	skywarsmega: 'skywars.mega',
	skywars_mega: 'skywars.mega',

	/* ------------------ WOOL WARS ------------------ */
	ww: 'woolgames.woolwars',
	wool: 'woolgames.woolwars',
	woolwars: 'woolgames.woolwars',
	sww: 'woolgames.sheepwars',
	sheepwars: 'woolgames.sheepwars',
	sheep: 'woolgames.sheepwars',

	/* ---------------- MURDER MYSTERY ---------------- */
	mm: 'murdermystery.overall',
	murder: 'murdermystery.overall',
	mys: 'murdermystery.overall',
	mmc: 'murdermystery.classic',
	mmi: 'murdermystery.infection',
	infection: 'murdermystery.infection',
	mma: 'murdermystery.assassins',
	assassins: 'murdermystery.assassins',
	mmd: 'murdermystery.doubleUp',
	doubleup: 'murdermystery.doubleUp', //found using typechecking my beloved

	/* ---------------- ARCADE ---------------- */
	// Pixel Party
	pixelparty: 'arcade.pixelParty.overall',
	pixelpartyh: 'arcade.pixelParty.hyper',
	pixelpartyn: 'arcade.pixelParty.normal',
	//droppper
	dropper: 'arcade.dropper',

	/* ---------------- TNT GAMES ---------------- */
	tntrun: 'tntgames.tntRun',
	pvprun: 'tntgames.pvpRun',
	bowspleeftnt: 'tntgames.bowSpleef',
	bstnt: 'tntgames.bowSpleef',
	tnttag: 'tntgames.tntTag',
	ttag: 'tntgames.tntTag',
	tntt: 'tntgames.tntTag',
	wizards: 'tntgames.wizards',
	wtnt: 'tntgames.wizards',
}
