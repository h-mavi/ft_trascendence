//@ts-check

/**
 * @enum {string}
 */
const eTeam = 
{
	Black: 'black',
	White: 'white',
	Red: 'red',
	Blue: 'blue',
	Green: 'green',
	Yellow: 'yellow',
};

const eEvents = 
{
	Move: 'move',
	MoveBoost: 'moveboost',
	Boost: 'boost',
	EndTurn: `endturn`,
	Transform: 'trans',
	GiveUp: 'giveup',
	Draw: 'draw',
	SimulateBoost: "simulate_boost"
};

const eChildEvents =
{
	Init: "init",
	CreateMatch: "create_ai_match",
	Game: "game",
	GameMsg: "gameMsg",
	Error: "Errore",
	Log: "log"
};

const eMatchPresets =
{
	ClassicTwoPlayers: "1v1",
	ClassicFourPlayers: "2v2",
	ClassicFreeForAll: "1v1v1v1",
	NoCornersFourPlayers: "14x14x4",
};

/**
 * @enum {number}
 */
const enumValues = {
	KING: 0,
	CHAMPION: 10,
	MINOTAURUS: 5,
	JESTER: 5,
	VALKIRYA: 3,
	BASTARDS: 1
};

/**
 * @enum {string}
 */
const enumNames = {
	KING: 'King',
	CHAMPION: 'Champion',
	MINOTAURUS: 'Minotaurus',
	JESTER: 'Jester',
	VALKIRYA: 'Valkirya',
	BASTARDS: 'Bastards',
	MAGE: 'Mage',
	GHOUL: 'Ghoul'
};

/**
 * @enum {string}
 */
const enumNamesTransform = {
	CHAMPION: 'Champion',
	MINOTAURUS: 'Minotaurus',
	JESTER: 'Jester',
	VALKIRYA: 'Valkirya'
};

const enumNamesDoubleMove =
{
	CHAMPION: 'Champion',
	MINOTAURUS: 'Minotaurus',
	BASTARD: "Bastards"
};

const arrayNames = Object.values(enumNames);
const arrayNamesTransform = Object.values(enumNamesTransform);
const arrayNamesDoubleMove = Object.values(enumNamesDoubleMove);

const enumConnection = 
{
	PRIVATE: 'private',
	FRIENDLY: 'friendly',
	RANKED: 'ranked',
	ARENA: 'arena',
	TOURNAMENT: 'tournament'
};

const enumSocketState =
{
	MATCHMAKING: "matchMaking",
	PLAYING: "playing",
	WATCHING: "watching",
	WAITING: "waiting",
	PLAYING_TOURNAMENT: "playing_tournament",
	JOIN_TOURNAMENT: "join_tournament",
	NAVIGATING: "navigating"
};

const enumInitNames = 
{
	KING: 'K',
	CHAMPION: 'C',
	MINOTAURUS: 'M',
	JESTER: 'J',
	VALKIRYA: 'V',
	BASTARDS: 'B',
	MAGE: 'W',
	GHOUL: 'G'
};

const arrayInitNames = Object.values(enumInitNames);

const enumInitTeam = 
{
	Black: 'b',
	White: 'w',
	Red: 'r',
	Blue: 'b',
	Green: 'g',
	Yellow: 'y',
};

const arrayInitTeam = Object.values(enumInitTeam);

/** @param {string} team */
function getInitialOfTeam(team)
{
	switch (team)
	{
		case (eTeam.Black): case (eTeam.Blue):
			return (enumInitTeam.Black);
		case (eTeam.Green):
			return (enumInitTeam.Green);
		case (eTeam.Red):
			return (enumInitTeam.Red);
		case (eTeam.White):
			return (enumInitTeam.White);
		case (eTeam.Yellow):
			return (enumInitTeam.Yellow);
		default:
			throw (`getInitialOfTeam: ${team} unknown`);		
	}
}

/** 
 * 
 * @param {string} initial 
 * @param {number} nPlayer
 * */
function getTeamByInitial(initial, nPlayer)
{
	if (nPlayer != 2 && nPlayer != 4)
		throw ("getTeamByInitial: invalid nPlayer number.");
	switch (initial)
	{
		case (enumInitTeam.Black): case (enumInitTeam.Blue):
			if (nPlayer == 2)
				return (eTeam.Black);
			else
				return(eTeam.Blue);
		case (enumInitTeam.Green):
			return (eTeam.Green);
		case (enumInitTeam.Red):
			return (eTeam.Red);
		case (enumInitTeam.White):
			return (eTeam.White);
		case (enumInitTeam.Yellow):
			return (eTeam.Yellow);
		default:
			throw (`getTeamByInitial: ${initial} unknown`);		
	}
}

const enumSpecialMoves =
{
	NONE: 0,
	CASTLING: 1 << 0,
	TRANSFIGURATION: 1 << 1,
	ENDGAME: 1 << 2,
	CHECK: 1 << 3,
	CHECKMATE: 1 << 4,
	SNIPER: 1 << 5,
	ISBASTARD: 1 << 6,
	EATENBASTARD: 1 << 7,
	CHAMPIONBOOST: 1 << 8,
	DRAW: 1 << 9,
	ALLYGUARDIAN: 1 << 10,
	USEDBOOST: 1 << 11
}

const kingMovements = 
[
	{dx:1, dy:1}, {dx:-1, dy:-1},//obliquo
	{dx:-1, dy:1}, {dx:1, dy:-1},
	{dx:0, dy:1}, {dx:0, dy:-1},//verticale
	{dx:1, dy:0}, {dx:-1, dy:0},//orizzontale
];

const AIprofiles = 
{
	FIRST_AI: "First",
	GMU: "GMU(Generale Matsuda Usushi)",
	DEBUG: "Debug",
	AM: "AM",
	HAL9000: "HAL9000",
	GRIEVOUS: "Grievous",
	BASTARD: enumNames.BASTARDS
}

const AIprofilesArray = Object.values(AIprofiles);

const EloTitle =
{
	1: enumNames.BASTARDS,
	500: enumNames.VALKIRYA,
	800: enumNames.MINOTAURUS,
	1000: enumNames.JESTER,
	1200: enumNames.CHAMPION,
	1400: enumNames.KING,
	1600: "Emperor"
}

const EloTitleMap = Object.entries(EloTitle);

/**
 * 
 * @param {number} elo 
 */
function getEloTitle(elo)
{
	let ret = EloTitle[1];

	for (const [range, title] of EloTitleMap)
	{
		if (elo > Number(range))
			ret = title;
		else
			break ;
	}
	return ret;
}

export {eTeam, eEvents, eChildEvents, eMatchPresets, enumNames, arrayNames, arrayNamesTransform, arrayNamesDoubleMove, enumInitNames, arrayInitNames, getInitialOfTeam, enumInitTeam, arrayInitTeam, enumValues, enumSpecialMoves, kingMovements, enumConnection, enumSocketState, getTeamByInitial, AIprofiles, AIprofilesArray, getEloTitle};