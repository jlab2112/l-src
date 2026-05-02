import { homedir, platform } from 'node:os'
import path from 'node:path'
import { findProcessByWindow } from '@lilithmod/unborn-inject'

try {
	const process = findProcessByWindow('LWJGL')

	const suffix = {
		darwin: '.dylib',
		linux: '.so',
		win32: '.dll',
	}

	process.loadLibrary(path.join(homedir(), `/lilith/loader${suffix[platform()]}`), [])
} catch (e) {
	console.log('could not locate minecraft')
	console.error(e)
}
