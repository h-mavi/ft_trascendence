// @ts-check

//SECTION - utils function
/*
	list of exports:
	-	clientBoard:	copies the board and adapts it to the frontend needs.
	-	paramChecks:	Checks if from/to are valid (used by game functions).
	-	checkMateAlert:	Notifies that a player has won.
	-	error:			Sets a response to error, before sending it to frontend.
	-	normifyRequest:	Modify a request, to adapt it to backend syntax.
*/

import { Square, copyBoard } from "../../Classes/Chess/chessBoard.js";
import {Result} from "../../Classes/endPoint/result.js";
import {jsonParser} from "../../utils/response.js";
import {coordNormify} from "../../Classes/Chess/cursor.js";
import { enumNames } from "../../Macro/enums.js";
import { DEBUG_CURL } from "../../Macro/macro.js";
import { isDangerous } from "../../utils/checkDanger.js";

/** @typedef {import("../../Classes/Chess/match.js").Match} Match*/
/** @typedef {import("../../Classes/Chess/cursor.js").Cursor} Cursor*/
/** @typedef {Map<String, Square>} Board */

//SECTION - Board manipulation
//			useful to send filtered content to clients

/**
 * generate a copy of a board without dangerZones and other useless info
 * @param {Match} match
 * @param {boolean} copyAll if false copies only updates, else copy all
 * @param {boolean} avoidReset if true, avoid resetting the update array 
 * @returns {Object | null} a regular Object is returned. JSON does not support Map
 */
function clientBoard(match, copyAll=false, avoidReset=false)
{
	let	src;
	let	dest;

	if (match.aiSimulation == true)
		return (match.board.updates.clear(), null);
	src = match.board._data;
	if (copyAll == true)
		dest = copyBoard(src, null, match);
	else
		dest = copyOnlyBoardUpdates(match);
	if (avoidReset == false)
		match.board.updates.clear();
	modifyBoard(dest);
	return (jsonParser(dest));
}

/**
 * perform a deep copy only on the squares useful for client:
 * 1. the from, to square;
 * 2. the square from the dangerZone of from and to.
 * @param {Board} src the board to copy
 * @param {Array<string>} selected the squares to swap
 * @returns {Board}
 */

/**
 * perform a deep copy only on the squares useful for client:
 * 1. the from, to square;
 * 2. the square from the dangerZone of from and to.
 * @param {Match} match 
 * @returns 
 */
function copyOnlyBoardUpdates(match)
{
	let	src;
	let	newBoard;
	let	square;

	src = match.board;
	newBoard = new Map();
	for (const coord of match.board.updates)
	{
		square = src.get(coord);
		if (square.piece?.type == enumNames.KING && !DEBUG_CURL && match)
		{
			square = square.Copy();
			for (let x of square.targetZones)
			{//@ts-ignore
				if (isDangerous(match, match?.board.get(x).dangerZones, square.piece.team))
					square.targetZones.delete(x);
			}
		}
		newBoard.set(coordNormify(coord), new Square(square, coordNormify));
	}
	return (newBoard);
}

/** @typedef {{from: string, to: string, type: string, draw: boolean}} RequestBody*/

/**
 * 
 * @param {Cursor} cursor 
 * @param {RequestBody} body 
 */
function normifyRequest(cursor, body)
{
	if (body.type == "init")
		return body;
	body.type = body.type.toLocaleLowerCase();
	if (body.from && typeof(body.from) == "string")
		body.from = cursor.Normify(body.from);
	if (body.to && typeof(body.to) == "string" && body.to.length == 3)
		body.to = cursor.Normify(body.to);
	return (body);
}

/**
 * 
 * @param {Board} copiedBoard
 */
function modifyBoard(copiedBoard)
{
	for (const [pos, square] of copiedBoard)
	{
		// @ts-ignore
		delete (square).dangerZones;
		// @ts-ignore
		delete (square).influenceZones;
		// @ts-ignore
		if (!square.piece)
			continue ;
		// @ts-ignore
		delete (square).piece.moveArray;
		// @ts-ignore
		delete (square).piece?.moveCount;
		// @ts-ignore
		delete (square).piece?.multipleMovesBool;
		// @ts-ignore
		delete (square).piece?.moveLongRangeDEBUG;
		// @ts-ignore
		delete (square).piece?.pos;
	}
}

//SECTION - game error management utils

/**
 * check the validity of the input received by the move function.
 * @param {Result} result 
 * @param {String | undefined} from optional: if passed, checks if it's valid
 * @param {String | undefined} to optional: if passed, checks if it's valid
 * @returns {boolean} true if success, false if failure
 */
function paramCheck(result, from="ignoreCheck", to="ignoreCheck")
{
	if (!from)
		return (error(result, 400, `invalid param from "${from}"`));
	if (!to)
		return (error(result, 400, `invalid param from "${to}"`));
	return (true);
}

/**
 * 
 * @param {Result} result 
 * @param {Number} status 
 * @param {String} msg 
 * @returns {boolean} always return false
 */
function error(result, status, msg)
{
	result.msg = msg;
	result.status = status;
	result.log = {msg: msg, status: status};
	return (false);
}

/**
 * 
 * @param {Result} result 
 * @param {string} team
 * @returns {Result}
 */
function checkMateAlert(result, team="")
{
	result.status = 200;
	result.msg = `Player ${team} has won!!!`
	return (result);
}

export {Result, clientBoard, paramCheck, checkMateAlert, error, normifyRequest};