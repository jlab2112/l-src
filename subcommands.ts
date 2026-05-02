import Logger, { LOG_LEVEL, levels } from '@lilithmod/logger'
import * as lexure from 'lexure'

const log = new Logger({
	enabled: false,
	level: levels[LOG_LEVEL]?.priority || 30,
	name: 'lilith_commands',
	format: '{brightCyan}%time{reset} {white}(app:%name pid:%pid%file) %color[%level%group]{reset}',
})

class Subcommand {
	commands: { [key: string]: Function }
	defaultCommand: string | null
	usage: Function | null
	permission: { has: boolean; error: Function | null }

	constructor(options?: { usage?: Function; permission?: { has: boolean; error: Function } }) {
		this.commands = {}
		this.defaultCommand = null
		this.usage = options?.usage || null
		this.permission = options?.permission || { has: true, error: null }
	}

	register(name: string, options?: { default?: boolean }) {
		this.commands[name] = () => {}
		if (options?.default) {
			this.defaultCommand = name
		}
		return this
	}

	action(callback: Function) {
		const lastRegisteredCommand = Object.keys(this.commands).pop()
		if (lastRegisteredCommand) {
			this.commands[lastRegisteredCommand] = callback
		}
		return this
	}

	run(raw: any) {
		if (this.permission.has == false) return this.permission?.error()
		const parsed = new lexure.Args(raw)
		const name = parsed.single()
		const args = parsed.many().map((i) => i.value)
		if (this.commands[name]) {
			return this.commands[name](args)
		}
		if (this.defaultCommand) {
			log.debug(`Command ${name} not found, running default command.`)
			return this.commands[this.defaultCommand](args)
		}
		if (this.usage) {
			this.usage()
		} else {
			log.error(`Command ${name} not found and no default command set.`)
		}
	}
}

export default Subcommand
