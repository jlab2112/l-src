import type { LilithUserResponse } from '@lilithmod/types/api'
import chalk from 'chalk'
import { compareVersions } from 'compare-versions'
import jwt from 'jsonwebtoken'
import sfetch from 'sync-fetch'
import { API_URL } from '@/constants.js'
import log, { lc } from '@/log.js'

const publicKey =
	'-----BEGIN PUBLIC KEY-----\n' +
	'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA30p9iiPljzvyohC6brgM\n' +
	'dSCp4kFEUphQF8Ggzf5BGgBlk1BRp8AjsgHBqNTppVuJci6ASUNSUL7iBe+eEKiU\n' +
	'YIDzOlQVyz60/YDp/ZtiyDUQkHLVQrXdrvg9KcA+/lfkMrMqUfQcc0lV0yKl5Xg4\n' +
	'rJKEqR7FbWbdgjKH60zmk3HEfovmDP4gkz3hMt18Ql2WEXtayb0tnyf82OEbcLyW\n' +
	'qTTeKvcBA8DPHHksxmMEfZkF7m8PJTfe2hj4P13cqIweH3GxiWnTPXD3m5oMR76n\n' +
	'y2AHKPBog+qSt0XFLGd69l0Cn4Gz3Gj/heslkwZAC3XzR38288LhUjsb2n1/U1jO\n' +
	'xQIDAQAB\n' +
	'-----END PUBLIC KEY-----'
const verifyOptions = {
	issuer: 'Lilith',
	subject: 'lilith-client',
	audience: 'https://api.lilith.rip',
	expiresIn: '24h',
	algorithm: 'RS256',
}

let currentUserInfo: LilithUserResponse = null
let outOfDate = false
let outOfDateMessage = ''

export function setOutOfDate(message: string) {
	outOfDate = true
	outOfDateMessage = message
}

export function isOutOfDate(): {
	outOfDate: boolean
	outOfDateMessage: string
} {
	return {
		outOfDate,
		outOfDateMessage,
	}
}

export function setCachedInfo(info: LilithUserResponse) {
	if (!('permissions' in info) && currentUserInfo != null && 'permissions' in currentUserInfo) {
		;(<any>info).permissions = currentUserInfo.permissions
	}

	currentUserInfo = info
}

export function getCachedInfo(): LilithUserResponse {
	return currentUserInfo
}

export function getVersion(version: string): {
	result: number
	version: string
	manifest: LilithVersionManifest
} {
	const versionInfo: LilithVersionManifest = sfetch(`${API_URL}/versions/latest`).json()
	return {
		result: compareVersions(versionInfo.version, version),
		version: versionInfo.version,
		manifest: versionInfo,
	}
}

export function checkHwid(hwid: string, verify = false, _quiet = false): boolean {
	try {
		const response = sfetch(`${API_URL}/account/login/${hwid}?withPermissions=true`).json()
		let decoded = <LilithUserResponse | LilithHwidFailure>jwt.verify(response.user_data, publicKey, verifyOptions)

		if (decoded.licensed) {
			decoded = {
				...decoded,
			}
			currentUserInfo = decoded
			// if (!quiet) log.raw(`${chalk.green('Authorized')} ${chalk.gray('>')} ${chalk.white.bold(decoded.discord)}`, 'STARTUP')
			return true
		}
		if (!verify) return false
		const url: string = (decoded as any).verifyUrl
		log.raw(
			lc.yellow('Verify hardware') +
				lc.black('»') +
				lc.aqua.underline(`${API_URL}/account/auth/${url.substring(url.lastIndexOf('/') + 1)}`),
			'STARTUP',
		)
	} catch (e) {
		log.raw(`${lc.red('Error')} ${lc.black('»')} ${chalk.white(e.toString())}`, 'STARTUP')
		process.exit(0)
	}

	//open((decoded as any).verifyUrl)
}

export interface Profile {
	accessToken?: string
	eligibleForMigration: boolean
	hasMultipleProfiles: boolean
	legacy: boolean
	localId: string
	minecraftProfile: {
		id: string
		name: string
	}
	persistent: boolean
	remoteId: string
	type: 'Mojang' | 'Xbox'
	userProperties: any[]
	username: string
}

export interface LilithVersionManifest {
	version: string
	name: string
	changelog: {
		features: string[]
		fixes: string[]
	}
	download: {
		windows: string
		macos: string
		linux: string
	}
}

export type LilithHwidFailure = {
	licensed: false
	verifyUrl: string
	meta: {
		time: string
	}
}

export interface LilithUserError {
	error: string
	meta: {
		time: string
	}
}

export interface AccessTokenResponse {
	access_token: string
}

// export type UserPermissions = Partial<Record<LilithPermission, boolean>>
// export type LilithPermission = typeof LilithPermissions[number]
//
// export const LilithPermissions = [
//     'lilith.bypass.lunar',
//     'lilith.bypass.lunar.hitreg',
//     'lilith.bypass.lunar.xray',
//     'lilith.bypass.badlion',
//     'lilith.bypass.forge',
//     'lilith.log_chat',
//     'lilith.remote_host',
//     'lilith.local_host',
//     'lilith.local_port',
//     'lilith.queuestats',
//     'lilith.queuestats.self',
//     'lilith.queuestats.party',
//     'lilith.queuestats.external',
//     'lilith.queuestats.chat',
//     'lilith.queuestats.tab',
//     'lilith.queuestats.duels',
//     'lilith.queuestats.bedwars',
//     'lilith.queuestats.skywars',
//     'lilith.queuestats.wool',
//     'lilith.denicker.local',
//     'lilith.denicker.remote',
//     'lilith.autododge',
//     'lilith.autododge.requeue',
//     'lilith.autododge.custom_lobby',
//     'lilith.autododge.nicks',
//     'lilith.autododge.conditions',
//     'lilith.autododge.players.whitelist',
//     'lilith.autododge.players.blacklist',
//     'lilith.autododge.maps.whitelist',
//     'lilith.autododge.maps.blacklist',
//     'lilith.autododge.duels',
//     'lilith.autododge.bedwars',
//     'lilith.autododge.skywars',
//     'lilith.autododge.wool',
//     'lilith.commands.assets',
//     'lilith.commands.autododge',
//     'lilith.commands.lconfig',
//     'lilith.commands.fakechat',
//     'lilith.commands.limbo',
//     'lilith.commands.lunarcosmetics',
//     'lilith.commands.cnh',
//     'lilith.commands.lnick',
//     'lilith.commands.rq',
//     'lilith.commands.lresetauth',
//     'lilith.commands.sc',
//     'lilith.commands.status',
//     'lilith.autogg',
//     'lilith.autogg.requeue',
//     'lilith.lunar.spoof',
//     'lilith.assets.patterns',
//     'lilith.assets.locations',
//     'lilith.assets.gamemodes',
//     'lilith.assets.themes',
//     'lilith.modding.load',
//     'lilith.modding.load.untrusted'
// ] as const
