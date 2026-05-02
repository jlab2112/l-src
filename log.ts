import * as fs from 'node:fs'
import * as path from 'node:path'
import * as Sentry from '@sentry/node'
import c from 'chalk'
import { lilithFolder } from '@/constants'

export const lc = {
	black: c.ansi256(240),
	darkBlue: c.ansi256(19),
	darkGreen: c.ansi256(34),
	darkAqua: c.ansi256(37),
	darkRed: c.ansi256(124),
	darkPurple: c.ansi256(127),
	gold: c.ansi256(214),
	gray: c.ansi256(250),
	darkGray: c.ansi256(245),
	blue: c.ansi256(63),
	green: c.ansi256(83),
	aqua: c.ansi256(87),
	red: c.ansi256(203),
	purple: c.ansi256(207),
	yellow: c.ansi256(227),
	white: c.ansi(97),
	default: c.ansi(97),
}

const success: c.Chalk | ((arg0: string) => any) = lc.green
const info: c.Chalk | ((arg0: string) => any) = lc.yellow
const error: c.Chalk | ((arg0: string) => any) = lc.red
const lilith: c.Chalk = c.hex('#ed2b5b')

if (process.argv.includes('--launcher-cursor-control')) {
	lc.black = lc.darkGray
}

//
// if (process.argv.includes('--light') || process.platform === 'darwin') {
//     lc.white = c.white
//     lc.gray = c.ansi256(245)
//     lc.darkGray = c.ansi256(240)
//     lc.black = c.black
//     lc.yellow = lc.gold
//     lc.green = lc.darkGreen
//     lc.aqua = lc.darkAqua
//     lc.default = c.black
// }

const log = fs.createWriteStream(path.join(lilithFolder, 'lilith.log'), { flags: 'a' })
export const statsLog = fs.createWriteStream(path.join(lilithFolder, 'lilith-stats.log'), { flags: 'a' })

log.write(`Logger starting at ${new Date().toString()}\n`)

export default {
	raw: (input: string, prefix: string, quiet?: boolean) => {
		Sentry.addBreadcrumb({
			category: 'log',
			message: stripAnsi(input),
			level: 'info',
		})
		if (!quiet) Lilith.msg(input)
		log.write(`[${prefix}] ${stripAnsi(input)}\n`)
	},
	success: (input: string) => {
		Sentry.addBreadcrumb({
			category: 'log',
			message: stripAnsi(input),
			level: 'info',
		})
		Lilith.msg(success(input))
		log.write(`[SUCCESS] ${stripAnsi(input)}\n`)
	},
	info: (input: string) => {
		Sentry.addBreadcrumb({
			category: 'log',
			message: stripAnsi(input),
			level: 'info',
		})
		Lilith.msg(info(input))
		log.write(`[INFO] ${stripAnsi(input)}\n`)
	},
	error: (input: string) => {
		Sentry.addBreadcrumb({
			category: 'log',
			message: stripAnsi(input),
			level: 'info',
		})
		Lilith.msg(error(input))
		log.write(`[ERROR] ${stripAnsi(input)}\n`)
	},
	lilith: (input: string) => {
		Sentry.addBreadcrumb({
			category: 'log',
			message: stripAnsi(input),
			level: 'info',
		})
		Lilith.msg(lilith(input))
		log.write(`[LILITH] ${stripAnsi(input)}\n`)
	},
}

function ansiRegex({ onlyFirst = false } = {}) {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
	].join('|')

	return new RegExp(pattern, onlyFirst ? undefined : 'g')
}

function stripAnsi(string) {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``)
	}

	return string.replace(ansiRegex(), '')
}
