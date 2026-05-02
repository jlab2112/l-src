import EventEmitter from 'node:events'

class ExtendedEmitter extends EventEmitter {
	name: string

	constructor(name: string) {
		super()
		this.name = name
	}

	addListener(eventName: string, listener: (...args: any[]) => void): this {
		Lilith.log.debug(`Adding ${this.name} listener without a reason for ${eventName}`)
		return super.addListener(eventName, listener)
	}

	on(eventName: string, listener: (...args: any[]) => void): this {
		Lilith.log.debug(`Adding ${this.name} listener without a reason for ${eventName}`)
		return super.on(eventName, listener)
	}

	once(eventName: string, listener: (...args: any[]) => void): this {
		Lilith.log.debug(`Adding one-time ${this.name} listener without a reason for ${eventName}`)
		return super.once(eventName, listener)
	}

	addListenerWithReason(eventName: string, why: string, listener: (...args: any[]) => void): this {
		Lilith.log.debug(`Adding ${this.name} listener for ${eventName} because ${why}`)
		return super.addListener(eventName, listener)
	}

	onWithReason(eventName: string, why: string, listener: (...args: any[]) => void): this {
		Lilith.log.debug(`Adding ${this.name} listener for ${eventName} because ${why}`)
		return super.on(eventName, listener)
	}

	onceWithReason(eventName: string, why: string, listener: (...args: any[]) => void): this {
		Lilith.log.debug(`Adding one-time ${this.name} listener for ${eventName} because ${why}`)
		return super.once(eventName, listener)
	}
}

export const locationEmitter = new ExtendedEmitter('location')

export const partyEmitter = new ExtendedEmitter('party')

export const movedEmitter = new ExtendedEmitter('moved')

locationEmitter.setMaxListeners(100)
partyEmitter.setMaxListeners(100)
movedEmitter.setMaxListeners(100)
