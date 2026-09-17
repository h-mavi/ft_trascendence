// @ts-check

//SECTION - history function
/*
	list of exports:
	-	historyRestore:	restores a match using a history file.
*/

import fs from "fs";
import {eEvents} from "../Macro/enums.js";
import {Match} from "../Classes/Chess/match.js";
import {HistoryEvent} from "../Classes/Chess/history.js";
import {move, boost, endTurn, init, error} from "../handlers/game/Game.js";
import { boardStringify, render } from "../test/render.js";
import { makeTransfiguration } from "../handlers/game/transfiguration.js";
import { prisma } from "../lib/prisma.js";
import { globals } from "../Classes/Globals/globals.js";
import { jsonParser } from "./response.js";
import { DEBUG } from "../Macro/macro.js";
import { Result } from "../Classes/endPoint/result.js";
import { initFromStr } from "../handlers/game/init.js";
import { isOneOf } from "./string.js";


/** @typedef {import ("../Classes/Chess/history.js").History} History */

let	DEBUGCounter = 0;
let	DEBUGEvent = "";

/** 
 * restores a match using a history file.
 * @param {Match} match
 * @param {string} path
 */
function historyRestore(match, path)
{
	/** @type {History} */
	let	history;
	let	buffer;

	if (path.endsWith(".json") == false)
		path += ".json";
	if (!path || !fs.existsSync(path))
		throw (`History, restore: path "${path}" invalid`);
	buffer = fs.readFileSync(path, "utf-8");
	history = JSON.parse(buffer);
	recreateMatch(match, history);
}

/** 
 * restores a match using a history file.
 * @param {number} matchId
 */
async function historyRestoreFromDb(matchId)
{
	/** @type {History} */
	let	history;

	const dbHistory = await prisma.matches.findUnique(
	{
		where:
		{
			id_match: Number(matchId)
		}
	});
	if (!dbHistory)
		return (new Result().Error(`match with id ${matchId} not found`, 400));
	//@ts-ignore
	history = jsonParser(dbHistory.history);
	//@ts-ignore
	history.matchId = matchId;
	try
	{
		recreateMatch(null, history, true);
	}
	catch(err)
	{
		return (new Result().Error(`match with id ${matchId} is invalid.\nError:\n${err}`, 500));
	}
	return (new Result().Success());
}

/** 
 * returns a board from specific matchId/moveId.
 * @param {{matchId: number, moveId: number, delBool?: boolean}} req 
 */
async function historyGetMatchState(req)
{
		let	matchId;
		let	moveId;
		let	result;
		let	msg = undefined;
		let	boardStr;

		if (!req)
			msg = "replay_game: missing req";
		else if (Number.isInteger(req?.matchId) == false)
			msg = "invalid matchId " + req?.matchId;
		else if (!req.delBool && Number.isInteger(req?.moveId) == false)
			msg = "invalid matchId " + req?.moveId;
		if (msg)
			return (new Result().Error(msg, 400));
		matchId = Number(req.matchId);
		if (req.delBool == true)
		{
			globals.matchCache.delete(String(matchId));
			return (new Result().Success());
		}
		moveId = Number(req.moveId);
		if (globals.matchCache.has(String(matchId)) == false)
		{
			result = await historyRestoreFromDb(matchId);
			if (result.status != 200)
				return (result);
		}
		if (moveId < 0)
			boardStr = globals.matchCache.get(String(matchId))?.at(0);
		else
			boardStr = globals.matchCache.get(String(matchId))?.at(moveId + 1);
		if (typeof(boardStr) != "string")
			return (new Result().Error(`moveId ${moveId} invalid`, 400));
		return (initFromStr(boardStr));
}

//SECTION - utils

/** 
 * restores a match using a history file/db query.
 * @param {Match | null} match
 * @param {History} history
 * @param {boolean} cacheMatchBool
 */
function recreateMatch(match, history, cacheMatchBool=false)
{
	let	result;
	let	playerNum;
	let	board;

	if (!match)
		match = new Match(history.matchSettings);
	else
		match.Reset(history.matchSettings);
	DEBUGCounter = 0;
	try
	{
		result = init(match, match.settings);//@ts-ignore
		match.id = history.matchId;
		if (cacheMatchBool == true)
			cacheMatchState(match);
		match.historyCreateBool = true;
		for (let event of history.events)
		{
			//@ts-ignore
			DEBUGEvent = event;
			playerNum = match.playerNum;
			console.log(`History: move number ${event.counter}`);
			if (event.error != true && isOneOf(event.type, eEvents.Move, eEvents.MoveBoost))
				event.pieceEaten = match.board.get(event.to).piece?.Copy();
			if (event.type == eEvents.Move)
				result = move(match, event.from, event.to, event.useBoostBool);
			else if (event.type == eEvents.MoveBoost)
				result = move(match, event.from, event.to, true);
			else if (event.type == eEvents.Boost)
				result = boost(match, event.from);
			else if (event.type == eEvents.Transform)
				result = makeTransfiguration(match, event.from, event.to);
			else if (event.type == eEvents.EndTurn)
			{
				result = endTurn(match);
				continue ;
			}
			else if (event.type == eEvents.GiveUp)
			{//@ts-ignore
				match.DeletePlayer(match[event.team]);
				result = new Result().Success();
			}
			else
				continue ;//@ts-ignore
			if (result.status != 200 && !event.error)
				throw (`${result.status}: ${result.msg}\n${JSON.stringify(event, null, 2)}`);//@ts-ignore
			else if (result.status == 200 && event.error == true)
			{
				if (cacheMatchBool && DEBUG)
					continue ;
				throw (`${result.status}: \n${JSON.stringify(event, null, 2)}`);
			}
			else if (result.status == 200)
			{
				if (cacheMatchBool == true)
					cacheMatchState(match);
				event.updates = new Set();
				if (result.board)
				{//@ts-ignore
					board = result.board.data? result.board.data : Object.keys(result.board);
					for (const coord of board)
						event.updates.add(Array.isArray(coord)? coord.at(0) : coord);
				}
				DEBUGCounter++;
			}
			else
				error(null, result, 0, null, false);			
			if (event.lastLost && playerNum == match.playerNum)
				throw(`player ${event.lastLost} should have lost. \nevent: ${JSON.stringify(event)}`);
			if (!event.lastLost && playerNum != match.playerNum)
				throw(`Invalid loss for a player. \nevent: ${JSON.stringify(event)}`);
			render(match);
			//NOTE - print di ogni risposta/richiesta
			// printResponse(match, event, result);
		}
		match.historyCreateBool = false;
		match.history.events = history.events;
		match.history.moves = history.moves;
	}
	catch(err)
	{
		DEBUGEvent = JSON.stringify(DEBUGEvent, null, 2);
		throw (`Move ${DEBUGEvent}: ${err}`);
	}
}

/**
 * 
 * @param {Match} match
 * @param {HistoryEvent} event 
 * @param {import("../Classes/endPoint/result.js").Result} result 
 */
function printResponse(match, event, result)
{
	console.debug("\x1b[33m");
	console.debug(JSON.stringify(event, null, 2));
	console.debug("\x1b[0m");
	console.debug("*--------------------*\n");
}

/** 
 * saves into the global cache the state of the match in a turn.
 * @param {Match} match
 */
function cacheMatchState(match)
{
	if (globals.matchCache.has(match.id.toString()) == false)
		globals.matchCache.set(match.id.toString(), new Array);
	globals.matchCache.get(match.id.toString())?.push(boardStringify(match, true));
}

export {historyRestore, historyRestoreFromDb, historyGetMatchState};