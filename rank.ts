import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import { getCachedInfo } from '@/licensing.js'
import { ranks } from '@/ranks/ranksData.js'
import store, { updateStore } from '@/store.js'
import { chat, chatJson, chatPurchase } from '@/utils/chat.js'
import { completions } from '@/utils/completions.js'
import { permission } from '@/utils/permissions.js'
import lilithWebsocket from '@/websocket/socket.js'

/**
 * Filename: rank.mdx
 * Command: lrank
 * Byline: Configure your custom Lilith rank.
 * Usage: `/lrank <toggle|set|color> [arg]`
 * Added: Version 1.0.11
 *
 * Description:
 * <Info>
 * This feature is only available with [Lilith Ultimate](https://lilith.rip/#pricing).
 * </Info>
 * This command sets the color or the name of your custom rank and toggles your custom rank.
 *
 * Default Hypixel ranks and slurs are blacklisted, and all rank changes are logged for moderation purposes.
 */

const colorMap = {
	black: '0',
	dark_blue: '1',
	green: '2',
	cyan: '3',
	dark_red: '4',
	purple: '5',
	gold: '6',
	gray: '7',
	dark_gray: '8',
	blue: '9',
	lime: 'a',
	aqua: 'b',
	red: 'c',
	pink: 'd',
	yellow: 'e',
	white: 'f',
}

const blacklistedTags = [
	'VIP',
	'VIP+',
	'MVP',
	'MVP+',
	'MVP++',
	'GM',
	'MOD',
	'HELPER',
	'DEV',
	'ADMIN',
	'OWNER',
	'YOUTUBE',
	'HYPIXEL',
	'DEVELOPER',
]
const blacklistedWords = ['nigga', 'tranny', 'beaner', 'autist', 'retard', 'nigger']

const prefixRegex = /^[a-zA-Z0-9]{2,10}$/

registerCommand('lrank', [], {
	execute: async (client, _raw, parsed) => {
		if (!permission('lilith.ranks.possess')) {
			chatPurchase(client, 'Custom Rank', 'lilith.sub.t2')
			return
		}

		const args = new lexure.Args(parsed)
		const option = args.single()
		const userRank = ranks[getCachedInfo().id]

		switch (option) {
			case 'toggle': {
				if (userRank == null || userRank.prefix === '') {
					chat(client, '&cLilith &8> &7Please set a custom rank first with &c/lrank set [prefix]&7!')
					return
				}
				if (!userRank.permission) {
					chat(client, '&cLilith &8> &7Your rank has been disabled by staff!')
					return
				}
				const update = {
					rankAccounts: {},
				}
				update.rankAccounts[client.uuidShort] = !(store().rankAccounts[client.uuidShort] ?? false)
				await updateStore(update)
				lilithWebsocket.send<'rankAccount'>('rankAccount', {
					uuid: client.uuidShort,
					username: client.username,
					toggled: store().rankAccounts[client.uuidShort],
				})
				chat(
					client,
					`&cLilith &8> &7Your custom rank is now &c${store().rankAccounts[client.uuidShort] ? 'enabled' : 'disabled'}&7 on this account`,
				)
				break
			}
			case 'name':
			case 'set': {
				const rank = args.single()
				if (rank == null) {
					chat(client, '&cLilith &8> &7Please specify a new rank tag!')
					return
				}

				// Determine if a rank with the specified tag exists
				const rankExists = Object.values(ranks).some((r) => r.prefix?.toLowerCase() === rank.toLowerCase())

				if (rankExists) {
					chat(client, '&cLilith &8> &7Someone else already has that rank!')
					return
				}

				if (blacklistedTags.includes(rank.toUpperCase())) {
					chat(client, '&cLilith &8> &7That rank is blacklisted!')
					return
				}

				for (const word of blacklistedWords) {
					if (rank.toLowerCase().includes(word)) {
						chat(client, '&cLilith &8> &7That rank is blacklisted!')
						return
					}
				}

				if (!prefixRegex.test(rank)) {
					chat(client, '&cLilith &8> &7That rank is invalid! Ranks must be alphanumeric and 2-10 characters.')
					return
				}

				Lilith.log.debug(ranks[getCachedInfo().id])
				const hasPrefixAlready = ranks[getCachedInfo().id] == null || ranks[getCachedInfo().id].prefix === ''

				if (hasPrefixAlready) {
					Lilith.log.info('Updating prefix')
					const update = {
						rankAccounts: {},
					}
					update.rankAccounts[client.uuidShort] = true
					await updateStore(update)
				}

				// Send a rank change update packet to websocket
				lilithWebsocket.send<'rankChange'>('rankChange', {
					rank,
				})

				// Tell the client that the rank change was successful
				chat(client, `&cLilith &8> &7Your custom rank has been changed to "&${userRank.color}${rank}&7"!`)
				break
			}
			case 'color': {
				const color = args.single()

				if (color == null) {
					chat(
						client,
						`&cLilith &8> &7Please specify a new color! Possible colors are &c${Object.keys(colorMap)
							.map((name) => `&${colorMap[name]}${name}&7`)
							.join('&7, &c')}`,
					)
					return
				}

				if (colorMap[color] == null) {
					chat(
						client,
						`&cLilith &8> &7Invalid color! Possible colors are &c${Object.keys(colorMap)
							.map((name) => `&${colorMap[name]}${name}&7`)
							.join(', ')}`,
					)
					return
				}

				lilithWebsocket.send<'rankChange'>('rankChange', {
					color: colorMap[color],
				})

				if (userRank.prefix === '') {
					chat(
						client,
						`&cLilith &8> &7Your custom rank color has been changed to "&${colorMap[color]}${color}&7"!`,
					)
					return
				}

				chat(
					client,
					`&cLilith &8> &7Your custom rank has been changed to "&${colorMap[color]}${userRank.prefix}&7"!`,
				)
				break
			}
			default:
				//TODO:fix that
				chatJson(client, {
					color: 'red',
					text: 'Lilith ',
					extra: [
						{
							color: 'dark_gray',
							text: '> ',
						},
						{
							color: 'gray',
							text: 'Please use either ',
						},
						{
							color: 'red',
							text: 'set',
						},
						{
							color: 'gray',
							text: ', ',
						},
						{
							color: 'red',
							text: 'color',
						},
						{
							color: 'gray',
							text: ', or ',
						},
						{
							color: 'red',
							text: 'toggle',
						},
						{
							color: 'gray',
							text: '. For more information, see ',
						},
						{
							color: 'red',
							clickEvent: {
								action: 'open_url',
								value: 'https://docs.lilith.rip/features/customranks',
							},
							hoverEvent: {
								action: 'show_text',
								value: 'https://docs.lilith.rip/features/customranks',
							},
							text: 'the documentation',
						},
					],
				})
			// console.log(JSON.stringify(
			//     MessageBuilder.fromString(`&cLilith &8> &7Please use either &cset&7, &ccolor&7, or &ctoggle&7. For more information, see &chttps://docs.lilith.rip/lilith/features/custom-ranks`)
			//         .toJSON()
			//     , null, 2))
			// chat(client, `&cLilith &8> &7Please use either &cset&7, &ccolor&7, or &ctoggle&7. For more information, see &chttps://docs.lilith.rip/lilith/features/custom-ranks`)
		}
	},
	completion: (client, input) => {
		const argsCount = (input.match(/ /g) || []).length
		switch (argsCount) {
			case 1:
				return completions(['toggle', 'set', 'color'])(client, input)
			case 2:
				if (input.includes('color')) return completions(Object.keys(colorMap))(client, input)
				return []
			default:
				return []
		}
	},
})
