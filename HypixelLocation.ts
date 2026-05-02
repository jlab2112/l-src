export interface HypixelLocation {
	serverName: string
	lobbyName?: string
	serverType?: 'SKYWARS' | 'WOOL_GAMES' | 'DUELS' | 'BEDWARS' | string
	mode?: string
	map?: string
}

// {"server":"dynamiclobby26G","gametype":"PROTOTYPE","lobbyname":"prototypelobby4"}
//{
//   version: 1,
//   serverName: 'mini30AK',
//   serverType: 'SKYBLOCK',
//   mode: 'dynamic',
//   map: 'Private Island'
// }
// {
//     version: 1,
//     serverName: 'dynamiclobby4G',
//     serverType: 'SKYWARS',
//     lobbyName: 'swlobby1'
// }
