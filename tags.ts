import { registerCommand } from '@/commands/handler'
import { chat, chatJson, chatPurchase } from '@/utils/chat'
import { permission } from '@/utils/permissions'
import resolveUsername from '@/utils/resolveUsername'
import lilithWebsocket from '@/websocket/socket'
import Subcommand from '../../utils/subcommands'

/**
 * Filename: tags.mdx
 * Command: ltag
 * Byline: Add tags to players.
 * Usage: `/ltag <set|remove|join|invite> [args]`
 * Added: Version 1.0.11
 *
 * Description:
 * <Info>
 * This feature is only available with [Lilith Pro](https://lilith.rip/#pricing) or higher.
 * </Info>
 * ### Manage tags
 * `/ltag set [ign/uuid] [tag]`
 * The tag argument accepts formatting codes using the prefix `&`. For a complete list of formatting codes, refer to [this list](https://minecraft.wiki/w/Formatting_codes).
 * To remove a tag just use `/ltag remove [ign/uuid]`

 * ### Shared Tags
 * To share your tag list you need its invite code. To get it use the `/ltag invite`.
 * Default Hypixel ranks and slurs are blacklisted, and all rank changes are logged for moderation purposes.

 * ![](/images/tags-invite.png)

 * To join a tag list you need its id.
 * After that, run `/ltag join [id]`
 *
 * Changelog - Version 2.0.0:
 * Added shared tag lists.
 * Changelog - Version 1.0.21:
 * Tags hotfix
 * Changelog - Versions 1.0.19 and 1.0.20:
 * Optimize building username cache for tags
 * Fix tags for expired gamepass accounts
 */

registerCommand('ltag', [], {
	execute: async (client, _raw, parsed) => {
		const cmd = new Subcommand({
			usage: () =>
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
							text: 'remove',
						},
						{
							color: 'gray',
							text: ', ',
						},
						{
							color: 'red',
							text: 'join',
						},
						{
							color: 'red',
							text: 'invite',
						},
						{
							color: 'gray',
							text: ', or ',
						},
						{
							color: 'gray',
							text: '. For more information, see ',
						},
						{
							color: 'red',
							clickEvent: {
								action: 'open_url',
								value: 'https://docs.lilith.rip/features/tags',
							},
							hoverEvent: {
								action: 'show_text',
								value: 'https://docs.lilith.rip/features/tags',
							},
							text: 'the documentation',
						},
					],
				}),
			permission: {
				has: permission('lilith.tags.personal'),
				error: () => {
					chatPurchase(client, 'Tags', 'lilith.sub.t1')
				},
			},
		})

		cmd.register('set').action(async (args: string[]) => {
			const player = args[0]
			const tag = args[1]

			if (player == null || !player.match(/^[a-zA-Z0-9_]{2,16}$/))
				return chat(
					client,
					'&cLilith &8>&7 Please specify a target user and tag with &c/ltag set &l<username> <new_tag>&r &o[extra]',
				)
			if (tag == null)
				return chat(
					client,
					'&cLilith &8>&7 Please specify a tag with &c/ltag set <username> &l<new_tag>&r &o[extra]',
				)

			const mojangReq = await resolveUsername(client, player)
			if (mojangReq === null) return
			const { id, name } = mojangReq

			const extra = args.slice(2).join(' ').trim()

			client.tags[id] = { value: tag, extra }
			chat(client, `&cLilith &8> &7Set tag for &c${name}&7 to &c${tag}&7.`)

			lilithWebsocket.send<'updateTags'>('updateTags', { uuid: id, value: args[1], extra })
		})

		cmd.register('remove').action(async (args: string[]) => {
			const player = args[0]

			if (player == null || !player.match(/^[a-zA-Z0-9_]{2,16}$/))
				return chat(client, '&cLilith &8>&7 Please specify a valid username with &c/ltag remove &l<username>')

			const mojangReq = await resolveUsername(client, player)
			if (mojangReq === null) return
			const { id, name } = mojangReq

			client.tags[id] = undefined
			chat(client, `&cLilith &8> &7Removed tag for &c${name}`)

			lilithWebsocket.send<'updateTags'>('updateTags', { uuid: id, value: '', extra: '' })
		})

		cmd.register('join').action((args) => {
			const id = args[0]
			if (typeof id !== 'string')
				return chat(client, '&cLilith &8>&7 Please specify a target list with &c/ltag join &l<id>')

			lilithWebsocket.send<'subscribeTags'>('subscribeTags', id)
			chat(client, `&cLilith &8> &Join tag list with id: &c${id}.`)
		})

		cmd.register('invite').action(() => {
			chat(client, '&cLilith &8> &7Share your tag list with your friends!')
			chatJson(client, [
				'',
				{ text: 'Lilith ', color: 'red' },
				{ text: '> ', color: 'dark_gray' },
				{
					text: 'Click here to display the code in chat',
					clickEvent: {
						action: 'suggest_command',
						value: `${client.tagID}`,
					},
					hoverEvent: {
						action: 'show_text',
						value: 'Display invite.',
					},
					color: 'red',
					underlined: true,
				},
				{
					text: '.',
					color: 'gray',
				},
			])
		})

		cmd.run(parsed)
	},
})
