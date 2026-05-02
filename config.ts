import defaultConfig, { type LilithConfig } from '@lilithmod/config'
import sfetch from 'sync-fetch'
import { hwid } from '@/hwid.js'
import log, { lc } from '@/log.js'
import type { Update } from '@/types/updatePath.js'
import { clearLine } from '@/utils/clearline.js'
import { fetchLilithJson, patchLilithJson } from '@/utils/fetchJson.js'
import mergeObjects, { applyUpdates } from '@/utils/merge.js'
import type { LilithClient } from './client'
import { API_URL } from './constants'
import { checkKey } from './utils/checkkey'
import getUserGiftedRanks from './utils/getUserGiftedRanks'

let configObj: LilithConfig

//migrate to promise
export function fetchConfig() {
	if (process.argv.includes('--launcher-cursor-control')) {
		Lilith.msg(`${lc.yellow('Config')} ${lc.black('»')} ${lc.default('Fetching...')}`)
	} else {
		process.stdout.write(`${lc.yellow('Config')} ${lc.black('»')} ${lc.default('Fetching...')}`)
	}
	const response = sfetch(`${API_URL}/config`, { headers: { hwid } }).json()
	if (typeof response.error === 'string') {
		Lilith.msg('WARNING: COULD NOT FETCH CONFIG, REVERTING TO DEFAULT')
	}
	configObj = mergeObjects(defaultConfig, response)
	if (Lilith.app.devMode) {
		clearLine(
			`${lc.yellow('Config')} ${lc.black('»')} ${lc.default(`Fetched! Change at ${lc.aqua.underline('https://me.dev.lilith.rip')}.`)}`,
		)
		log.raw(
			`${lc.yellow('Config')} ${lc.black('»')} ${lc.default(`Fetched! Change at ${lc.aqua.underline('https://me.dev.lilith.rip')}.`)}`,
			'CONFIG',
			true,
		)
	} else {
		clearLine(
			`${lc.yellow('Config')} ${lc.black('»')} ${lc.default(`Fetched! Change at ${lc.aqua.underline('https://me.lilith.rip')}.`)}`,
		)
		log.raw(
			`${lc.yellow('Config')} ${lc.black('»')} ${lc.default(`Fetched! Change at ${lc.aqua.underline('https://me.lilith.rip')}.`)}`,
			'CONFIG',
			true,
		)
	}
}

export async function fetchConfigAsync() {
	// process.stdout.write(`${lc.yellow('Config')} ${chalk.gray('||')} ${chalk.white('Reloading...')}`)
	const response = await fetchLilithJson<any>('/config', { headers: { hwid } })
	if (typeof response.error === 'string') {
		Lilith.msg('WARNING: COULD NOT FETCH CONFIG, REVERTING TO DEFAULT')
	}
	configObj = mergeObjects(defaultConfig, response)
	// process.stdout.cursorTo(0)
	log.raw(`${lc.yellow('Config')} ${lc.black('»')} ${lc.default('Reloaded')}`, 'CONFIG')
}

export async function patchConfig(body: any) {
	configObj = mergeObjects(configObj, body)
	const json = await patchLilithJson<any>('/config', flatten(body), { headers: { hwid } })
	Lilith.log.g('patch_config').debug(json)
	if (!json.success) log.raw(`${lc.yellow('Config')} ${lc.black('»')} ${lc.gray('Error while patching!')}`, 'CONFIG')
}

export function applyConfigUpdates(updates: Update<LilithConfig>, client: LilithClient) {
	Lilith.log.success('Config update', updates)
	if (updates['general.apiKey']) {
		checkKey(client, updates['general.apiKey'], updates['general.useApiKeyLess'])
		applyUpdates(configObj, updates)
	}
	if (updates['general.useApiKeyLess'] && client.rank === 'unknown') getUserGiftedRanks(client)
	else applyUpdates(configObj, updates)
}

// nested difference between two objects

function flatten(ob: any, prefix: any = false, result = null) {
	result = result || {}

	// Preserve empty objects and arrays, they are lost otherwise
	if (prefix && typeof ob === 'object' && ob !== null && Object.keys(ob).length === 0) {
		result[prefix] = Array.isArray(ob) ? [] : {}
		return result
	}

	prefix = prefix ? `${prefix}.` : ''

	for (const i in ob) {
		// biome-ignore lint/suspicious/noPrototypeBuiltins: cannot use hasOwn because not supported (i think)
		if (Object.prototype.hasOwnProperty.call(ob, i)) {
			if (typeof ob[i] === 'object' && ob[i] !== null) {
				// Recursion on deeper objects
				flatten(ob[i], prefix + i, result)
			} else {
				result[prefix + i] = ob[i]
			}
		}
	}
	return result
}

export default () => configObj
