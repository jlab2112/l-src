// import os from 'node:os'
// import fs from 'node:fs'
// import tmp from 'tmp-promise'
// import path from 'node:path'
// import unzipper from 'unzipper'
// import { NodeVM } from 'vm2'
// import log from '@/log'
// import * as constants from '@/constants'
// import SandboxConsole from './SandboxConsole'
// import { Ids } from '@/types/packets/minecraft/ids'
// import chalk from 'chalk'
// import { addAsyncListener, addListener, setClientboundPacketDelay, setServerboundPacketDelay } from '@/events.js'
// import { CommandHandler, LexureParser, registerCommand } from '@/commands/handler'
// import { updateStore } from '@/store'
// import { Packet, writePacket } from '@/types/packets/minecraft/packets'
// import { Event } from '@/types/events'
// import * as mcProto from '@lilithmod/unborn-mcproto'
// import { PacketReader, PacketWriter } from '@lilithmod/unborn-mcproto'
// import { deserializers, serializers } from '@/packets/deserialize'
// import { chat, chatJson } from '@/utils/chat'
// import { permission } from '@/utils/permissions.js'
// import { Collection } from '@discordjs/collection'
//
// type ModData = {
//     version: string;
//     entry: string;
// };
//
// type LoadedMod = {
//     data: ModData;
//     vm: NodeVM;
//     unloadFunction: () => Promise<void>;
// };
//
// export default class ModLoader {
//     private modDir: string
//     private maxThreads: number = 4
//     private loadedMods: Collection<string, LoadedMod> = new Collection()
//
//     constructor() {
//         this.maxThreads = os.cpus().length * 2
//         this.modDir = path.join(constants.lilithFolder, 'mods')
//
//         if (!fs.existsSync(this.modDir)) {
//             fs.mkdirSync(this.modDir)
//         }
//     }
//
//     public async loadMods() {
//         if (!permission('lilith.modding.load')) return // TODO: Load untrusted mod permission
//         const mods = fs.readdirSync(this.modDir)
//             .filter(file => file.endsWith('.lmod'))
//             .map(file => path.join(this.modDir, file))
//
//         if (mods.length === 0) {
//             return
//         }
//
//         const promises: Promise<void>[] = []
//
//         for (const mod of mods) {
//             promises.push(this.loadMod(mod))
//
//             if (promises.length >= this.maxThreads) {
//                 await Promise.all(promises)
//                 promises.length = 0
//             }
//         }
//
//         await Promise.all(promises)
//
//         log.raw(`${chalk.cyan('Modding')} ${chalk.gray('»')} ${chalk.white(`Loaded ${this.loadedMods.size} mod${this.loadedMods.size !== 1 ? 's' : ''}`)}`, 'MODDING')
//     }
//
//     private async loadMod(mod: string) {
//         const tempDir = await tmp.dir({ unsafeCleanup: true })
//         const friendlyName = path.basename(mod, '.lmod').replace(/ /g, '_')
//
//         log.raw(`${chalk.cyan('Modding')} ${chalk.gray('»')} ${chalk.white(`Loading mod ${friendlyName}`)}`, 'MODDING')
//
//         await fs.createReadStream(mod)
//             .pipe(unzipper.Extract({ path: tempDir.path }))
//             .promise()
//
//         const modFile = path.join(tempDir.path, 'mod.json')
//
//         if (!fs.existsSync(modFile)) {
//             log.error(`${chalk.red('Modding Error')} ${chalk.gray('»')} ${chalk.white(`Mod ${friendlyName} is missing a mod.json file`)}`)
//             return
//         }
//
//         const modData: ModData = JSON.parse(fs.readFileSync(modFile, 'utf8'))
//
//         let errorsOccurred = false
//
//         if (!modData.version) {
//             log.error(`${chalk.red('Modding Error')} ${chalk.gray('»')} ${chalk.white(`Mod ${friendlyName} is missing a version`)}`)
//             errorsOccurred = true
//         }
//
//         if (!modData.entry) {
//             log.error(`${chalk.red('Modding Error')} ${chalk.gray('»')} ${chalk.white(`Mod ${friendlyName} is missing an entry point`)}`)
//             errorsOccurred = true
//         }
//
//         const modEntry = path.join(tempDir.path, modData.entry)
//
//         if (!fs.existsSync(modEntry)) {
//             log.error(`${chalk.red('Modding Error')} ${chalk.gray('»')} ${chalk.white(`Mod ${friendlyName} is missing an entry point`)}`)
//             errorsOccurred = true
//         }
//
//         if (errorsOccurred) {
//             log.error(`${chalk.red('Modding Error')} ${chalk.gray('»')} ${chalk.white(`Failed to load mod ${friendlyName}`)}`)
//             return
//         }
//
//         const sandboxedConsole = new SandboxConsole(friendlyName)
//         const lilithExports = {
//             versions: {
//                 lilith: constants.VERSION,
//                 sdk: constants.SDK_VERSION
//             },
//             ids: {
//                 handshaking: {
//                     server: Ids.Handshaking.toServer
//                 },
//                 login: {
//                     client: Ids.Login.toClient,
//                     server: Ids.Login.toServer
//                 },
//                 play: {
//                     client: Ids.Play.toClient,
//                     server: Ids.Play.toServer
//                 },
//                 status: {
//                     client: Ids.Status.toClient,
//                     server: Ids.Status.toServer
//                 }
//             },
//             proxy: {
//                 addListener: <T extends Event>(
//                     id: number,
//                     direction: 'toServer' | 'toClient',
//                     handler: (event: T) => Promise<void>,
//                     priority: number = 0,
//                     ignoreCancelled: boolean = false,
//                 ) => {
//                     addListener<T>(id, direction, '', priority, ignoreCancelled, (event: T) => {
//                         return handler(event)
//                     })
//                 },
//                 addAsyncListener: <T extends Event>(
//                     id: number,
//                     direction: 'toServer' | 'toClient',
//                     handler: (event: T) => Promise<void>,
//                     priority: number = 0
//                 ) => {
//                     addAsyncListener<T>(id, direction, '', priority, (event: T) => {
//                         return handler(event)
//                     })
//                 },
//                 writePacket,
//                 chat,
//                 chatJson,
//                 setClientboundPacketDelay,
//                 setServerboundPacketDelay,
//                 registerPacketSerializer: (
//                     packetId: number,
//                     direction: 'toServer' | 'toClient' | 'shared',
//                     serialize: (packet: Packet) => PacketWriter
//                 ) => {
//                     if (!serializers.has('minecraft')) {
//                         serializers.set('minecraft', {
//                             toServer: new Map<number, any>(),
//                             toClient: new Map<number, any>()
//                         })
//                     }
//
//                     const _namespaceSerializers = serializers.get('minecraft')
//
//                     if (direction === 'shared') {
//                         _namespaceSerializers.toServer.set(packetId, serialize as any)
//                         _namespaceSerializers.toClient.set(packetId, serialize as any)
//                         return
//                     }
//
//                     _namespaceSerializers[direction].set(packetId, serialize as any)
//                 },
//                 registerPacketDeserializer: (
//                     packetId: number,
//                     direction: 'toServer' | 'toClient' | 'shared',
//                     deserialize: (packet: PacketReader) => unknown
//                 ) => {
//                     if (!deserializers.has('minecraft')) {
//                         deserializers.set('minecraft', {
//                             toServer: new Map<number, any>(),
//                             toClient: new Map<number, any>()
//                         })
//                     }
//
//                     const _namespaceDeserializers = deserializers.get('minecraft')
//
//                     if (direction === 'shared') {
//                         _namespaceDeserializers.toServer.set(packetId, deserialize)
//                         _namespaceDeserializers.toClient.set(packetId, deserialize)
//                         return
//                     }
//
//                     _namespaceDeserializers[direction].set(packetId, deserialize)
//                 }
//             },
//             commandHandler: {
//                 registerCommand: (name: string, callbacks: CommandHandler, aliases: string[] = []) => {
//                     let basename = name
//
//                     if (!name.startsWith(friendlyName + ':')) {
//                         name = friendlyName + ':' + name
//                     } else {
//                         basename = name.split(':')[1]
//                     }
//
//                     for (const alias of [basename, name, ...aliases].flatMap(alias => {
//                         if (alias.startsWith('/')) {
//                             return [alias.substring(1)]
//                         }
//
//                         return [alias, `${friendlyName}:${alias.split(':').pop() ?? alias}`]
//                     })) {
//                         updateStore({
//                             plugins: {
//                                 [friendlyName]: {
//                                     commandAliases: {
//                                         [alias]: name
//                                     }
//                                 }
//                             }
//                         })
//                     }
//
//                     registerCommand(name, callbacks)
//
//                     process.stdout.clearLine(0)
//                     process.stdout.cursorTo(0)
//                     process.stdout.write(`${chalk.cyan('Modding')} (${friendlyName}) ${chalk.gray('»')} ${chalk.white(`Registered command ${basename} from ${friendlyName}`)}`)
//                 },
//                 lexureParser: LexureParser
//             }
//         }
//
//         let modVm = new NodeVM({
//             console: 'off',
//             require: {
//                 root: tempDir.path,
//                 external: true,
//                 context: 'sandbox',
//                 builtin: ['*'],
//                 mock: {
//                     'lilith-sdk': lilithExports,
//                     '@lilithmod/sdk': lilithExports,
//                     '@lilithmod/unborn-mcproto': mcProto
//                 }
//             },
//             sandbox: {
//                 __dirname: tempDir.path,
//                 __filename: path.dirname(path.join(tempDir.path, modEntry)),
//                 console: sandboxedConsole
//             }
//         })
//
//         let modExports: {
//             onLoad: () => Promise<void> | void;
//             onUnload?: () => Promise<void> | void;
//         } | undefined
//
//         try {
//             const exports = modVm.run(fs.readFileSync(modEntry, 'utf8'), { filename: modEntry, strict: true })
//             modExports = exports.default ?? exports
//
//             errorsOccurred = false
//
//             if (!modExports.onLoad) {
//                 (modVm as undefined) = undefined
//                 log.error(`${chalk.red('Modding Error')} ${chalk.gray('||')} ${chalk.white(`Mod ${friendlyName} is missing an onLoad function`)}`)
//                 errorsOccurred = true
//             }
//
//             if (errorsOccurred) {
//                 log.error(`${chalk.red('Modding Error')} ${chalk.gray('||')} ${chalk.white(`Failed to load mod ${friendlyName}`)}`)
//                 return
//             }
//
//             sandboxedConsole.setInitialized()
//             await modExports.onLoad()
//
//             const unload = async () => {
//                 if (modExports?.onUnload) {
//                     await modExports.onUnload()
//                 }
//
//                 (modVm as undefined) = undefined
//                 global.gc()
//             }
//
//             this.loadedMods.set(friendlyName, {
//                 data: modData,
//                 vm: modVm,
//                 unloadFunction: unload
//             })
//
//             process.stdout.clearLine(0)
//             process.stdout.cursorTo(0)
//             log.raw(`${chalk.cyan('Modding')} ${chalk.gray('»')} ${chalk.white(`Loaded mod ${friendlyName}`)}`, 'MODDING')
//         } catch (e) {
//             log.error(chalk.white(`${chalk.red('Error')} (${chalk.cyan(friendlyName)}) ${chalk.gray('||')} ${e.stack}`))
//             log.raw(`${chalk.cyan('Modding')} ${chalk.gray('||')} ${chalk.white(`Unloading mod ${friendlyName}`)}`, 'MODDING')
//
//             if (modExports && modExports.onUnload) {
//                 try {
//                     await modExports.onUnload()
//                     modVm = undefined
//                 } catch (e) {
//                     log.error(chalk.white(`${chalk.red('Error')} (${chalk.cyan(friendlyName)}) ${chalk.gray('||')} ${e.stack}`))
//                     modVm = undefined
//                 }
//             }
//
//             this.loadedMods.delete(friendlyName)
//             global.gc()
//
//             log.raw(`${chalk.cyan('Modding')} ${chalk.gray('||')} ${chalk.white(`Unloaded mod ${friendlyName}`)}`, 'MODDING')
//             return
//         }
//     }
// }
