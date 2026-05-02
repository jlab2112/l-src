import config from '@/config.js'
import { addListener } from '@/events.js'
import type { PacketEvent } from '@/types/events'
import { Ids } from '@/types/packets/minecraft/ids.js'
import { type Play, writePacket } from '@/types/packets/minecraft/packets.js'
import { permission } from '@/utils/permissions.js'

addListener<PacketEvent<Play.toServer.ChatPacket>>(
	Ids.Play.toServer.chat,
	'toServer',
	'kaomoji',
	9,
	false,
	async ({ client, packet, setCancelled }) => {
		if (!permission('lilith.kaomojis') || !config().chat.kaomojis.enabled || !client.rank) return

		let kaomojis = []

		if (!client.rank.includes('MVP++')) kaomojis = kaomojis.concat(mvp)

		switch (client.giftingRewardsClaimed) {
			case 0:
			case 1: {
				kaomojis = kaomojis
					.concat(rankGifting.FIVE)
					.concat(rankGifting.TWENTY)
					.concat(rankGifting.FIFTY)
					.concat(rankGifting.HUNDRED)
					.concat(rankGifting.TWO_HUNDRED)
				break
			}
			case 2: {
				kaomojis = kaomojis
					.concat(rankGifting.TWENTY)
					.concat(rankGifting.FIFTY)
					.concat(rankGifting.HUNDRED)
					.concat(rankGifting.TWO_HUNDRED)
				break
			}
			case 3: {
				kaomojis = kaomojis.concat(rankGifting.FIFTY).concat(rankGifting.HUNDRED).concat(rankGifting.TWO_HUNDRED)
				break
			}
			case 4: {
				kaomojis = kaomojis.concat(rankGifting.HUNDRED).concat(rankGifting.TWO_HUNDRED)
				break
			}
			case 5: {
				kaomojis = kaomojis.concat(rankGifting.TWO_HUNDRED)
			}
		}

		if (config().chat.kaomojis.extra) kaomojis = kaomojis.concat(other)

		let message = packet.data.message.toString()

		for (let i = 0; i < kaomojis.length; i++) {
			if (message.toLowerCase().includes(kaomojis[i].text)) {
				message = message.replace(kaomojis[i].text, kaomojis[i].replacement)
			}
		}

		if (message === packet.data.message.toString()) return

		setCancelled(true)

		await writePacket<Play.toServer.ChatPacket>(client, 'toServer', {
			metadata: {
				name: 'chat',
				state: 'play',
				id: Ids.Play.toServer.chat,
			},
			data: {
				message: message,
			},
		})
	},
)

const mvp = [
	{ text: '<3', replacement: '❤' },
	{ text: ':star:', replacement: '✮' },
	{ text: ':yes:', replacement: '✔' },
	{ text: ':no:', replacement: '✖' },
	{ text: ':java:', replacement: '☕' },
	{ text: ':arrow:', replacement: '➜' },
	{ text: ':shrug:', replacement: '¯\\_(ツ)_/¯' },
	{ text: ':tableflip:', replacement: '(╯°□°）╯︵ ┻━┻' },
	{ text: 'o/', replacement: '( ﾟ◡ﾟ)/' },
	{ text: ':123:', replacement: '123' },
	{ text: ':totem:', replacement: '☉_☉' },
	{ text: ':typing:', replacement: '✎...' },
	{ text: ':maths:', replacement: '√(π+x)=L' },
	{ text: ':snail:', replacement: "@'-'" },
	{ text: ':thinking:', replacement: '(0.o?)' },
	{ text: ':gimme:', replacement: '༼つ◕_◕༽つ' },
	{ text: ':wizard:', replacement: "(''-')⊃━☆ﾟ.*･｡ﾟ" },
	{ text: ':pvp:', replacement: '⚔' },
	{ text: ':peace:', replacement: '✌' },
	{ text: ':oof:', replacement: 'OOF' },
	{ text: ':puffer:', replacement: "<('O')>" },
]
const rankGifting = {
	FIVE: [
		{ text: '^_^', replacement: '^_^' },
		{ text: ':cute:', replacement: '(✿◠‿◠)' },
	],
	TWENTY: [
		{ text: ':dab:', replacement: '<o/' },
		{ text: ':yey:', replacement: 'ヽ (◕◡◕) ﾉ' },
	],
	FIFTY: [
		{ text: ':dog:', replacement: '(ᵔᴥᵔ)' },
		{ text: ':dj:', replacement: 'ヽ(⌐■_■)ノ♬' },
	],
	HUNDRED: [
		{ text: ':cat:', replacement: '= ＾● ⋏ ●＾ =' },
		{ text: 'h/', replacement: 'ヽ(^◇^*)/' },
	],
	TWO_HUNDRED: [
		{ text: ':snow:', replacement: '☃' },
		{ text: ':sloth:', replacement: '(・⊝・)' },
	],
}

const other = [
	{ text: ':happy:', replacement: '(*^▽^*)' },
	{ text: ':love:', replacement: '(｡♥‿♥｡)' },
	{ text: ':excited:', replacement: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧' },
	{ text: ':cheers:', replacement: 'ヾ(⌐■_■)ノ♪' },
	{ text: ':blush:', replacement: '(⁄ ⁄•⁄ω⁄•⁄ ⁄)' },
	{ text: ':surprised:', replacement: '（・□・；）' },
	{ text: ':dance:', replacement: '~(˘▾˘~)' },
	{ text: ':wink:', replacement: '(^_-)' },
	{ text: ':cool:', replacement: '(⌐■_■)' },
	{ text: ':peace:', replacement: '✌(-‿-)✌' },
	{ text: ':sparkles:', replacement: '✨(⌒‿⌒)✨' },
	{ text: ':hug:', replacement: '(づ￣ ³￣)づ' },
	{ text: ':laugh:', replacement: '(*≧ω≦)' },
	{ text: ':oops:', replacement: '(⌒_⌒;)' },
	{ text: ':sigh:', replacement: '(-_-)' },
	{ text: ':dizzy:', replacement: '(⊙_☉)' },
	{ text: ':flirty:', replacement: '(◕‿◕✿)' },
	{ text: ':silly:', replacement: '(◔_◔)' },
	{ text: ':proud:', replacement: '(￣ω￣)' },
	{ text: ':joy:', replacement: '（＾ｖ＾）' },
	{ text: ':celebrate:', replacement: '٩(｡•́‿•̀｡)۶' },
	{ text: ':excited2:', replacement: '(ﾉ^_^)ﾉ' },
	{ text: ':surprised2:', replacement: '(ﾟロﾟ)' },
	{ text: ':sing:', replacement: '♪(๑ᴖ◡ᴖ๑)♪' },
	{ text: ':smug:', replacement: '(￣ω￣;)' },
	{ text: ':excited3:', replacement: '☆*:. o(≧▽≦)o .:*☆' },
	{ text: ':happy2:', replacement: '＼(＾▽＾)／' },
	{ text: ':flirt:', replacement: '( ˘ ³˘)♥' },
	{ text: ':party:', replacement: '┏(＾0＾)┛' },
	{ text: ':angry:', replacement: '(╬ Ò ‸ Ó)' },
	{ text: ':cry:', replacement: 'ಥ_ಥ' },
	{ text: ':blush2:', replacement: '(//∇//)' },
	{ text: ':surprised3:', replacement: '(°ロ°)' },
	{ text: ':wink2:', replacement: '(^_-)-☆' },
	{ text: ':excited4:', replacement: '٩(◕‿◕｡)۶' },
	{ text: ':happy3:', replacement: '(✿◠‿◠)' },
	{ text: ':cheeky:', replacement: '(￣ε￣＠)' },
	{ text: ':party2:', replacement: 'ヽ(´▽`)/' },
	{ text: ':angry2:', replacement: '(ꐦ ಠ皿ಠ )' },
	{ text: ':confused:', replacement: '(⊙_☉)' },
	{ text: ':cry2:', replacement: '╥﹏╥' },
	{ text: ':surprised4:', replacement: '(⊙ω⊙)' },
]
