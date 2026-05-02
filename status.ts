import * as lexure from 'lexure'
import { registerCommand } from '@/commands/handler'
import { fetchStats } from '@/stats/fetchStats'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import tagCalc from '@/utils/calctag.js'
import { chat } from '@/utils/chat.js'
import { playerCompletions } from '@/utils/completions.js'

/**
 * Filename: status.mdx
 * Command: status
 * Byline: Check any player's status.
 * Usage: `/status [player]`
 * Added: 0.6.0-alpha.1:
 *
 * Description:
 * This command will fetch the status of the player. It will also show its location and map if the payer is online.
 *
 * This feature requires a valid [API Key](/guides/setup/apikey)
 *
 * Changelog - Version 2.0.0:
 * Now using API Key-less when allowed.
 */
registerCommand('status', [], {
	execute: async (client, raw, parsed) => {
		const lowercase = raw.toLowerCase()
		if (
			lowercase.startsWith('/status') &&
			(lowercase.endsWith('online') ||
				lowercase.endsWith('away') ||
				lowercase.endsWith('busy') ||
				lowercase.endsWith('offline'))
		) {
			writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
				metadata: {
					name: 'chat',
					state: 'play',
					id: Ids.Play.toServer.chat,
				},
				data: {
					message: raw,
				},
			})
			return
		}
		const args = new lexure.Args(parsed)
		let target = args.single()
		if (target == null) target = client.uuid
		target = target.replaceAll('-', '')
		try {
			const statusResponse = await fetchStats(target, 'commands.status', client, 'status')
			if (!statusResponse) {
				return chat(client, `&cLilith &8> &7Something went wrong while checking the status of ${target}`)
			}
			const rawPlayer = await fetchStats(statusResponse.uuid, 'commands.status', client, 'player')
			if (rawPlayer == null) {
				return chat(
					client,
					`&cLilith &8> &7Something went wrong while checking the API of ${target}: No player data found`,
				)
			}
			const tag =
				tagCalc.getString(tagCalc.calcTag(rawPlayer)) === '&7'
					? tagCalc.getString(tagCalc.calcTag(rawPlayer))
					: `${tagCalc.getString(tagCalc.calcTag(rawPlayer))} `
			const display = `&7Game: &f${statusResponse.session.gameType} &7Mode: &f${statusResponse.session.mode} ${statusResponse.session.map == null ? '' : `&7Map: &f${statusResponse.session.map}`}`
			return chat(
				client,
				`${statusResponse.session.online ? '&a' : '&c'}• ${tag}${rawPlayer.displayname} ${statusResponse.session.online ? display : ''}`,
			)
		} catch {
			chat(client, `&cLilith &8> &7Couldn't fetch the status of &c${target}&7!`)
		}
	},
	completion: playerCompletions,
})
