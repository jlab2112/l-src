import type { ParserOutput } from 'lexure'
import * as lexure from 'lexure'
import type { LilithClient } from '@/client'

export const commands: Map<string, CommandHandler> = new Map<string, CommandHandler>()

export function registerCommand(
	name: string,
	aliases: string[],
	handlers: {
		execute?: (client: LilithClient, raw: string, parsed: ParserOutput) => void
		completion?: (client: LilithClient, input: string) => string[]
	},
) {
	commands.set(name, handlers)
	aliases.forEach((alias) => commands.set(alias, handlers))
}

export interface CommandHandler {
	execute?: (client: LilithClient, raw: string, parsed: ParserOutput) => void
	completion?: (client: LilithClient, input: string) => string[]
}

export const LexureParser = {
	parseInput: (input: string): ParserOutput | null => {
		const lexer = new lexure.Lexer(input).setQuotes([
			['"', '"'],
			['“', '”'],
		])
		const res = lexer.lexCommand((s) => (s.startsWith('/') ? 1 : null))
		if (res == null) {
			return null
		}
		const tokens = res[1]()
		const parser = new lexure.Parser(tokens).setUnorderedStrategy(lexure.longStrategy())

		return parser.parse()
	},
}
