// @ts-check

//SECTION - response functions
/*
	list of exports:
	-	jsonResponse:		object that formats an http success/error response.
	-	responseFormatter:	format response for /api/game and game websockets.
	-	jsonParser:			parse strings into js objects and viceversa.
*/

import { Match } from "../Classes/Chess/match.js";
import { Player } from "../Classes/Chess/player.js";
import { Result } from "../Classes/endPoint/result.js";
import { globals } from "../Classes/Globals/globals.js";
import { enumSpecialMoves, eTeam } from "../Macro/enums.js";
import { DEBUG_CURL, IS_CHILD_PROCESS } from "../Macro/macro.js";
import { roomMessage } from "../websocket/utils.js";
import { checkKingDanger } from "./checkDanger.js";

/**
 * 
 * @param {String} message
 */
const ResponseError = (message) => 
{
	return ({ "status": "error", "message": message});
}

/**
 * 
 * @param {Object} object
 */
const ResponseSuccess = (object) => {
	return ({ "status": "success", "data": object })
}

/**
 * 
 * @param {Match | null} match
 * @param {*} result the base object from which the response json is made
 * @param {String | null} msg 
 * @param {Number | null} status 
 * @returns {Result}
 * format frontend response as an object.
 * ? means the field is optional.
 * ```ts
 * {
 *      log: 
 * 		{
 *         msg: string;
 *         status: number;
 *     	};
 *      ?board: Board;
 * 		youWin: boolean;
 *      p1: Player;
 *      p2: Player;
 *      ?p3: Player;
 *      ?p4: Player;
 * }
 * ```
 */
function responseFormatter(match, result, msg, status)
{
	let	log;

	if (match)
	{
		formatPlayer(match, result);
	}
	if (result?.log && result.log.status && result.log.msg)
		log = result.log;
	else if (result && result.msg && result.status)
		log = {msg: result.msg, status: result.status};
	else
		log = {msg: msg, status: status};
	if (!log.status)
	{
		log.msg = "backend function failed for unknown reasons";
		log.status = 500;
	}
	if (!result)
		result = {};
	delete result.msg;
	delete result.status;
	if (!result.board)
	{
		result.board = new Map();//@ts-ignore
		result.ignoreBoard = true;
	}
	result.log = log;
	if (!result.victory)
		result.victory = match? match.victory: "";
	if (log.status != 200)
		result.log.msg = "Game Error: " + result.log.msg;
	result.match = null;
	delete result.match;
	if (result.specialMoves && match)
	{
		result.mask = result.specialMoves._mask;
		if (checkKingDanger(match))
			result.spreadDEMOCRACY = match?.currentPlayer.King;
		else if (checkKingDanger(match, match.currentPlayer.next))
			result.spreadDEMOCRACY = match?.NextPlayer().King;
	}
	return (result);
}

/**
 * 
 * @param {Match} match 
 * @param {*} result 
 */
function formatPlayer(match, result)
{
	if (match.settings.players.number == 2)
	{
		getPlayerData(match.white, result, 1, match.currentPlayer.team == eTeam.White);
		getPlayerData(match.black, result, 2, match.currentPlayer.team == eTeam.Black);
	}
	else if (match.settings.players.number == 4)
	{
		getPlayerData(match.yellow, result, 1, match.currentPlayer.team == eTeam.Yellow);
		getPlayerData(match.blue, result, 2, match.currentPlayer.team == eTeam.Blue);
		getPlayerData(match.red, result, 3, match.currentPlayer.team == eTeam.Red);
		getPlayerData(match.green, result, 4, match.currentPlayer.team == eTeam.Green);
	}
	else
		throw ("formatPlayer: bad player number");
}

/*
	p1: 
	{
		name: "pippo",
		nPoints: 0,
		bonusPointCounter: 0,//quando arriva a 4, nPoints++
		nPieces: 0,
		team: "Green",
		isPlaying: true || false,
	},
*/

/**
 * 
 * @param {Player} player 
 * @param {*} result 
 * @param {number} num
 * @param {boolean} isPlaying
 */
function getPlayerData(player, result, num, isPlaying)
{
	result[`p${num}`] =
	{
		name: player.ai? player.ai.profile : player.dbTable?.username,
		elo: player.dbTable?.points,
		nPoints: player.nPoints,
		bonusPointCounter: player.bonusPointCounter,
		nPieces: player.nPieces,
		team: player.team,
		time: player.time,
		isPlaying: isPlaying,
		title: player.dbTable?.title
	};
}

/**
 * this function is used by JSON to recursively parse Objects
 * this should not be called
 * @param {*} key 
 * @param {*} val 
 */
function _jsonParser(key, val)
{
	if (DEBUG_CURL == true)
		return (_jsonParserTester(key, val));
	return (_jsonParserFrontend(key, val));
}

/**
 * parser for the vue.js frontend
 * @param {*} key 
 * @param {*} val 
 */
function _jsonParserFrontend(key, val)
{
	if (val instanceof Set)
	{
		return [...val];
	}
	else if (val instanceof Map)
	{
		return Object.fromEntries(val);
	}
	else
		return (val);
}

/**
 * parser for internal backend testers
 * @param {string} key 
 * @param {object} val 
 * @returns 
 */
function _jsonParserTester(key, val)
{
	if (val instanceof Set)
		return ({ __type: "Set", data: [...val] });
	if (val instanceof Map)
		return ({ __type: "Map", data: [...val.entries()]});
	return (val);
}

/**
 * this function is used by JSON to create js objects from JSON strings
 * this should not be called
 * @param {string} key 
 * @param {*} val 
 * @returns 
 */
function _jsonReviver(key, val)
{
	if (val && val.__type == "Set")
		return (new Set(val.data));
	if (val && val.__type == "Map")
		return (new Map(val.data));
	return val;
}

/**
 * JSON does not support Maps, Sets. This function manages this
 * it stringify and then parse because Express calls stringify natively
 * so we need to parse it again (the RAM is happy)
 * @param {object | string} data a javascript object
 * @returns {object}
 * @example let dataForClient = jsonParser(data)
 */
function jsonParser(data)
{
	if (typeof(data) == "string")
		return (JSON.parse(data, _jsonReviver));
	else
		return (JSON.parse(JSON.stringify(data, _jsonParser, 2)));
}

/**
 * 
 * @param {*} key
 * @param {*} val
 */
function jsonSafeParse(key, val)
{
	if (typeof(val) == "bigint")
		return (`${val}`);
	return (val);
}

const jsonResponse = { ResponseError, ResponseSuccess };

/**
 * 
 * @param {string} event 
 * @param {string | number} matchId 
 * @param {*} data 
 */
function sendData(event, matchId=0, data=null)
{
	/** @type {import("../Classes/Globals/Child.js").ChildData} */
	let	childData;

	if (!IS_CHILD_PROCESS)
		return (roomMessage(`match_${matchId}`, `game`, data));
	childData = {ChildId: globals.childId, Event: event, MatchId: Number(matchId), Data: data};
	//@ts-ignore
	process.send(childData);
}

export { jsonResponse, jsonParser, responseFormatter, jsonSafeParse , sendData};
