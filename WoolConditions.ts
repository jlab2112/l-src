import config from '@/config.js'
import type { AutododgeNumericOptionHandler, StatsWithGamemode } from '../autododge.js'

interface Context {
	level: number
	star: number
	kdr: number
	wins: number
	losses: number
	wlr: number
	games: number
	assists: number
}

const context: (player: StatsWithGamemode) => Context = (player) => {
	const path = player.gamemode.split('.')
	return {
		level: player.stats.stats.general.networkLevel,
		star: player.stats.stats.woolgames.level,
		kdr: player.stats.stats.woolgames[path[1]].kdr,
		wins: player.stats.stats.woolgames[path[1]].wins,
		losses: player.stats.stats.woolgames[path[1]].losses,
		wlr: player.stats.stats.woolgames[path[1]].wlr,
		games: player.stats.stats.woolgames[path[1]].gamesPlayed,
		assists: player.stats.stats.woolgames[path[1]].assists,
	}
}

const woolConditions: AutododgeNumericOptionHandler[] = [
	{
		configPath: () => config().autododge.woolgames.level,
		value: (stats) => context(stats).level,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) is less than &c${config().autododge.woolgames.level.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) is higher than &c${config().autododge.woolgames.level.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) tests true for &c${config().autododge.woolgames.level.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.woolgames.star,
		value: (stats) => context(stats).star,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their star (&c${context(stats).star}&7) is less than &c${config().autododge.woolgames.star.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their star (&c${context(stats).star}&7) is higher than &c${config().autododge.woolgames.star.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their star (&c${context(stats).star}&7) tests true for &c${config().autododge.woolgames.star.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.woolgames.wins,
		value: (stats) => context(stats).wins,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins}&7) is less than &c${config().autododge.woolgames.wins.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins}&7) is higher than &c${config().autododge.woolgames.wins.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins}&7) tests true for &c${config().autododge.woolgames.wins.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.woolgames.losses,
		value: (stats) => context(stats).losses,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses}&7) is less than &c${config().autododge.woolgames.losses.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses}&7) is higher than &c${config().autododge.woolgames.losses.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses}&7) tests true for &c${config().autododge.woolgames.losses.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.woolgames.wlr,
		value: (stats) => context(stats).wlr,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr}&7) is less than &c${config().autododge.woolgames.wlr.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr}&7) is higher than &c${config().autododge.woolgames.wlr.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr}&7) tests true for &c${config().autododge.woolgames.wlr.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.woolgames.kdr,
		value: (stats) => context(stats).kdr,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their kill/death ratio (&c${context(stats).kdr}&7) is less than &c${config().autododge.woolgames.kdr.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their kill/death ratio (&c${context(stats).kdr}&7) is higher than &c${config().autododge.woolgames.kdr.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their kill/death ratio (&c${context(stats).kdr}&7) tests true for &c${config().autododge.woolgames.kdr.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.woolgames.games,
		value: (stats) => context(stats).games,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their current winstreak (&c${context(stats).games}&7) is less than &c${config().autododge.woolgames.games.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their current winstreak (&c${context(stats).games}&7) is higher than &c${config().autododge.woolgames.games.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their current winstreak (&c${context(stats).games}&7) tests true for &c${config().autododge.woolgames.games.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.woolgames.assists,
		value: (stats) => context(stats).assists,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their best winstreak (&c${context(stats).assists}&7) is less than &c${config().autododge.woolgames.assists.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their best winstreak (&c${context(stats).assists}&7) is higher than &c${config().autododge.woolgames.assists.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their best winstreak (&c${context(stats).assists}&7) tests true for &c${config().autododge.woolgames.assists.condition}&7.`,
		},
	},
]

export default woolConditions
