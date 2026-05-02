import { MessageBuilder } from 'prismarine-chat'
import type { LilithClient } from '@/client'
import config from '@/config'
import { VERSION } from '@/constants'
import { getCachedInfo } from '@/licensing'
import { permission } from '@/utils/permissions'

let venxmtagsMap: null | Map<string, string> = null

export type tagObject = {
	formatted: string
	extra: { text: undefined | string }
}
export async function getTags(client: LilithClient, uuid: string, thirdParty = true): Promise<tagObject> {
	const perm_providers = permission('lilith.tags.providers')
	const perm_personal = permission('lilith.tags.personal')

	if (!perm_providers && !perm_personal) return { formatted: '', extra: { text: null } }
	try {
		const configuration = config().tags
		if (!configuration.enabled) return { formatted: '', extra: { text: null } }

		const tagObj = client.tags[uuid]
		const hasTag = tagObj && tagObj.value !== ''
		if ((!hasTag || !tagObj) && thirdParty && perm_providers) {
			return getThirdPartyTags(configuration.providers.priority, uuid, configuration)
		}

		if (perm_personal && hasTag) {
			return {
				formatted: ` &r&7(&f${tagObj.value}&r&7)&r`,
				extra: tagObj.extra
					? (MessageBuilder.fromString(tagObj.extra).toJSON() as {
							text: string
						})
					: { text: undefined },
			}
		}

		return { formatted: '', extra: { text: null } }
	} catch (e) {
		Lilith.log.info(e, uuid)
		return { formatted: '', extra: { text: null } }
	}
}

async function getThirdPartyTags(
	provider: 'urchin' | 'seraph' | 'duelsplus',
	uuid: string,
	configuration: { enabled?: boolean; sharing?: boolean; providers: any },
): Promise<tagObject> {
	switch (provider) {
		case 'seraph': {
			if (configuration.providers.seraph.enabled && configuration.providers.seraph.key !== '') {
				const seraphTag = await getSeraphTag(uuid, configuration.providers.seraph.key)
				if (seraphTag.formatted === '' && configuration.providers.urchin.enabled) {
					return await getUrchinTags(uuid)
				}
				return seraphTag
			}
			if (configuration.providers.urchin.enabled) return await getUrchinTags(uuid)
			return { formatted: '', extra: { text: null } }
		}
		case 'urchin': {
			if (configuration.providers.urchin.enabled) {
				const urchinTag = await getUrchinTags(uuid)
				if (urchinTag.formatted === '' && configuration.providers.seraph.enabled) {
					return await getSeraphTag(uuid, configuration.providers.seraph.key)
				}
				return urchinTag
			}
			if (configuration.providers.seraph.enabled) return await getSeraphTag(uuid, configuration.providers.seraph.key)
			return { formatted: '', extra: { text: null } }
		}
		case 'duelsplus': {
			if (configuration.providers.duelsplus.enabled) {
				const venxmTag = await getVenxmTags(uuid)
				if (venxmTag.formatted === '' && configuration.providers.urchin.enabled) {
					return await getUrchinTags(uuid)
				}
				return venxmTag
			}
			if (configuration.providers.urchin.enabled) return await getUrchinTags(uuid)
			return { formatted: '', extra: { text: null } }
		}
	}
}

async function getUrchinTags(uuid: string): Promise<tagObject> {
	const request = await (
		await fetch(`https://urchin.ws/player/${uuid}?sources=ME&key=${config().tags.providers.urchin.key}`, {
			headers: {
				'User-Agent': `Lilith Client v${VERSION} ${getCachedInfo().id}`,
			},
		})
	).text()
	if (request === '"Invalid Key"') return { formatted: '', extra: { text: null } }
	const urchinPlayer: UrchinPlayer = JSON.parse(request)
	if (urchinPlayer.uuid === '' || urchinPlayer.tags.length === 0 || urchinPlayer.tags.length > 2)
		/* uuid==="" => player not found, invalid uuid || tags.length === 0 => no tags || > 2 means the player is a urchin staff */
		return { formatted: '', extra: { text: null } }

	const tag = urchinPlayer.tags.find((tag) => tag.type !== 'account') ?? urchinPlayer.tags[0]
	const extra = urchinPlayer.tags.find((tag) => tag.type === 'account') ?? urchinPlayer.tags[0]

	const tagObject = {
		tag: readableTag[tag.type] ?? 'info',
		reason: `&n${readableTag[tag.type]}:&r ${tag.reason}`,
		extra: tag.reason === extra.reason || extra.reason === '' ? '' : `\n&r&n&6ACCOUNT:&r ${extra}`,
	}

	return {
		formatted: ` &r&7(&f${tagObject.tag}&r&7)&r`,
		extra: MessageBuilder.fromString(`${tagObject.reason}${tagObject.extra}`).toJSON() as { text: string },
	}
}

async function getVenxmTags(uuid: string): Promise<tagObject> {
	if (venxmtagsMap === null) {
		const venxm: {
			reportedId: string
			reason: 'bot' | 'closet' | 'blatant'
		}[] = await (await fetch('https://api.venxm.uk/static/cheaters')).json()
		venxmtagsMap = new Map(venxm.map((data) => [data.reportedId, data.reason]))
	}
	if (venxmtagsMap.has(uuid)) {
		return {
			formatted: ` &r&7(&f${readableTag[venxmtagsMap.get(uuid)]}&r&7)&r`,
			extra: { text: null },
		}
	} else return { formatted: '', extra: { text: null } }
}

async function getSeraphTag(uuid: string, key: string): Promise<tagObject> {
	const headers = {
		'User-Agent': `Lilith Client v${VERSION} ${getCachedInfo().id}`,
		'seraph-api-key': key,
		Accept: 'application/json',
	}

	const seraphPlayer = (await (await fetch(`https://api.seraph.si/${uuid}/blacklist`, { headers })).json()) as SeraphPlayer

	if (!seraphPlayer.success) return { formatted: '', extra: { text: null } }
	if (!seraphPlayer.data.blacklist.tagged) return { formatted: '', extra: { text: null } }
	const tagObject = {
		tag: readableSeraphTag[seraphPlayer.data.blacklist.report_type] ?? 'info',
		reason: `&n${readableSeraphTag[seraphPlayer.data.blacklist.report_type]}:&r ${seraphPlayer.data.blacklist.tooltip}`,
		extra: seraphPlayer.data.blacklist.verified ? '\n&r&aVerified report!' : '',
	}

	return {
		formatted: ` &r&7(&f${tagObject.tag}&r&7)&r`,
		extra: MessageBuilder.fromString(`${tagObject.reason}${tagObject.extra}`).toJSON() as { text: string },
	}
}

type UrchinPlayer = {
	uuid: string
	tags: {
		type:
			| 'confirmed_cheater'
			| 'info'
			| 'closet_cheater'
			| 'blatant_cheater'
			| 'sniper'
			| 'legit_sniper'
			| 'possible_sniper'
			| 'account'
			| 'caution'
		reason: string
	}[]
}

type SeraphPlayer = {
	code: number
	data: {
		annoylist:
			| {
					tagged: true
					tooltip: string
			  }
			| { tagged: false }
		blacklist:
			| {
					reason: string
					report_type: string
					tagged: true
					timestamp: number
					tooltip: string
					verified: boolean
			  }
			| { tagged: false }
		bot:
			| {
					kay: boolean
					tagged: true
					unidentified: boolean
			  }
			| { tagged: false }
		customTag: string
		key_type: string
		member:
			| {
					tagged: true
					tooltip: string
			  }
			| { tagged: false }
		name_change:
			| {
					changed: boolean
					last_change: number
					tagged: true
					tooltip: string
			  }
			| { tagged: false }
		safelist: {
			AddedBy: string
			added_by: string
			discord_linked: string
			personal: boolean
			security_level: number
			tagged: boolean
			time_added: number
			time_updated: number
			timesKilled: number
			tooltip: string
		}
		statistics: {
			encounters?: number
			threat_level?: number
		}
		username: string
		uuid: string
	}
	msTime: number
	success: boolean
}

const readableTag = {
	confirmed_cheater: '&5CHEATER',
	info: '&fINFO',
	closet_cheater: '&6CLOSET',
	blatant_cheater: '&6BLATANT',
	sniper: '&4SNIPER',
	legit_sniper: '&4SNIPER',
	possible_sniper: '&4SNIPER',
	account: '&6ACCOUNT',
	caution: '&6CAUTION',
	closet: '&6CLOSET',
	blatant: '&6BLATANT',
	bot: '&8BOT',
}

const readableSeraphTag = {
	Annoying: '&6ANNOYING',
	'Alternative Account': '&dALT ACCOUNT',
	Bot: '&8BOT',
	'Closet Cheater': '&cCLOSET',
	'Blatant Cheater': '&4BLATANT',
	'Blatant Cheating': '&4BLATANT',
	Sniper: '&4SNIPER',
	'Legit Sniper': '&cSNIPER',
	'Sniping Potential': '&eSNIPER?',
	Caution: '&eCAUTION',
	annoy_list: '&6ANNOYING',
	alt: '&dALT ACCOUNT',
	bot: '&8BOT',
	cheating_closet: '&cCLOSET',
	cheating_blatant: '&4BLATANT',
	sniping: '&4SNIPER',
	sniping_legit: '&cSNIPER',
	sniping_potential: '&eSNIPER?',
	caution: '&eCAUTION',
	'Closet Cheating': '&cCLOSET',
}
