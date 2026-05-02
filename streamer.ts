import * as lexure from 'lexure'
import { ChatMessage, MessageBuilder } from 'prismarine-chat'
import { registerCommand } from '@/commands/handler'
import store, { updateStore } from '@/store.js'
import { chat, chatPurchase, chatStringAndLink } from '@/utils/chat.js'
import { permission } from '@/utils/permissions.js'

/**
 * Filename: streamer.mdx
 * Command: streamer
 * Byline: Hide aspects of your game from view.
 * Usage: `/streamer [toggle]` | `/streamer <server|date>` | `/streamer ip [text]`
 * Aliases: lstreamer
 * Added: Before Full Release
 *
 * Description:
 * <Info>
 * This feature is only available with [Lilith Pro](https://lilith.rip/#pricing) or higher.
 * </Info>
 * This command allows you to toggle streamer related features within Lilith. Doing `/streamer` or `/streamer toggle` will toggle streamer mode.
 * Streamer mode is designed to hide your Lilith usage from your screen. For more, see the [Streamer Mode](/features/streamermode) feature page.
 *
 * Alternatively, if you'd like to hide aspects of your gameplay, you can use `/streamer date` or `/streamer server` to hide the date or server you are playing on in the scoreboard.
 * You can also replace the server name with a custom IP address using `/streamer ip [text]`. (This must be toggled on by running `/streamer ip`.)
 *
 * Changelog - Version 1.1.0:
 * Added server, date, and ip hiding.
 */

registerCommand('streamer', ['lstreamer'], {
	execute: async (client, _raw, parsed) => {
		const args = new lexure.Args(parsed)
		const option = args.single()
		if (option == null || option === 'toggle') {
			if (!permission('lilith.streamer')) {
				chatPurchase(client, 'Streamer Mode', 'lilith.sub.t2')
				return
			}
			chat(
				client,
				`&cLilith &8> &7Streamer mode is now &c${!store().streamerMode ? 'enabled' : 'disabled'}&7. All further chat messages from Lilith will appear in &c${!store().streamerMode ? 'console' : 'chat'}&7.`,
			)
			updateStore({
				streamerMode: !store().streamerMode,
			}).then(() => {
				if (store().streamerMode) {
					Lilith.msg(
						new ChatMessage(
							MessageBuilder.fromString(
								'&cLilith &8> &7Streamer mode is now &cenabled&7. All further chat messages from Lilith will appear &chere&7.',
							),
						).toAnsi(),
					)
				} else {
					chat(
						client,
						'&cLilith &8> &7Streamer mode has been &cdisabled&7. Chat messages will now appear in-game.',
					)
				}
			})
			return
		}
		if (option === 'date') {
			if (!permission('lilith.streamer.hide_date')) {
				chat(client, `&cLilith &8> &7You don't have access to hiding the scoreboard's date!`)
				chatStringAndLink(
					client,
					'&cLilith &8> &7You can get access to this and other features by subscribing on  ',
					'Patreon',
					'https://patreon.com/lilithmod',
				)
				return
			}
			updateStore({
				streamerModeScoreboard: {
					hideDate: !store().streamerModeScoreboard.hideDate,
				},
			}).then(() => {
				chat(
					client,
					`&cLilith &8> &7The date in the scoreboard is now &c${store().streamerModeScoreboard.hideDate ? 'hidden' : 'visible'}&7.`,
				)
			})
			return
		}
		if (option === 'server') {
			if (!permission('lilith.streamer.hide_server')) {
				chat(client, `&cLilith &8> &7You don't have access to hiding the scoreboard's server number!`)
				chatStringAndLink(
					client,
					'&cLilith &8> &7You can get access to this and other features by subscribing on  ',
					'Patreon',
					'https://patreon.com/lilithmod',
				)
				return
			}
			updateStore({
				streamerModeScoreboard: {
					hideServer: !store().streamerModeScoreboard.hideServer,
				},
			}).then(() => {
				chat(
					client,
					`&cLilith &8> &7The server number in the scoreboard is now &c${store().streamerModeScoreboard.hideServer ? 'hidden' : 'visible'}&7.`,
				)
			})
			return
		}
		const target = args.single()
		if (option === 'ip') {
			if (!permission('lilith.streamer.replace_ip')) {
				chat(client, `&cLilith &8> &7You don't have access to replacing the scoreboard's IP!`)
				chatStringAndLink(
					client,
					'&cLilith &8> &7You can get access to this and other features by subscribing on  ',
					'Patreon',
					'https://patreon.com/lilithmod',
				)
				return
			}

			if (target == null) {
				updateStore({
					streamerModeScoreboard: {
						customText: {
							enabled: !store().streamerModeScoreboard.customText.enabled,
						},
					},
				}).then(() => {
					chat(
						client,
						`&cLilith &8> &7The IP in the scoreboard is now &c${store().streamerModeScoreboard.customText.enabled ? 'replaced' : 'visible'}&7.`,
					)
				})
			} else {
				updateStore({
					streamerModeScoreboard: {
						customText: {
							prefix: target.slice(0, 16).replace(/&/g, '§'),
							suffix: target.slice(16, 32).replace(/&/g, '§'),
						},
					},
				}).then(() => {
					chat(client, `&cLilith &8> &7Replaced the IP in the scoreboard with ${target.slice(0, 32)}`)
				})
			}
			return
		}

		chat(client, "&cLilith &8> &7That argument doesn't exist! Use &ctoggle&7, &cdate&7, &cserver&7, or &cip&7.")
	},
})
