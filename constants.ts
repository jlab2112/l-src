import os from 'node:os'
import path from 'node:path'

export const VERSION = '2.0.8'
export const SDK_VERSION = '1.0.3'
export const API_URL = /*!process.argv.includes('--dev-api') ? 'https://api.lilith.rip' :*/ 'https://api.lilith.rip'
export const MOJANG_ENDPOINT = `${API_URL}/mojang/profiles`
export const LILITH_FOLDER = path.join(os.homedir(), 'lilith')
export const DEVELOPER_MODE = process.argv.includes('--dev')

export let SYSTEM: () => 'windows' | 'macos' | 'linux'
export const lilithFolder = path.join(os.homedir(), 'lilith')

switch (process.platform) {
	case 'win32':
		SYSTEM = () => 'windows'
		break
	case 'darwin':
		SYSTEM = () => 'macos'
		break
	case 'linux':
		SYSTEM = () => 'linux'
		break
}
