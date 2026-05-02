import chalk from 'chalk'

export const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.toLowerCase().slice(1)
}

export const getPerformance = (start: number) => {
	return chalk.yellow(`${(performance.now() - start).toFixed(2)}ms`)
}

export function dashedUUID(input: string): string {
	return `${input.substring(0, 8)}-${input.substring(8, 12)}-${input.substring(12, 16)}-${input.substring(16, 20)}-${input.substring(20)}`
}
