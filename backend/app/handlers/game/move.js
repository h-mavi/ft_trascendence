// @ts-check

//SECTION - move function
/*
	list of exports:
	-	move:		Move a piece. It can lead to a checkMate/endTurn.
					if boostBool is true and checks succeed, the boost is used. 
*/

import {MOVEMENT_MIN} from "../../Macro/macro.js";
import {Match} from "../../Classes/Chess/match.js";
import {paramCheck, Result, clientBoard} from "./utils.js";
import {endTurn} from "./endTurn.js";
import {checkMateCheckAll} from "../../GameLogic/checkMate.js";
import {updateChessboard} from "../../GameLogic/moveLogic.js";
import {enumNames} from "../../Macro/enums.js";
import { checkMove, checkSecondMove } from "../../GameLogic/checkMove.js";
import { render } from "../../test/render.js";
import { zobristUpdateHash } from "../../utils/zobrist.js";

/** @typedef {import('../../Classes/Chess/chessBoard.js').Square} Square */

/**
 * Move a piece. It can lead to a checkMate/endTurn.
 * if boostBool is true and checks succeed, the boost is used. 
 * @param {Match} match
 * @param {String} from the piece to move's coords
 * @param {String} to the new piece location's coords
 * @param {boolean} boostBool player wants to use a boost?
 * @returns {Result}
 */
function move(match, from, to, boostBool=false)
{
	let	result;
	let secondMoveBool = false;

	result = new Result();
	result.match = match;
	if (!paramCheck(result, from, to))
		return (result);
	if (!checkMove([from, to], result, match, boostBool))
		return (result);
	if (match.board.get(from).piece?.type != enumNames.BASTARDS && match.board.get(from).piece == null)
		++match.spareCountDown;
	else
		match.spareCountDown = 0;
	if (!updateChessboard([from, to], result, match, boostBool))
		return (result);
	zobristUpdateHash(match, match.history.Last());
	result.status = 200;
	checkMateCheckAll(match, result);//@ts-ignore
	result.board = clientBoard(match);
	secondMoveBool = checkSecondMove(match, [from, to]);
	if ((match.moves >= MOVEMENT_MIN && !match.currentPlayer.nPoints) && !(secondMoveBool || boostBool) && 
	!(match.cursor.EdgeCheck(match.currentPlayer.team, to) && match.board.get(match.cursor.square)?.piece?.type == enumNames.BASTARDS))
	{
		if (endTurn(match, false).specialMoves.CheckKingDanger())
			result.specialMoves.SetKingDanger();//@ts-ignore
		result.history = match.history.clientEvents[match.history.clientEvents.length - 1];
	}
	return (result);
}

export {move};