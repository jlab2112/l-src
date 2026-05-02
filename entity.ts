import { nbt as nbtTs } from '@lilithmod/unborn-mcproto'
import { FetchResultTypes, fetch } from '@sapphire/fetch'
import minecraftData from 'minecraft-data'
import type { LilithClient } from '@/client.js'
import { addAsyncListener } from '@/events.js'
import { isLobby } from '@/queuestats/queuestats.js'
import { getTeamInitial } from '@/queuestats/tabstats.js'
import type { PacketEvent } from '@/types/events.js'
import { Ids } from '@/types/packets/minecraft/ids.js'
import type { Play } from '@/types/packets/minecraft/packets.js'
import gameEmitter from './emitters/gameEmitter'
import { emojiCharacterMap } from './emoji.js'

//i have lost the will to live

const mcData = minecraftData('1.8.9')
const entityIdToPlayerUUID = new Map<number, string>()
const uuidCache = new Map<string, string>()

addAsyncListener<PacketEvent<Play.toClient.NamedEntitySpawnPacket>>(
	Ids.Play.toClient.named_entity_spawn,
	'toClient',
	'Track Player Entity IDs',
	1000,
	async ({ packet }) => {
		if (entityIdToPlayerUUID.has(packet.data.entityId)) {
			entityIdToPlayerUUID.delete(packet.data.entityId)
		}

		entityIdToPlayerUUID.set(packet.data.entityId, packet.data.playerUUID)
	},
)

enum EquipmentSlot {
	MainHand = 0,
	Boots = 1,
	Leggings = 2,
	Chestplate = 3,
	Helmet = 4,
}

const positionNames: Record<EquipmentSlot, string> = {
	0: 'held item',
	1: 'boots',
	2: 'leggings',
	3: 'chestplate',
	4: 'helmet',
}

const emojiRegex = /:[a-z_]+:/g

type NarrowedSlot = {
	blockId: number
	itemCount: number
	itemDamage: number
	nbt: nbtTs.Tag | null
}

function isNarrowedSlot(slot: any): slot is NarrowedSlot {
	return 'blockId' in slot && slot.blockId !== -1 && 'itemCount' in slot && 'itemDamage' in slot && 'nbt' in slot
}

const eventString = (player: string, body: string, emoji: string, itemName: string) => {
	return `&a&lPURCHASE &r&2» ${player} &7${body} &r&f${emoji} &a${itemName}&7!`
}

const initialToTeam = {
	'&l&cR &r&c': 'Red Team',
	'&l&9B &r&9': 'Blue Team',
	'&l&aG &r&a': 'Green Team',
	'&l&eY &r&e': 'Yellow Team',
	'&l&bA &r&b': 'Aqua Team',
	'&l&fW &r&f': 'White Team',
	'&l&dP &r&d': 'Pink Team',
	'&l&8S &r&8': 'Gray Team',
}

const eventMessages: Record<
	string,
	(
		playerName: string,
		initial: string,
		item: any,
		packet: Play.toClient.EntityEquipmentPacket['data'],
		client: LilithClient,
	) => string
> = {
	chainmail_armor: (playerName, initial) =>
		eventString(initial + playerName, 'just purchased', ':lilith_chainmail_armor_set:', 'Chainmail Armor'),
	iron_armor: (playerName, initial) =>
		eventString(initial + playerName, 'just purchased', ':lilith_iron_armor_set:', 'Iron Armor'),
	diamond_armor: (playerName, initial) =>
		eventString(initial + playerName, 'just purchased', ':lilith_diamond_armor_set:', 'Diamond Armor'),
	fireball: (playerName, initial) => eventString(initial + playerName, 'has a', ':lilith_fireball:', 'Fireball'),
	enderpearl: (playerName, initial) => eventString(initial + playerName, 'has an', ':lilith_pearl:', 'Enderpearl'),
	tnt: (playerName, initial) => eventString(initial + playerName, 'has', ':lilith_tnt:', 'TNT'),
	enchanted_bow: (playerName, initial) =>
		eventString(initial + playerName, 'has an', ':lilith_enchanted_bow:', 'Enchanted Bow'),
	bow: (playerName, initial) => eventString(initial + playerName, 'has a', ':lilith_bow:', 'Bow'),
	obsidian: (playerName, initial) => eventString(initial + playerName, 'has', ':lilith_obsidian:', 'Obsidian'),
	diamond_pickaxe: (playerName, initial) =>
		eventString(initial + playerName, 'has a', ':lilith_diamond_pickaxe:', 'Diamond Pickaxe'),
	bridge_egg: (playerName, initial) => eventString(initial + playerName, 'has a', ':lilith_egg:', 'Bridge Egg'),
	golem: (playerName, initial) => eventString(initial + playerName, 'has a', ':lilith_spawn_egg:', 'Iron Golem'),
	shears: (playerName, initial) => eventString(initial + playerName, 'just purchased', ':mc_shears:', 'Shears'),
	diamond_sword: (playerName, initial) =>
		eventString(initial + playerName, 'has a', ':lilith_diamond_sword:', 'Diamond Sword'),
	protection: (playerName, initial) =>
		eventString(initial + playerName, 'just purchased', ':lilith_iron_chestplate:', 'Reinforced Armor'),
	sharpness: (playerName, initial) =>
		eventString(initial + playerName, 'just purchased', ':lilith_iron_sword:', 'Sharpness'),
	speed_potion: (playerName, initial) =>
		eventString(initial + playerName, 'has a', ':lilith_speed_pot_1:', 'Speed Potion'),
	jump_potion: (playerName, initial) => eventString(initial + playerName, 'has a', ':lilith_jump_pot_1:', 'Jump Potion'),
	invisibility_potion: (playerName, initial) =>
		eventString(initial + playerName, 'has an', ':lilith_invis_pot_1:', 'Invisibility Potion'),
	milk: (playerName, initial) => eventString(initial + playerName, 'has', '', 'Magic Milk'),
}

const permanentUpgrades = ['chainmail_armor', 'iron_armor', 'diamond_armor', 'shears', 'sharpness', 'protection']

const teamUpgrades = ['protection', 'sharpness']

const upgradeDelayTimes = {
	default: 1000 * 60 * 2,
}

// TODO: show this in tablist also

gameEmitter.on('kill', (client: LilithClient, killer: string, victim: string) => {
	Lilith.log.debug(`${killer} killed ${victim}`)
	outerloop: for (const key of client.gameInfo.detectedPurchases.keys()) {
		Lilith.log.trace(key)
		if (key.includes(victim)) {
			for (const upgrade of permanentUpgrades) {
				if (key.endsWith(upgrade)) {
					continue outerloop
				}
			}
			client.gameInfo.detectedPurchases.delete(key)
			Lilith.log.debug(`Deleted purchase ${key}`)
		}
	}
})

gameEmitter.on('death', (client: LilithClient, victim: string) => {
	Lilith.log.debug(`${victim} died`)
	for (const key of client.gameInfo.detectedPurchases.keys()) {
		Lilith.log.trace(key)
		if (key.includes(victim)) {
			client.gameInfo.detectedPurchases.delete(key)
			Lilith.log.debug(`Deleted purchase ${key}`)
		}
	}
})

addAsyncListener<PacketEvent<Play.toClient.EntityEquipmentPacket>>(
	Ids.Play.toClient.entity_equipment,
	'toClient',
	'Track Player Entity Equipment',
	1000,
	async ({ packet, client }) => {
		// console.log('playing sound at ' + client.position.x + ' ' + client.position.y + ' ' + client.position.z)

		// await writePacket(client, 'toClient', {
		//     metadata: {
		//         name: 'named_sound_effect',
		//         id: Ids.Play.toClient.named_sound_effect,
		//         state: 'play'
		//     },
		//     data: {
		//         soundName: 'random.orb',
		//         x: client.position.x,
		//         y: client.position.y,
		//         z: client.position.z,
		//         volume: 0.2,
		//         pitch: 1
		//     }
		// })

		if (!entityIdToPlayerUUID.has(packet.data.entityId)) {
			return
		}

		const playerUUID = entityIdToPlayerUUID.get(packet.data.entityId)

		if (client.location == null || isLobby(client.location) || client.location.serverType !== 'BEDWARS') return

		let playerName =
			client.players.find((p) => p.uuid.replace(/-/g, '') === playerUUID.replace(/-/g, ''))?.name ?? playerUUID

		if (playerName.includes('-')) {
			if (uuidCache.has(playerUUID)) {
				playerName = uuidCache.get(playerUUID)
			} else {
				try {
					const fetched = await fetch<any>(
						`https://sessionserver.mojang.com/session/minecraft/profile/${playerUUID}`,
						FetchResultTypes.JSON,
					)
					playerName = fetched.name
				} catch {
					return
				}
			}
		}

		uuidCache.set(playerUUID, playerName)

		if (isNarrowedSlot(packet.data.item)) {
			if (packet.data.item.nbt != null) {
				try {
					// @ts-ignore
					packet.data.item.nbt = nbtTs.decode(packet.data.item.nbt).value
				} catch {
					packet.data.item.nbt = null
				}
			}

			const item = mcData.items[packet.data.item.blockId]

			let event: string
			if (item.name === 'chainmail_leggings' && packet.data.slot === EquipmentSlot.Leggings) {
				event = `${playerUUID}-${playerName}-chainmail_armor`
			} else if (item.name === 'iron_leggings' && packet.data.slot === EquipmentSlot.Leggings) {
				event = `${playerUUID}-${playerName}-iron_armor`
			} else if (item.name === 'diamond_leggings' && packet.data.slot === EquipmentSlot.Leggings) {
				event = `${playerUUID}-${playerName}-diamond_armor`
			} else if (item.name === 'fire_charge' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-fireball`
			} else if (item.name === 'ender_pearl' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-enderpearl`
			} else if (item.name === 'tnt' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-tnt`
			} else if (item.name === 'bow' && packet.data.slot === EquipmentSlot.MainHand) {
				if (packet.data.item.nbt != null && packet.data.item.nbt['ench'] != null) {
					event = `${playerUUID}-${playerName}-enchanted_bow`
				} else {
					event = `${playerUUID}-${playerName}-bow`
				}
			} else if (item.name === 'obsidian' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-obsidian`
			} else if (item.name === 'diamond_pickaxe' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-diamond_pickaxe`
			} else if (item.name === 'egg' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-bridge_egg`
			} else if (item.name === 'spawn_egg' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-golem`
			} else if (item.name === 'shears' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-shears`
			} else if (item.name === 'diamond_sword' && packet.data.slot === EquipmentSlot.MainHand) {
				// if (packet.data.item.nbt != null) {
				//     Lilith.msg(nbtTs.stringify(packet.data.item.nbt))
				// }
				event = 'team-diamond_sword'
			} else if (
				item.name === 'leather_chestplate' &&
				packet.data.slot === EquipmentSlot.Chestplate &&
				packet.data.item.nbt != null &&
				packet.data.item.nbt['ench']
			) {
				event = 'team-protection'
			} else if (
				item.name.endsWith('_sword') &&
				packet.data.slot === EquipmentSlot.MainHand &&
				packet.data.item.nbt != null &&
				packet.data.item.nbt['ench']
			) {
				event = 'team-sharpness'
			} else if (
				item.name === 'potion' &&
				packet.data.slot === EquipmentSlot.MainHand &&
				packet.data.item.nbt != null
			) {
				const displayName = packet.data.item.nbt['display']?.['Name']
				if (displayName != null) {
					if (displayName.includes('Speed')) {
						event = `${playerUUID}-${playerName}-speed_potion`
					} else if (displayName.includes('Jump')) {
						event = `${playerUUID}-${playerName}-jump_potion`
					} else if (displayName.includes('Invisibility')) {
						event = `${playerUUID}-${playerName}-invisibility_potion`
					}
				}
			} else if (item.name === 'milk_bucket' && packet.data.slot === EquipmentSlot.MainHand) {
				event = `${playerUUID}-${playerName}-milk`
			}
			// else if (item.name === 'wool' && packet.data.slot === EquipmentSlot.MainHand) {
			//     event = `${playerUUID}-wool`
			// }

			if (event != null) {
				let teamName = ''
				for (const team of client.scoreboardTeams.values()) {
					if (team.players.includes(playerName)) {
						teamName = team.name
						break
					}
				}
				const { initial } = getTeamInitial(teamName)

				for (const upgrade of teamUpgrades) {
					if (event.endsWith(upgrade)) {
						playerName = initialToTeam[initial]
						event = event.replace('team-', `${playerName}-`)
					}
				}

				const timestamp = performance.now()
				// return if this event has already been detected and the timestamp (if present) is in the past
				if (client.gameInfo.detectedPurchases.has(event)) {
					// if (client.gameInfo.detectedPurchases !== null) console.log(event, client.gameInfo.detectedPurchases.get(event), timestamp)
					if (
						client.gameInfo.detectedPurchases.get(event) == null ||
						client.gameInfo.detectedPurchases.get(event) > timestamp
					)
						return
				}

				for (const [key, value] of Object.entries(eventMessages)) {
					if (event.endsWith(key)) {
						// biome-ignore lint/correctness/noUnusedVariables: commented out
						const message = value(playerName, initial, item, packet.data, client).replace(
							emojiRegex,
							(match) => {
								const emoji = emojiCharacterMap.get(match)
								if (emoji != null) {
									return emoji
								}
								return match
							},
						)

						// chat(client, message) TODO: readd detected purchases with permission
						// Lilith.msg(message)

						for (const key of permanentUpgrades) {
							if (event.endsWith(key)) {
								client.gameInfo.detectedPurchases.set(event, null)
								return
							}
						}

						for (const key of Object.keys(upgradeDelayTimes)) {
							if (event.endsWith(key)) {
								client.gameInfo.detectedPurchases.set(event, timestamp + upgradeDelayTimes[key])
								return
							}
						}

						client.gameInfo.detectedPurchases.set(event, performance.now() + upgradeDelayTimes.default)

						break
					}
				}
			}
		}
	},
)

// if ('itemCount' in packet.data.item) {

//     if ('nbt' in packet.data.item) {

//         // const buffer = writeUncompressed(packet.data.item.nbt)

//         const nbt = nbtTs.decode(packet.data.item.nbt).value

//         // const stringified = nbtTs.stringify(nbt)

//         try {
//             const stringified = nbtTs.stringify(nbt)

//             console.log(`Player ${client.players.find(p => p.uuid.replace(/-/g, '') === playerUUID.replace(/-/g, ''))?.name ?? playerUUID} has ${item.displayName} as ${position} with NBT ${stringified}`)

//             // console.log(string)
//         } catch(e) {
//             // console.log('Error parsing NBT', e)
//         }

//         // const stringified = JSON.stringify(nbt)

//     }
