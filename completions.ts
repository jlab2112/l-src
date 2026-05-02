import type { LilithClient } from '@/client.js'

export function completions(list: string[]): (client: LilithClient, input: string) => string[] {
	return (_client, input) => {
		const lastArg = input.substring(input.lastIndexOf(' ') + 1)
		return list.filter((n) => n.startsWith(lastArg))
	}
}

export function playerCompletions(client, input) {
	return completions(client.players.map((p) => p.name))(client, input)
}
