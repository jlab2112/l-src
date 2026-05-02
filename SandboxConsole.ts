import { Console } from 'node:console'
import util from 'node:util'
import chalk from 'chalk'
import log from '@/log'

export default class SandboxConsole extends Console {
	private modInitialized = false
	private modFriendlyName: string

	constructor(friendlyName: string) {
		super(process.stdout, process.stderr)

		this.modFriendlyName = friendlyName
	}

	public log(...args: any[]) {
		if (this.modInitialized) {
			log.raw(`${chalk.cyan(this.modFriendlyName)} ${chalk.gray('»')} ${chalk.white(this.format(...args))}`, 'MODDING')
		}
	}

	public error(...args: any[]) {
		if (this.modInitialized) {
			log.raw(`${chalk.red('Error')} (${chalk.cyan(this.modFriendlyName)}) ${chalk.gray('»')} ${chalk.white(this.format(...args))}`, 'MODDING')
		}
	}

	public warn(...args: any[]) {
		if (this.modInitialized) {
			log.raw(
				`${chalk.yellow('Warn')} (${chalk.cyan(this.modFriendlyName)}) ${chalk.gray('»')} ${chalk.white(this.format(...args))}`,
				'MODDING',
			)
		}
	}

	public info(...args: any[]) {
		if (this.modInitialized) {
			log.raw(`${chalk.cyan(this.modFriendlyName)} ${chalk.gray('»')} ${chalk.white(this.format(...args))}`, 'MODDING')
		}
	}

	public debug(...args: any[]) {
		if (this.modInitialized) {
			log.raw(`${chalk.cyan(this.modFriendlyName)} ${chalk.gray('»')} ${chalk.white(this.format(...args))}`, 'MODDING')
		}
	}

	public setInitialized() {
		this.modInitialized = true
	}

	private format(...args: any[]): string {
		return args
			.map((arg) => {
				if (typeof arg === 'string') {
					return arg
				}

				return util.inspect(arg, {
					colors: true,
					depth: null,
				})
			})
			.join(' ')
	}
}
