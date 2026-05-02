import get from 'lodash.get'
import config from '@/config.js'
import type { AutododgeNumericOptionHandler, StatsWithGamemode } from '../autododge'

interface Context {
	wins: () => number
	level: number
	losses: () => number
	wlr: () => number
	kills: () => number
	gamesPlayed: () => number
}

const context: (player: StatsWithGamemode) => Context = (player) => {
	return {
		level: player.stats.stats.general.networkLevel,
		wins: () => {
			return get(player.stats, `stats.${player.gamemode}.wins`)
		},
		losses: () => {
			return get(player.stats, `stats.${player.gamemode}.losses`)
		},
		wlr: () => {
			return get(player.stats, `stats.${player.gamemode}.wlr`)
		},
		kills: () => {
			return get(player.stats, `stats.${player.gamemode}.kills`)
		},
		gamesPlayed: () => {
			return get(player.stats, `stats.${player.gamemode}.gamesPlayed`)
		},
	}
}

const mmConditions: AutododgeNumericOptionHandler[] = [
	{
		configPath: () => config().autododge.murdermystery.level,
		value: (stats) => context(stats).level,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) is less than &c${config().autododge.murdermystery.level.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) is higher than &c${config().autododge.murdermystery.level.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) tests true for &c${config().autododge.murdermystery.level.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.murdermystery.kills,
		value: (stats) => context(stats).kills,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because total number of kills (&c${context(stats).kills}&7) is less than &c${config().autododge.murdermystery.kills.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because total number of kills (&c${context(stats).kills}&7) is higher than &c${config().autododge.murdermystery.kills.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because total number of kills (&c${context(stats).kills}&7) tests true for &c${config().autododge.murdermystery.kills.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.murdermystery.wins,
		value: (stats) => context(stats).wins(),
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins()}&7) is less than &c${config().autododge.murdermystery.wins.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins()}&7) is higher than &c${config().autododge.murdermystery.wins.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins()}&7) tests true for &c${config().autododge.murdermystery.wins.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.murdermystery.losses,
		value: (stats) => context(stats).losses(),
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses()}&7) is less than &c${config().autododge.murdermystery.losses.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses()}&7) is higher than &c${config().autododge.murdermystery.losses.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses()}&7) tests true for &c${config().autododge.murdermystery.losses.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.murdermystery.wlr,
		value: (stats) => context(stats).wlr(),
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr()}&7) is less than &c${config().autododge.murdermystery.wlr.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr()}&7) is higher than &c${config().autododge.murdermystery.wlr.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr()}&7) tests true for &c${config().autododge.murdermystery.wlr.condition}&7.`,
		},
	},
]

export default mmConditions
