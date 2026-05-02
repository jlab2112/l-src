import EventEmitter from 'node:events'

const gameEmitter = new EventEmitter()
gameEmitter.setMaxListeners(50)

export default gameEmitter
