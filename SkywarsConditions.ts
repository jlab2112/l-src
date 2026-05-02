import config from '@/config.js'
import type { AutododgeNumericOptionHandler, StatsWithGamemode } from '../autododge.js'

interface Context {
	wins: number
	star: number
	level: number
	kdr: number
	losses: number
	wlr: number
}

const context: (player: StatsWithGamemode) => Context = (player) => {
	return {
		level: player.stats.stats.general.networkLevel,
		star: player.stats.stats.skywars.level,
		kdr: player.stats.stats.skywars.overall.kdr,
		wins: player.stats.stats.skywars.overall.wins,
		losses: player.stats.stats.skywars.overall.losses,
		wlr: player.stats.stats.skywars.overall.wlr,
	}
}

const skywarsConditions: AutododgeNumericOptionHandler[] = [
	{
		configPath: () => config().autododge.skywars.level,
		value: (stats) => context(stats).level,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) is less than &c${config().autododge.skywars.level.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) is higher than &c${config().autododge.skywars.level.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their level (&c${context(stats).level}&7) tests true for &c${config().autododge.skywars.level.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.skywars.star,
		value: (stats) => context(stats).star,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their star (&c${context(stats).star}&7) is less than &c${config().autododge.skywars.star.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their star (&c${context(stats).star}&7) is higher than &c${config().autododge.skywars.star.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their star (&c${context(stats).star}&7) tests true for &c${config().autododge.skywars.star.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.skywars.wins,
		value: (stats) => context(stats).wins,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins}&7) is less than &c${config().autododge.skywars.wins.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins}&7) is higher than &c${config().autododge.skywars.wins.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their total number of wins (&c${context(stats).wins}&7) tests true for &c${config().autododge.skywars.wins.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.skywars.losses,
		value: (stats) => context(stats).losses,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses}&7) is less than &c${config().autododge.skywars.losses.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses}&7) is higher than &c${config().autododge.skywars.losses.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their total number of losses (&c${context(stats).losses}&7) tests true for &c${config().autododge.skywars.losses.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.skywars.wlr,
		value: (stats) => context(stats).wlr,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr}&7) is less than &c${config().autododge.skywars.wlr.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr}&7) is higher than &c${config().autododge.skywars.wlr.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their win/loss ratio (&c${context(stats).wlr}&7) tests true for &c${config().autododge.skywars.wlr.condition}&7.`,
		},
	},
	{
		configPath: () => config().autododge.skywars.kdr,
		value: (stats) => context(stats).kdr,
		context,
		reasons: {
			lowest: (targetName, stats) =>
				`&c${targetName}&7 because their kill/death ratio (&c${context(stats).kdr}&7) is less than &c${config().autododge.skywars.kdr.lowest}&7.`,
			highest: (targetName, stats) =>
				`&c${targetName}&7 because their kill/death ratio (&c${context(stats).kdr}&7) is higher than &c${config().autododge.skywars.kdr.highest}&7.`,
			condition: (targetName, stats) =>
				`&c${targetName}&7 because their kill/death ratio (&c${context(stats).kdr}&7) tests true for &c${config().autododge.skywars.kdr.condition}&7.`,
		},
	},
]

export default skywarsConditions
