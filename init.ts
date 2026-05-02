// import ModLoader from '@/modding/ModLoader.js'

import chalk from 'chalk'
import config, { fetchConfig } from '@/config.js'
import { getVersion, setOutOfDate } from '@/licensing.js'
import log, { lc } from '@/log.js'
import store, { clearTags } from '@/store'
import lilithWebsocket from '@/websocket/socket'
import { sendToLauncher } from '.'
import { useInjection } from './injection/support'
import { ipcServer } from './ipc/server'

try {
	fetchConfig()
} catch (err) {
	log.raw(lc.red('Error') + lc.black(' » ') + chalk.white(err.toString()), 'CONFIG')
	Lilith.error(err)
	log.raw(
		chalk.red(
			'Please screenshot the error above and ask in #community-support for help. Lilith will now close to avoid further issues.',
		),
		'EXITING',
	)
	process.exit(0)
}

const versionResult = getVersion(Lilith.versions.self)
if (versionResult.result === 1 && !false) {
	log.raw(
		lc.blue('Update') + lc.black(' » ') + lc.white('Restart your Lilith launcher to download the latest update.'),
		'OUTDATED',
	)
	setOutOfDate('Please restart your Lilith launcher to download the latest Lilith version!')
}

const startupText = () => {
	// @ts-ignore
	const portString =
		//@ts-ignore
		config().general.proxy.localPort === 25565 || config().general.proxy.localPort === '25565'
			? ''
			: `:${config().general.proxy.localPort}`

	// if (!injectionSupported()) {
	Lilith.msg(lc.green('Ready') + lc.black(' » ') + lc.default('Join Lilith using the address below:'))
	log.raw(
		`${chalk.red('Startup Complete')} ${chalk.gray('>')} ${chalk.white(
			'You can join Hypixel using Lilith by connecting to the IP "',
		)}${chalk.white.bold('localhost')}${chalk.white('" in any client.')}`,
		'STARTUP',
		true,
	)
	sendToLauncher({ type: 'started', data: `localhost${portString}` })
	if (process.argv.includes('--launcher-cursor-control')) {
		Lilith.msg(`localhost${portString}{*lilith_server_address*}`)
	} else {
		Lilith.msg('')
		Lilith.msg(' Server Address')
		Lilith.msg(chalk.gray('┌────────────────────────────────┐'))
		Lilith.msg(chalk.gray(`│${lc.default.bold(`localhost${portString.padEnd(6, ' ')}`)}                 │`))
		Lilith.msg(chalk.gray('└────────────────────────────────┘'))
		Lilith.msg('')
	}
	// } else {
	//     Lilith.msg(lc.green('Ready') + lc.black(' » ') + lc.default('You can now launch Minecraft and join Hypixel as normal!'))
	//
	//     log.raw('Startup complete', 'STARTUP', true)
	// }
}
;(async () => {
	await import('./listeners/index.js')
	await import('./commands/index.js')

	const { initializeRanks } = await import('./ranks/ranksData.js')
	const { addListeners } = await import('./ranks/ranks.js')
	const { startLilith } = await import('./input.js')

	// await import("./ipc/ipcHandler.js")

	// const modLoader = new ModLoader()
	if (store().tags && Object.keys(store().tags).length > 0) {
		Lilith.log.info(`Found tags in store.json, migrating ${Object.keys(store().tags).length} tag(s).`)
		const end = {}

		for (const uuid of Object.keys(store().tags)) {
			if (uuid === undefined) continue
			end[uuid] = {}
			end[uuid].value = store().tags[uuid]
		}
		lilithWebsocket.send<'migrateTags'>('migrateTags', end)
		await clearTags()
	}

	startLilith()

	// await modLoader.loadMods()
	if (useInjection()) {
		const { initializeInjection } = await import('./injection/loader.js')

		await initializeInjection()

		ipcServer.listen()
	}

	addListeners()

	startupText()
	initializeRanks()
})()
