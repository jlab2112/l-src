import os from 'node:os'

export function injectionSupported() {
	const supportedPlatforms = {
		win32: ['x64'],
	}

	return supportedPlatforms[os.platform() as keyof typeof supportedPlatforms]?.includes(os.arch()) ?? false
}

export const useInjection = () => injectionSupported() && process.argv.includes('--injection')
