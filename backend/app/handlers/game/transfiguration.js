//@ts-check

//SECTION - transfiguration function
/*
	list of exports:
	-	makeTransfiguration:	transform a piece. 
								It can lead to checkMate. Ends the turn.
*/

import { Match } from "../../Classes/Chess/match.js";
import {error, paramCheck, Result, clientBoard} from "./utils.js";
import {endTurn} from "./endTurn.js";
import {checkMateCheckAll} from "../../GameLogic/checkMate.js";
import { DangerUpdate, updateBoostedChampions } from "../../utils/dangerUpdate.js";
import { Piece } from "../../Classes/Chess/Pieces/pieces.js";
import { checkKingDanger } from "../../utils/checkDanger.js";
import { enumNames, arrayNames } from "../../Macro/enums.js";
import { isOneOf } from "../../utils/string.js";
import { aiSpeech } from "../../Classes/Chess/AIprofiles/speech.js";
import { AI_EVENTS } from "../../Macro/macro.js";
import { zobristUpdateHash } from "../../utils/zobrist.js";

let	DEB = 0;

/**
 * 
 * @param {Match} match 
 * @param {string} from 
 * @param {string} to 
 */
function makeTransfiguration(match, from, to, sendBoardBool=true)
{
	let	result;

	result = new Result();
	if (!paramCheck(result, from, to))
		return (result);
	return (transfiguration(match, result, from, to));
}

/**
 * 
 * @param {Match} match
 * @param {Result} result
 * @param {string} coord
 * @param {string} newType
 */
function transfiguration(match, result, coord, newType, sendBoardBool=true)
{
	let	square;
	let	isBoostedBool;

	square = match.board.get(coord);
	if (!square || !square.piece)
		return (error(result, 400, `invalid coord ${coord}`), result);
	if (CheckTransfiguration(match, result, square.piece, coord, newType) == false)
		return (result);
	aiSpeech(match, AI_EVENTS.transformMe);
	match.history.UpdateTransform(match, square, coord, newType);
	zobristUpdateHash(match, match.history.Last());
	isBoostedBool = square.piece.isBoostedBool;
	square.piece = new Piece(newType, square.piece.pos, square.piece.team);
	square.piece.isBoostedBool = isBoostedBool;
	DangerUpdate(match, coord);
	if (isBoostedBool == true && newType == enumNames.CHAMPION)
		updateBoostedChampions(match, []);
	checkMateCheckAll(match, result);
	if (endTurn(match, false).specialMoves.CheckKingDanger())
		result.specialMoves.SetKingDanger();//@ts-ignore
	result.history = match.history.clientEvents[match.history.clientEvents.length - 1];
	result.status = 200;
	result.msg = "OK";
	if (sendBoardBool == true)//@ts-ignore
		result.board = clientBoard(match);
	return (result);
}

/**
 * 
 * @param {Match} match 
 * @param {Result} result 
 * @param {Piece} piece
 * @param {string} coord
 * @param {string} newType
 */
function CheckTransfiguration(match, result, piece, coord, newType)
{
	if (match.moves == 0)
		return (error(result, 403, `you should move before transform`));
	if (checkKingDanger(match) == true)
		return (error(result, 403, "Your king is in danger"));
	if (piece.type != enumNames.BASTARDS)
		return (error(result, 403, `currently, boosting pieces different by
		${enumNames.BASTARDS} is not allowed. However, this may be a cool idea.
		you should tell the developers to think about it.
		Maybe you should stop cheating too, if it possible`));
	if (match.cursor.EdgeCheck(match.currentPlayer.team, coord) == false)
		return (error(result, 403, `you must be on a edge to transform`));
	if (!isOneOf(newType, arrayNames))
		return (error(result, 403, `${newType} not in array "${arrayNames}"`));
	if (match.history.Last().to != piece.pos)
		return (error(result, 403, `That's too late to boost that bastard.`));
	if (newType == enumNames.KING)
		return (error(result, 403, `You can't create a new king.`));
	return (true);
}

export {makeTransfiguration};