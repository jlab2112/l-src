import './global'
import 'suppress-experimental-warnings'

import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import { setTimeout as wait } from 'node:timers/promises'
import * as Sentry from '@sentry/node'
import chalk from 'chalk'
import srcMapSupport from 'source-map-support'
// noinspection JSIgnoredPromiseFromCall
import { lilithFolder, SYSTEM } from '@/constants.js'
import { loadHwid } from '@/hwid.js'
import { setCachedInfo } from '@/licensing.js'
import log, { lc } from '@/log.js'
import { clearLine } from '@/utils/clearline.js'
import { permission } from '@/utils/permissions.js'
import type { LilithWebsocket } from './websocket/socket'

Lilith.log.notice(Lilith.versions.self)
const launcherJSON = process.argv.includes('--json')

type LauncherMessage = {
	type: 'authCode' | 'starting' | 'config' | 'uuid' | 'started' | 'error' | 'game'
	data: string
}

export function sendToLauncher(message: LauncherMessage) {
	if (launcherJSON) {
		console.log(`\n${message.type}:${message.data}`)
	}
}

console.info = (message, ...optionalParams) => {
	if (message === '[msa] Signed in with Microsoft') {
		return
	}
	console.log(message, ...optionalParams)
}

if (process.argv.includes('--ipv4-only')) {
	http.globalAgent = new http.Agent({ family: 4 })
	https.globalAgent = new https.Agent({ family: 4 })
}

srcMapSupport.install({
	hookRequire: true,
	handleUncaughtExceptions: true,
})

if (process.argv.includes('--launcher-cursor-control')) {
	Lilith.msg(
		lc.red('Lilith') + lc.default.bold(` v${Lilith.versions.self} `) + lc.black('[') + lc.gray('...') + lc.black(']'),
	)
} else {
	process.stdout.write(
		lc.red('Lilith') + lc.default.bold(` v${Lilith.versions.self} `) + lc.black('[') + lc.gray('...') + lc.black(']'),
	)
}
log.raw(lc.red('Lilith') + chalk.gray(' || ') + chalk.white.bold(`v${Lilith.versions.self}`), 'STARTUP', true)
;(async () => {
	sendToLauncher({ type: 'starting', data: '' })

	await loadHwid()
	if (!process.argv.includes('--ireallyknowwhatimdoing') && !process.argv.includes('--iknowwhatimdoing')) {
		log.raw(
			lc.blue('Update') +
				lc.black(' » ') +
				lc.white(
					'Please download the BRAND NEW Lilith launcher at https://lilithmod.xyz/downloads - you get auto-update and a nicer experience.',
				),
			'UPDATE',
		)
		wait(30000)
		process.exit(1)
	} else {
		const { default: lilithWebsocket } = (await import('./websocket/socket.js')) as unknown as {
			default: LilithWebsocket
		}
		const { hwid } = await import('./hwid.js')

		let timeout: NodeJS.Timeout
		// @ts-ignore
		lilithWebsocket.on('open', async () => {
			Lilith.log.trace('Sending hwid to websocket')
			lilithWebsocket.send<'hwid'>('hwid', hwid)
		})

		lilithWebsocket.on<'unlicensed'>('unlicensed', () => {
			Lilith.log.warn('Unlicensed user')

			lilithWebsocket.send<'verify'>('verify', hwid)
			timeout = setTimeout(() => {
				Lilith.msg('Waited too long, shutting down...')
				sendToLauncher({
					type: 'error',
					data: 'Waited to long, shutting down.',
				})
				process.exit(0)
			}, 120000)
		})

		lilithWebsocket.on<'authCode'>('authCode', (data) => {
			if (process.argv.includes('--launcher-cursor-control')) {
				Lilith.msg(`${data}{*lilith_auth_link*}`)
			} else {
				process.stdout.write(lc.yellow(' Verify') + lc.black(' » ') + lc.aqua.underline(data))
			}
			sendToLauncher({ type: 'authCode', data })
		})

		lilithWebsocket.once<'licensed'>('licensed', async (data) => {
			lilithWebsocket.on<'licensed'>('licensed', (data) => {
				setCachedInfo(data)
				if (data.permissions) Lilith.log.info(data.permissions)
				Sentry.setUser({
					id: data.id,
					username: data.discord,
					tier: data.tier,
				})
			})
			// console.log(data)lc.black('[') + lc.gray(data.discord) + lc.black(']')
			setCachedInfo(data)
			Lilith.log.trace(data.permissions)
			if (process.argv.includes('--launcher-cursor-control')) {
				Lilith.msg(`${data.id}{*lilith_discord_id*}`)
			}

			clearLine(
				lc.red('Lilith') +
					lc.default.bold(` v${Lilith.versions.self} `) +
					lc.black('[') +
					lc.gray(
						data.discord.includes('#') && data.discord.split('#')[1] === '0'
							? data.discord.split('#')[0]
							: data.discord,
					) +
					lc.black(']'),
			)
			log.raw(
				`${chalk.green('Authorized')} ${chalk.gray('>')} ${chalk.white.bold(data.discord.split('#')[0])}`,
				'STARTUP',
				true,
			)

			// log.raw(`${lc.blue('Authorized')} ${lc.black('»')} ${chalk.white.bold(data.discord)}`, 'STARTUP', false)
			Sentry.setUser({
				id: data.id,
				username: data.discord,
				tier: data.tier,
			})
			clearTimeout(timeout)

			try {
				if (permission('lilith.beta.1')) {
					import('./init.js')
				} else {
					if (!data.discord.includes('#')) {
						sendToLauncher({
							type: 'error',
							data: 'Your discord account seems to have been terminated. Please join discord.gg/GzNhP5SjBR on a new account and make a support ticket for assistance migrating. Shutting down in 15s.',
						})
						log.raw(
							`${lc.red('Error')} ${lc.black('»')} ${chalk.white(
								'Your discord account seems to have been terminated.' +
									'Please join discord.gg/lilith on a new account and make a support ticket for assistance migrating.',
							)}`,
							'STARTUP',
						)
					} else {
						log.raw(
							`${lc.red('Error')} ${lc.black('»')} ${chalk.white(
								"You don't appear to have the Trial role in the Lilith Discord." +
									'Please join discord.gg/lilith and make a support ticket for assistance.',
							)}`,
							'STARTUP',
						)
					}
					log.raw('Shutting down in 15 seconds...', 'STARTUP')
					await wait(15000)
					process.exit(1)
				}
			} catch (err: any) {
				if (err.message.includes('Cannot read properties of undefined')) {
					Lilith.error(
						`Please open a ticket on the Lilith Discord at discord.gg/lilith with the following information: ${data.discord}, to use Lilith.`,
					)
					await wait(15000)
					process.exit(1)
				} else {
					Lilith.msg(
						'Something is wrong with your account and vital portions of Lilith will be broken! Please make a ticket on the Lilith Discord at discord.gg/lilith',
					)
					await wait(15000)
					process.exit(1)
				}
			}
		})
	}
})()

// new Promise(resolve => lilithWebsocket.once('open', resolve)).then(() => {
//
// })

// Importing @sentry/tracing patches the global hub for tracing to work.

if (!fs.existsSync(lilithFolder)) fs.mkdirSync(lilithFolder)

process.env.http_proxy = ''
process.env.https_proxy = ''

// import {ProfilingIntegration} from "@sentry/profiling-node";

Sentry.init({
	dsn: 'https://133b8f49ee7743dcb713dcb6f7cf48d7@o998490.ingest.sentry.io/5957324',

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1,
	// integrations: [
	//     new ProfilingIntegration()
	// ],
	// profilesSampleRate: 1,
	release: `lilith@${Lilith.versions.self}`,
	environment: 'production',
	beforeSend: (event) => {
		if (process.argv.includes('--dev')) return null
		Lilith.log.panic(event.exception.values[0].value)
		const type = event.exception.values[0].type
		const message = event.exception.values[0].value
		if (message.includes('write after end')) return null
		if (message.includes('Too Many Requests')) return null
		if (message.includes('does the account own minecraft?')) return null
		if (message.includes('EPERM')) return null
		if (message.includes('EACCES')) return null
		if (message.includes('ETIMEDOUT')) return null
		if (message.includes("doesn't appear to own Minecraft")) return null
		if (type === 'XboxReplayError') return null
		if (message.includes('ENOENT')) {
			log.error('Incredibly weird error just occurred, please restart.')
			return null
		}
		if (message === 'Authentication failed, timed out') return null
		if (message.endsWith('failed, reason: read ECONNRESET') && message.startsWith('request to https://api.lilith.rip/'))
			return null
		if (message === "Cannot read property 'items' of undefined") return null
		if (message === "Cannot read property 'server' of undefined") {
			log.raw(
				lc.red('Config Error') +
					lc.black(' » ') +
					chalk.white(
						'Please read above or screenshot and ask in #community-support. Lilith will close in 30 seconds.',
					),
				'CONFIG',
			)
			setTimeout(() => {
				log.raw('Exiting...', 'EXITING')
				process.exit(0)
			}, 30000)
			return null
		}
		return event
	},
	beforeBreadcrumb(breadcrumb) {
		return breadcrumb.category === 'console' ? null : breadcrumb
	},
})

// Sentry.setTag('version', Lilith.versions.self)
Sentry.setTag('OS', SYSTEM())

const uncaught = (err) => {
	if (err.message.includes('EADDRINUSE')) {
		sendToLauncher({
			type: 'error',
			data: 'Please make sure no other instance of Lilith or Minecraft server is running on port 25565. Lilith will close in 30 seconds. (EADDRINUSE)',
		})
		log.raw(
			lc.red('Failed to Start') +
				lc.black(' » ') +
				chalk.white(
					'Please make sure no other instance of Lilith or Minecraft server is running on port 25565. Lilith will close in 30 seconds.',
				),
			'UNCAUGHT',
		)
		setTimeout(() => {
			log.raw('Exiting...', 'EXITING')
			process.exit(0)
		}, 30000)
		return
	}
	if (err.message.includes('EPERM')) {
		sendToLauncher({
			type: 'error',
			data: 'Please run Lilith as administrator. Lilith will close in 30 seconds. (EPERM)',
		})
		log.raw(
			lc.red('Error') +
				lc.black(' » ') +
				chalk.white('Please run Lilith as administrator. Lilith will close in 30 seconds. (EPERM)'),
			'EPERM',
		)
		setTimeout(() => {
			log.raw('Exiting...', 'EXITING')
			process.exit(0)
		}, 30000)
		return
	}
	if (err.message.includes('EACCES')) {
		sendToLauncher({
			type: 'error',
			data: 'Please run Lilith as administrator. Lilith will close in 30 seconds. (EACCES)',
		})
		log.raw(
			lc.red('Error') +
				lc.black(' » ') +
				chalk.white('Please run Lilith as administrator. Lilith will close in 30 seconds. (EACCES)'),
			'EACCES',
		)
		setTimeout(() => {
			log.raw('Exiting...', 'EXITING')
			process.exit(0)
		}, 10000)
		return
	}
	if (err.message.includes('ENOSPC') || err.message.includes('EROFS')) {
		sendToLauncher({
			type: 'error',
			data: "Couldn't write an important file because you have no space on your drive or your drive is read-only. Lilith will close in 10 seconds. (EROFS || ENOSPC)",
		})
		log.raw(
			lc.red('Error') +
				lc.black(' » ') +
				chalk.white(
					"Couldn't write an important file because you have no space on your drive or your drive is read-only. Lilith will close in 10 seconds.",
				),
			'EACCES',
		)
		setTimeout(() => {
			log.raw('Exiting...', 'EXITING')
			process.exit(0)
		}, 10000)
		return
	}
	if (err.message.includes('write after end') || err.name.includes('write after end')) {
		return
	}
	if (err.message.includes('Too Many Requests') || err.name.includes('Too Many Requests')) {
		log.raw(
			lc.red('Error') + lc.black(' » ') + chalk.white('Too many requests! Please wait a minute and try again'),
			'AUTH',
		)
		return
	}
}

process.on('uncaughtException', uncaught)
process.on('unhandledRejection', uncaught)
