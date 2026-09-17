// @ts-check

//SECTION - boost function
/*
	list of exports:
	-	boost:		boost a piece.
					It can lead to checkMate. Ends the turn.
*/

import {dangerUpdateAll, DangerUpdate} from "../../utils/dangerUpdate.js";
import {Match} from "../../Classes/Chess/match.js";
import {error, paramCheck, Result, clientBoard} from "./utils.js";
import { endTurn } from "./endTurn.js";
import {checkMateCheckAll} from "../../GameLogic/checkMate.js";
import { AI_EVENTS, BOOSTED_MAX, MOVEMENT_MIN } from "../../Macro/macro.js";
import { checkKingDanger } from "../../utils/checkDanger.js";
import { eEvents, enumNames } from "../../Macro/enums.js";
import { jsonParser } from "../../utils/response.js";
import { aiSpeech } from "../../Classes/Chess/AIprofiles/speech.js";
import { render } from "../../test/render.js";
import { zobristUpdateHash } from "../../utils/zobrist.js";

/** @typedef {import ('../../Classes/Chess/chessBoard.js').Square} Square  */

/**
 * 
 * @param {Match} match
 * @param {String} from
 * @returns {Result}
 */
function boost(match, from)
{
	let	result;

	result = new Result();
	if (!paramCheck(result, from))
		return (result);
	if (!tryBoost(match, result, from))
		return (result);
	result.status = 200;//@ts-ignore
	aiSpeech(match, AI_EVENTS.applyBoostMe, [match.board.get(from).piece?.type]);
	if (match.boost == BOOSTED_MAX)
	{
		if (match.history.moves >= 35252 && from == "g4" && match.board.get("e2").piece?.type == enumNames.MINOTAURUS)
		{
			render(match);
			console.log("BREAKPOINT");
		}
		checkMateCheckAll(match, result);
		if (endTurn(match, false).specialMoves.CheckKingDanger())
			result.specialMoves.SetKingDanger();//@ts-ignore
		result.history = match.history.clientEvents[match.history.clientEvents.length - 1];
	}
	//@ts-ignore
	result.board = clientBoard(match);
	result.match = match;
	return (result);
}

/**
 * 
 * @param {Match} match
 * @param {Result} result 
 * @param {String} from 
 * @returns {boolean}
 */
function tryBoost(match, result, from)
{
	let	square;
	let	tmp;

	if (match.boost >= BOOSTED_MAX || match.moves < MOVEMENT_MIN)
		return (error(result, 403, "You can't boost now"));
	if (checkKingDanger(match) == true)
		return (error(result, 403, "Your king is in danger"));
	square = match.board.get(from);
	if (!square?.piece)
		return (error(result, 403, "Nothing to be boosted in there man"));
	else if (square.piece.isBoostedBool == true)
		return (error(result, 403, "That piece is already boosted"));
	else if (square.piece.team != match.currentPlayer.team)
		return (error(result, 403, `it's ${match.currentPlayer.team} turn`));
	else if (square.piece.price > match.currentPlayer.nPoints)
		return (error(result, 403, `You need ${square.piece.price} to boost this`));
	if (match.currentPlayer.boostedPiece)
	{
		match.boostPriority.delete(match.currentPlayer.team);
		tmp = match.board.get(match.currentPlayer.boostedPiece);
		if (tmp?.piece)
			tmp.piece.isBoostedBool = false;
		DangerUpdate(match, match.currentPlayer.boostedPiece, false);
	}
	match.board.updates.add(from);
	match.boostPriority.add(match.currentPlayer.team);
	match.history.UpdateBoost(match, square, from);
	square.piece.isBoostedBool = true;
	match.currentPlayer.nPoints -= square.piece.price;
	zobristUpdateHash(match, match.history.Last());
	match.currentPlayer.boostedPiece = from;
	DangerUpdate(match, from, false);
	checkInluenceOfBoost(match, square);
	match.boost += 1;
	return (true);
}

/**
 * @param {Match} match
 * @param {string} from
 */
function fakeBoost(match, from)
{
	let	result = new Result(null, eEvents.SimulateBoost);
	let	square;
	let	player;
	let	prevBoost;

	if (!from)
		return (result.Error(`boost: coord from ${from} does not exist`, 400));
	if (!match.board.has(from))
		return (result.Error(`boost: coord from ${from} does not exist`));
	square = match.board.get(from);
	if (!square.piece)
		return (result.Error(`boost: there is no piece is ${from}...`));
	player = match.GetPlayer(square.piece.team);
	prevBoost = player.boostedPiece;
	square.piece.isBoostedBool = true;
	DangerUpdate(match, from);
	result.Success();
	// @ts-ignore
	result.zones = jsonParser(structuredClone(square.boostedTargetZones));
	square.piece.isBoostedBool = false;
	DangerUpdate(match, from);
	player.boostedPiece = prevBoost;
	return (result);
}

/**
 * 
 * @param {Match} match 
 * @param {Square} square 
 */
function checkInluenceOfBoost(match, square)
{
	let influenceZones;
	let influenced;
	let infPiece;

	influenceZones = structuredClone(square.influenceZones);
	for (let x of influenceZones)
	{
		influenced = structuredClone(match.board.influenceMap.get(x));
		if (!influenced)
			continue ;
		for (let y of influenced)
		{
			infPiece = match.board.get(y).piece;

			if (!infPiece)
				continue ;
			else if (infPiece.type == enumNames.KING)
				DangerUpdate(match, infPiece.pos);
		}
	}
}

export {boost, fakeBoost}; 