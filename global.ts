import Logger, { LOG_LEVEL, levels } from '@lilithmod/logger'
import { API_URL, DEVELOPER_MODE, LILITH_FOLDER, SDK_VERSION, SYSTEM, VERSION } from '@/constants'
import log, { lc } from '@/log'

declare global {
	var Lilith: {
		log: Logger
		platform: string
		api: { url: string }
		app: { devMode: boolean; storeDir: string }
		versions: { self: string; sdk: string }
		error(...err: any[]): void
		msg(...msg: any[]): void
	}
}

const logger = new Logger({
	enabled: DEVELOPER_MODE,
	level: levels[LOG_LEVEL]?.priority || 30,
	name: 'lilith',
	format: '{brightCyan}%time{reset} {white}(app:%name pid:%pid%file) %color[%level%group]{reset}',
})
;((globalThis) => {
	globalThis.Lilith = {
		log: logger,
		platform: SYSTEM(),
		api: { url: API_URL },
		app: { devMode: DEVELOPER_MODE, storeDir: LILITH_FOLDER },
		versions: { self: VERSION, sdk: SDK_VERSION },
		error: (err: string) => log.error(`${lc.red('Error')} ${lc.black('»')} ${err.toString()}`),
		msg: (...msg: any[]) => console.log(...msg),
	}
})(globalThis)
