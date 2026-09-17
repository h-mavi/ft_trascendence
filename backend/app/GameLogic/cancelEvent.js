//@ts-check

import { HistoryEvent } from "../Classes/Chess/history.js";
import { Piece } from "../Classes/Chess/Pieces/pieces.js";
import { Result } from "../Classes/endPoint/result.js";
import { eEvents, enumNames, enumSpecialMoves } from "../Macro/enums.js";
import { MOVEMENT_BONUS_POINT } from "../Macro/macro.js";
import { boardStringify } from "../test/render.js";
import { DangerUpdate, updateBoostedChampions } from "../utils/dangerUpdate.js";
import { isOneOf } from "../utils/string.js";
import { zobristPieceHash, zobristUpdateHash } from "../utils/zobrist.js";
import { setTimerGame } from "./timer.js";

/** @typedef {import("../Classes/Chess/match.js").Match} Match */

/**
 * 
 * @param {Match} match 
 */
export function cancelEvent(match)
{
	let	lastEvent;
	let	errorMsg;

	if (match.history.events.length == 0)
		return (new Result().Error("Cannot cancel: nothing happened yet", 409));
	if (match.aiSimulation == false)
		console.log("behold an unthinkable present...");
	lastEvent = match.history.Last();
	if (isOneOf(lastEvent.type, eEvents.Move, eEvents.MoveBoost))
		errorMsg = cancelMove(match, lastEvent);
	else if (lastEvent.type == eEvents.Boost)
		errorMsg = cancelBoost(match, lastEvent);
	else if (lastEvent.type == eEvents.EndTurn)
		errorMsg = cancelEndTurn(match);
	else if (lastEvent.type == eEvents.GiveUp)
		errorMsg = "giveUp cannot be canceled";
	else if (lastEvent.type == eEvents.Transform)
		errorMsg = cancelTransform(match, lastEvent);
	if (errorMsg)
		return (new Result().Error(`Cannot cancel: "${errorMsg}"`, 500));
	while (match.history.events[match.history.events.length - 1]?.error == true)
		match.history.events.pop();
	match.history.events.pop();
	match.victory = "";
	clearTimeout(match.timer?.timeout? match.timer.timeout : undefined);
	if (match.history.events.length != 0)
		setTimerGame(match);
	else
		match.timer = null;
	match.zobristIndex = lastEvent.zobristIndex;
	match._zobristHash = lastEvent.zobristHash;
	return (new Result().Success());
}

/**
 * 
 * @param {Match} match 
 * @param {HistoryEvent} lastEvent 
 */
function cancelMove(match, lastEvent)
{
	let	fromSquare;
	let	boostedSquare;
	let	toSquare;
	let	tmp;

	if (!lastEvent.updates || lastEvent.updates.size == 0 || Object.prototype.toString.call(lastEvent.updates) != "[object Set]")
		return (console.error("cancelMove: History does not have the updates array"));
	fromSquare = match.board.get(lastEvent.from);
	toSquare = match.board.get(lastEvent.to);
	lastEvent.fromHash = zobristPieceHash(fromSquare.index, fromSquare.piece);
	lastEvent.toHash = zobristPieceHash(toSquare.index, toSquare.piece);
	lastEvent.points.WHITE = match.white.nPoints;
	lastEvent.points.BLACK = match.black.nPoints;
	if (!lastEvent.pieceEaten && toSquare.piece && fromSquare.piece)
		console.warn("cancelMove, warning: info on pieceEaten undefined.");
	match.currentPlayer.guardianPieces.clear();
	if (lastEvent.specialMoves & enumSpecialMoves.SNIPER && lastEvent.pieceEaten)
	{
		toSquare.piece = lastEvent.pieceEaten;
		match.currentPlayer.nPoints -= lastEvent.pieceEaten.price;
		match.GetPlayer(lastEvent.pieceEaten?.team).nPieces += 1;
		match.white.pieceValue = lastEvent.pieceValue.WHITE;
		match.black.pieceValue = lastEvent.pieceValue.BLACK;
	}
	else if (lastEvent.specialMoves & enumSpecialMoves.CASTLING)
	{
		tmp = fromSquare.piece;
		fromSquare.piece = toSquare.piece;
		toSquare.piece = tmp;
	}
	else if (lastEvent.pieceEaten)
	{
		fromSquare.piece = toSquare.piece;
		toSquare.piece = lastEvent.pieceEaten;
		if (toSquare.piece.isBoostedBool)
			match.GetPlayer(lastEvent.pieceEaten?.team).boostedPiece = lastEvent.to;
		match.currentPlayer.nPoints -= lastEvent.pieceEaten.price;
		match.GetPlayer(lastEvent.pieceEaten?.team).nPieces += 1;
		match.white.pieceValue = lastEvent.pieceValue.WHITE;
		match.black.pieceValue = lastEvent.pieceValue.BLACK;// FIXME - nel caso anche per 4 giocatori
	}
	else
	{
		fromSquare.piece = toSquare.piece;
		toSquare.piece = null;
	}
	if (lastEvent.type == eEvents.MoveBoost && fromSquare.piece)
	{
		boostedSquare = fromSquare;
		if (lastEvent.prevBoost != lastEvent.to)
		{
			if (!lastEvent.prevBoost)
				throw (`cancelMove: prevBoost not defined`);
			boostedSquare = match.board.get(lastEvent.prevBoost);
		}
		if (!boostedSquare.piece)
			throw (`cancelMove: boostedPiece does not exist, in ${boostedSquare}`);
		boostedSquare.piece.isBoostedBool = true;
		match.currentPlayer.boostedPiece = lastEvent.prevBoost;
	}
	if (fromSquare.piece)
	{
		fromSquare.piece.moveCount -= 1;
		if (fromSquare.piece.type == enumNames.KING)
			match.currentPlayer.King = lastEvent.from;
	}
	if (match.currentPlayer.boostedPiece == lastEvent.to)
		match.currentPlayer.boostedPiece = lastEvent.from;
	for (const coord of lastEvent.updates)
	{
		DangerUpdate(match, coord);
	}
	updateBoostedChampions(match, [lastEvent.from, lastEvent.to]);
	match.moves--;
	if (match.board.get(lastEvent.to).piece?.type == enumNames.BASTARDS || lastEvent.pieceEaten != null)
		match.spareCountDown = 0;
	else
		++match.spareCountDown;
}

/**
 * 
 * @param {Match} match 
 * @param {HistoryEvent} lastEvent 
 */
function cancelBoost(match, lastEvent)
{
	let	square;
	let	prevPiece;

	square = match.board.get(lastEvent.from);
	if (!square.piece)
		return ("cancelBoost: missing coord from");
	match.currentPlayer.nPoints += square.piece.price;
	square.piece.isBoostedBool = false;
	match.currentPlayer.boostedPiece = lastEvent.prevBoost;
	if (lastEvent.prevBoost)
	{
		prevPiece = match.board.get(lastEvent.prevBoost).piece;
		if (!prevPiece)
			throw (`cancelBoost: prevPiece does not exist: ${lastEvent}`);
		prevPiece.isBoostedBool = true;
		DangerUpdate(match, lastEvent.prevBoost);
		if (prevPiece.type == enumNames.CHAMPION)
			updateBoostedChampions(match);
	}
	DangerUpdate(match, lastEvent.from);
}

/**
 * 
 * @param {Match} match 
 */
function cancelEndTurn(match)
{
	let	boardState;
	let	counter;

	//@ts-ignore
	match.currentPlayer = match[match.currentPlayer.prev];
	match.currentPlayer.bonusPointCounter--;
	if (match.currentPlayer.bonusPointCounter == -1)
	{
		match.currentPlayer.bonusPointCounter = MOVEMENT_BONUS_POINT - 1;
		match.currentPlayer.nPoints -= 1;
	}
	match.moves = match.history.Last().turnMoves;
	if (match.aiSimulation == true)
		return ;
	boardState = boardStringify(match, true);
	counter = match.boardStateMap.get(boardState); 
	if (counter)
		match.boardStateMap.set(boardState, counter - 1);
}

/**
 * 
 * @param {Match} match 
 * @param {HistoryEvent} lastEvent 
 */
function cancelTransform(match, lastEvent)
{
	let	square;
	let	isBoostedBool;
	let	moveCount;

	square = match.board.get(lastEvent.from);
	if (!square.piece)
		return ("cancelBoost: missing coord from");
	isBoostedBool = square.piece.isBoostedBool;
	moveCount = square.piece.moveCount;
	square.piece = new Piece(enumNames.BASTARDS, lastEvent.from, lastEvent.team);
	square.piece.isBoostedBool = isBoostedBool;
	square.piece.moveCount = moveCount;
	DangerUpdate(match, lastEvent.from);
}
