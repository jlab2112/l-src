import { registerCommand } from '@/commands/handler'
import { chat } from '@/utils/chat'

/**
 * Filename: coinflip.mdx
 * Command: coinflip
 * Byline: Flip a coin.
 * Usage: `/coinflip`
 * Aliases: cf
 * Added: Version 1.1.0
 *
 * Description:
 * This command will flip a coin and tell you whether it landed on heads or tails.
 */

function coinflip() {
	return Math.random() < 0.5 ? 'HEADS' : 'TAILS'
}

const headsMessages = [
	'It was &cheads&7!',
	'&cHeads&7!',
	'You flipped a head!',
	'It landed on &cheads&7!',
	'The coin landed on &cheads&7!',
	'&cHeads&7 up!',
	'&cHeads&7 it is!',
	"It's &cheads&7!",
	'You got &cheads&7!',
]

const tailsMessages = [
	'It was &ctails&7!',
	'&cTails&7!',
	'You flipped a tail!',
	'It landed on &ctails&7!',
	'The coin landed on &ctails&7!',
	'&cTails&7 up!',
	'&cTails&7 it is!',
	"It's &ctails&7!",
	'You got &ctails&7!',
]

registerCommand('coinflip', ['cf'], {
	execute: async (client) => {
		const result = coinflip()
		if (result === 'HEADS') {
			return chat(client, `&cLilith &8> &7${headsMessages[Math.floor(Math.random() * headsMessages.length)]}`)
		}
		return chat(client, `&cLilith &8> &7${tailsMessages[Math.floor(Math.random() * tailsMessages.length)]}`)
	},
})
