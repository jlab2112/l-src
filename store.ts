import * as fs from 'node:fs'
import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import path from 'node:path'
import { lilithFolder } from '@/constants.js'
import type { LilithVersionManifest } from '@/licensing.js'
import log, { lc } from '@/log.js'
import { fetchLilithJson } from '@/utils/fetchJson.js'
import mergeObjects from '@/utils/merge.js'
import chalk from 'chalk'

const launcherFolder = path.join(os.homedir(), 'lilith', 'bin')
//process.platform == 'darwin' ?
// 	path.join(os.homedir(), 'Library', 'Application Support', 'lilith', 'bin') :
const launcherFolder2 = path.join(os.homedir(), 'LilithLauncher')
;(async () => {
	const lilithFolderExists = await fsp
		.stat(lilithFolder)
		.then(() => true)
		.catch(() => false)
	if (lilithFolderExists) {
		const files = await fsp.readdir(lilithFolder)
		for (const file of files) {
			if (file.endsWith('-cache.json')) {
				await fsp.unlink(path.join(lilithFolder, file))
			}
		}
	}

	// if (process.argv.includes('--dev')) return

	try {
		const latest = await fetchLilithJson<LilithVersionManifest>('/versions/latest')
		const alpha = await fetchLilithJson<LilithVersionManifest>('/versions/alpha')

		let OS = 'windows'
		switch (process.platform) {
			case 'win32':
				OS = 'windows'
				break
			case 'darwin':
				OS = 'macos'
				break
			case 'linux':
				OS = 'linux'
				break
		}

		Lilith.log.debug(latest.download[OS].substring(latest.download[OS].lastIndexOf('/') + 1))
		Lilith.log.debug(alpha.download[OS].substring(alpha.download[OS].lastIndexOf('/') + 1))

		const keep = new Set<string>()
		keep.add(latest.download[OS].substring(latest.download[OS].lastIndexOf('/') + 1))
		keep.add(alpha.download[OS].substring(alpha.download[OS].lastIndexOf('/') + 1))

		let files = []
		const launcherFolderExists = await fsp
			.stat(launcherFolder)
			.then(() => true)
			.catch(() => false)
		if (launcherFolderExists) files = files.concat(await fsp.readdir(launcherFolder))
		const launcherFolder2Exists = await fsp
			.stat(launcherFolder2)
			.then(() => true)
			.catch(() => false)
		if (launcherFolder2Exists) files = files.concat(await fsp.readdir(launcherFolder2))

		files = files.filter((file) => !keep.has(file))

		Lilith.log.trace(files)

		for (const file of files) {
			if (!keep.has(file)) {
				Lilith.log.trace(file)
				try {
					await fsp.unlink(path.join(launcherFolder, file))
					setTimeout(() => {
						log.raw(
							`${lc.purple('Launcher')} ${lc.black('»')} ${lc.default(
								`Deleted old Lilith version ${path.join(launcherFolder, file)}`,
							)}`,
							'CLEANUP',
						)
					}, 2000)
				} catch {}
				try {
					await fsp.unlink(path.join(launcherFolder2, file))
					setTimeout(() => {
						log.raw(
							`${lc.purple('Launcher')} ${lc.black('»')} ${lc.default(
								`Deleted old Lilith version ${path.join(launcherFolder2, file)}`,
							)}`,
							'CLEANUP',
						)
					}, 2000)
				} catch {}
			}
		}
	} catch (err) {
		Lilith.log.error(err)
	}
})()

const defaultConfig: LilithStore = {
	nickname: '',
	nicknames: {},
	whitelisted: [],
	authentication: {},
	noDodgePlayers: {},
	themes: {
		duels: 'default',
		bedwars: 'default',
		skywars: 'default',
	},
	plugins: {},
	rankAccounts: {},
	blockedUsers: [],
	lilithChatEnabled: true,
	streamerMode: false,
	streamerModeScoreboard: {
		hideDate: false,
		hideServer: false,
		customText: {
			prefix: '§clilith.rip',
			suffix: '',
			enabled: false,
		},
	},
}

let stored: LilithStore = defaultConfig
export default (): LilithStore => stored

try {
	stored = JSON.parse(fs.readFileSync(path.join(lilithFolder, 'store.json')).toString())
	stored = mergeObjects(defaultConfig, stored)
	fsp.writeFile(path.join(lilithFolder, 'store.json'), JSON.stringify(stored)).catch((e) => {
		log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white(e.toString()), 'STORE')
	})
} catch (e) {
	log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white(e.toString()), 'STORE')
	log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white('Resetting store to default...'), 'STORE')
	fsp.writeFile(path.join(lilithFolder, 'store.json'), JSON.stringify(stored)).catch((e2) => {
		log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white(e2.toString()), 'STORE')
	})
}

export async function updateStore(updates: LilithStoreUpdate) {
	stored = mergeObjects(stored, updates)
	try {
		await fsp.writeFile(path.join(lilithFolder, 'store.json'), JSON.stringify(stored))
	} catch (e) {
		log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white(e.toString()), 'STORE')
	}
}

export async function deleteStoreAuthentication(uuid: string) {
	if (stored.authentication[uuid] == null) return
	delete stored.authentication[uuid]
	await fsp.rm(path.join(lilithFolder, 'auth', uuid.substr(0, 6)), {
		recursive: true,
		force: true,
	})
	// Lilith.log.debug(token)
	// if (token != null) {
	//     const files = await fsp.readdir(lilithFolder)
	//     for (const file of files) {
	//         console.log(file)
	//         if (file.endsWith('mca-cache.json')) {
	//             const json = JSON.parse((await fsp.readFile(path.join(lilithFolder, file))).toString())
	//             console.log(json.mca.access_token)
	//             if (json.mca.access_token === token) {
	//                 const prefix = file.substring(0, file.length - 15)
	//                 const files2 = await fsp.readdir(lilithFolder)
	//                 for (const file2 of files2) {
	//                     if (file2.startsWith(prefix)) {
	//                         await fsp.unlink(path.join(lilithFolder, file2))
	//                     }
	//                 }
	//             }
	//         }
	//     }
	// }

	try {
		await fsp.writeFile(path.join(lilithFolder, 'store.json'), JSON.stringify(stored))
	} catch (e) {
		log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white(e.toString()), 'STORE')
	}
}

export async function clearTags() {
	if (Object.keys(stored.tags).length > 0) {
		delete stored.tags
		try {
			await fsp.writeFile(path.join(lilithFolder, 'store.json'), JSON.stringify(stored))
		} catch (e) {
			log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white(e.toString()), 'STORE')
		}
	} else {
		Lilith.log.info('No tags to delete in store.ts')
	}
}

export async function clearAuthentication(store = true) {
	if (store) stored.authentication = {}
	try {
		if (store) await fsp.writeFile(path.join(lilithFolder, 'store.json'), JSON.stringify(stored))
		await fsp.rm(path.join(lilithFolder, 'auth'), {
			recursive: true,
			force: true,
		})
		// glob(lilithFolder + '/*-cache.json', async (_err, files) => {
		//     for (const file of files) {
		//         fs.unlink(file, err => {
		//             if (err) console.log(err)
		//         })
		//     }
		// })
	} catch (e) {
		log.raw(lc.red('Store Error') + lc.black(' » ') + chalk.white(e.toString()), 'STORE')
		throw e
	}
}

export interface LilithStore {
	nickname: string
	nicknames: Record<string, string>
	whitelisted: string[]
	authentication: Record<
		string,
		{
			email: string
			password: string
		}
	>
	noDodgePlayers: Record<string, string>
	themes: Record<string, string>
	plugins: {
		[plugin: string]: Partial<{
			enabled: boolean
			settings: any
			commandAliases: Record<string, string>
		}>
	}
	tags?: Record<string, string>
	rankAccounts: {
		[uuid: string]: boolean
	}
	blockedUsers: string[]
	lilithChatEnabled: boolean
	streamerMode: boolean
	streamerModeScoreboard: {
		hideDate: boolean
		hideServer: boolean
		customText: {
			prefix: string
			suffix: string
			enabled: boolean
		}
	}
}

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>
}
export type LilithStoreUpdate = RecursivePartial<LilithStore>
