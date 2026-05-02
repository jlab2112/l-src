import type { LilithClient } from '@/client'
import config from '@/config'
import { Ids } from '@/types/packets/minecraft/ids'
import { type Play, writePacket } from '@/types/packets/minecraft/packets'
import { permission } from '@/utils/permissions'

export async function lunarBypasses(client: LilithClient) {
	const xrayEnabled = config().general.bypass.lunar.cheats && permission('lilith.bypass.lunar.xray')
	const hitRegEnabled = config().general.bypass.lunar.hitreg && permission('lilith.bypass.lunar.hitreg')
	if (xrayEnabled || hitRegEnabled) {
		const data = {
			'@type': 'type.googleapis.com/lunarclient.apollo.configurable.v1.OverrideConfigurableSettingsMessage',
			configurable_settings: [],
		}
		if (hitRegEnabled) {
			data.configurable_settings.push({
				apollo_module: 'combat',
				enable: true,
				properties: {
					'disable-miss-penalty': true,
				},
			})
		}

		if (xrayEnabled) {
			data.configurable_settings.push({
				apollo_module: 'staff_mod',
				enable: true,
			})
		}

		const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8')
		await writePacket<Play.toClient.CustomPayloadPacket>(client, 'toClient', {
			metadata: {
				name: 'custom_payload',
				state: 'play',
				id: Ids.Play.toClient.custom_payload,
			},
			data: {
				channel: 'apollo:json',
				data: dataBuffer,
			},
		})
		if (xrayEnabled) {
			const xrayData = {
				'@type': 'type.googleapis.com/lunarclient.apollo.staffmod.v1.EnableStaffModsMessage',
				staff_mods: [1],
			}

			const xrayDataBuffer = Buffer.from(JSON.stringify(xrayData), 'utf8')

			await writePacket<Play.toClient.CustomPayloadPacket>(client, 'toClient', {
				metadata: {
					name: 'custom_payload',
					state: 'play',
					id: Ids.Play.toClient.custom_payload,
				},
				data: {
					channel: 'apollo:json',
					data: xrayDataBuffer,
				},
			})
		}
	}
}
