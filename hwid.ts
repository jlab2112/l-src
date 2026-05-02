import { createHash } from 'node:crypto'
import { machineId } from 'node-machine-id'
import { networkInterfaces, users, uuid } from 'systeminformation'
import { SYSTEM } from '@/constants.js'

export let hwid: string

const isPhysical = (n: any) => !n.virtual
const isExternal = (n: any) => n.internal !== undefined && n.internal === false
const isOperating = (n: any) => n.operstate !== undefined && n.operstate === 'up'
const isNotIp4LoopbackOrDisconnected = (n: any) => n.ip4 !== '' && n.ip4 !== '127.0.0.1'
const isNotIp6LoopbackOrDisconnected = (n: any) => n.ip6 !== '' && n.ip6 !== '::1'

export async function loadHwid() {
	// hash with sha256
	const hash = createHash('sha256')

	const machineGuid = await machineId(true)
	hash.update(machineGuid)
	Lilith.log.info(machineGuid)

	const { hardware: hardwareGuid } = await uuid()
	hash.update(hardwareGuid)
	Lilith.log.info(hardwareGuid)

	if (SYSTEM() === 'windows' && hardwareGuid === '03000200-0400-0500-0006-000700080009') {
		let network = await networkInterfaces()

		if (Array.isArray(network))
			network = network.filter((n) => {
				return isPhysical(n) && isExternal(n) && isOperating(n) && (isNotIp4LoopbackOrDisconnected(n) || isNotIp6LoopbackOrDisconnected(n))
			})[0]

		if (network != null) {
			Lilith.log.info(network.mac)
			hash.update(network.mac)
		} else {
			const userData = await users()
			Lilith.log.info(users)
			if (userData != null && userData[0] != null) {
				hash.update(userData[0].user)
			}
		}
	}

	hwid = hash.digest('hex')
}
