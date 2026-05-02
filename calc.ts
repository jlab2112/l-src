import jexl from 'jexl'
import { registerCommand } from '@/commands/handler'
import { chat } from '@/utils/chat'

/**
 * Filename: calc.mdx
 * Command: calc
 * Byline: Evaluate a math equation.
 * Usage: `/calc <equation>`
 * Aliases: calculate
 * Added: Version 1.1.0
 *
 * Description:
 * This command will calculate a complex math expression. Expressions are evaluated using the [Jexl](https://github.com/TomFrost/Jexl) library.
 * For a list of supported math operations, see Jexl's list [here](https://github.com/TomFrost/Jexl#binary-operators).
 */

registerCommand('calc', ['calculate'], {
	execute: async (client, raw) => {
		const arg = raw.substring(raw.indexOf(' ') + 1)
		if (!arg) return chat(client, '&cLilith &8> &7Please provide an expression to calculate!')

		jexl.eval(arg)
			.then((r) => chat(client, `&cLilith &8> &7${arg} &8= &7${r}`))
			.catch((reason) => chat(client, `&cLilith &8> &7Calculation failed: ${reason}!`))
	},
})
