import os from 'node:os'
import path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import type { Process } from '@lilithmod/unborn-inject'
import chalk from 'chalk'
import { lc } from '@/log'

const librarySuffix = {
	darwin: '.dylib',
	linux: '.so',
	win32: '.dll',
}

async function watch() {
	const { findProcessByWindow } = await import('@lilithmod/unborn-inject')

	let currentProcess = { pid: 0 } as Process

	while (true) {
		let process: Process

		try {
			process = findProcessByWindow('LWJGL')
		} catch {
			process = currentProcess
		}

		if (process.pid !== currentProcess.pid || process.tid !== currentProcess.tid) {
			process.loadLibrary(path.join(os.homedir(), `/lilith/loader${librarySuffix[os.platform()]}`), [])
			currentProcess = process

			Lilith.msg(`${lc.purple('Injection')} ${chalk.gray('»')} ${lc.white(`Loaded into Minecraft (${process.pid})`)}`)
		}

		await setTimeout(2000)
	}
}

export async function initializeInjection() {
	// if (process.argv.includes('--launcher-cursor-control')) {
	//     Lilith.msg(`${lc.purple("Injection")} ${chalk.gray("»")} ${lc.white("Initializing injection")}`)
	// } else {
	//     process.stdout.write(`${lc.purple("Injection")} ${chalk.gray("»")} ${lc.white("Initializing injection")}`)
	// }

	// clearLine(`${lc.purple("Injection")} ${chalk.gray("»")} ${lc.white("Waiting ")}`)
	Lilith.msg(`${lc.purple('Injection')} ${chalk.gray('»')} ${lc.white('Waiting for Minecraft to be opened...')}`)
	watch()
}
