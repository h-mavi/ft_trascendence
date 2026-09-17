//@ts-check

//SECTION - simulation function
/*
	list of exports:
	-	simulation:		simulate a move to check the king safety.
*/

import { error } from "../handlers/game/utils.js";
import { enumNames } from "../Macro/enums.js";
import { movePiece } from "../utils/dangerUpdate.js";
import { dangerUpdateMoved } from "../utils/dangerUpdate.js";
import { isDangerous, checkKingDanger } from "../utils/checkDanger.js";
import { getLegalMoves } from "./checkLegalMoves.js";
import { isOneOf } from "../utils/string.js";
import { render } from "../test/render.js";

/** @typedef {import("../Classes/Chess/match").Match} Match*/
/** @typedef {import("../Classes/Chess/chessBoard.js").Square} Square*/
/** @typedef {import("../Classes/endPoint/result").Result} Result*/
/** @typedef {import("../Classes/Chess/Pieces/pieces.js").Piece} Piece*/

/**
 * simulate a move to check the king safety.
 * @param {Array<String>} coords
 * @param {Match} match
 * @param {Result | null} result
 * @param {Array<string> | null} otherCoords
 * @param {boolean} recBool
 * @param {boolean} boostBool
 * @returns {boolean}
 */
export function simulation(coords, match, result=null, otherCoords=null, recBool=false, boostBool=false)
{
	let tmpPiece = null;
	let tmpSquare = null;
	let	from;
	let	to;
	let	king;
	let	kingCoord;
	let	dangerBool;
	let	tmpCursor;
	let	tmpBoost;

	tmpCursor = match.cursor.square;
	from = match.board.get(coords[0]);
	to = match.board.get(coords[1]);
	kingCoord = match.currentPlayer.King;
	king = match.board.get(match.currentPlayer.King);
	if (!from || !to || !king)
		throw (`simulation: invalid from: ${from}/to: ${to}/king: ${king}`);
	if (to.piece)
	{
		tmpSquare = to.Copy();
		tmpPiece = tmpSquare.piece;
	}
	if (!result || result.specialMoves.CheckSniperMove() == 0)
	{
		to.piece = from.piece;
		from.piece = null;
	}
	else
		to.piece = null;
	if (coords[0] == match.currentPlayer.King)
	{
		kingCoord = coords[1];
		king = to;
	}
	if (boostBool && to.piece)
		to.piece.isBoostedBool = false;
	dangerUpdateMoved(match, coords);
	dangerBool = isDangerous(match, king.dangerZones, king.piece?.team, true, kingCoord);
	if (!dangerBool)
		dangerBool = checkDoubleMoveMate(match, coords, result);
	if (otherCoords)
	{
		tmpBoost = match.currentPlayer.boostedPiece;
		if (match.currentPlayer.boostedPiece == coords[0])
			match.currentPlayer.boostedPiece = coords[1];
		dangerBool = !simulation(otherCoords, match, result);
		match.currentPlayer.boostedPiece = tmpBoost;
	}
	if (!dangerBool && match.settings.players.allies)
	{
		dangerBool = checkKingDanger(match, match.currentPlayer.ally);
		if (dangerBool && result)//@ts-ignore
			result.specialMoves.SetAllyGuardian();
	}
	if (!result || result.specialMoves.CheckSniperMove() == 0)
	{
		from.piece = to.piece;
		to.piece = tmpPiece;
	}
	else
		to.piece = tmpPiece;
	dangerUpdateMoved(match, [coords[1], coords[0]]);
	if (boostBool && from.piece)
		from.piece.isBoostedBool = true;
	if (dangerBool)
		dangerBool = checkGuardiansDanger(match, coords);	
	if (tmpSquare)
		match.board.set(coords[1], tmpSquare);
	match.cursor.square = tmpCursor;
	if (from.piece?.isBoostedBool)
		match.currentPlayer.boostedPiece = coords[0];
	return (!dangerBool);
}

let	DEBUGcount = 0;

/**
 * tried to move every piece in the team once, to find a valid move
 * @param {Match} match 
 * @param {string} team 
 */
export function simulationGlobal(match, team=match.currentPlayer.team)
{
	let	kingCoord;
	let	legalMovesArray;

	//console.debug(`===============================`);
	//console.debug(`=======SIMULATION GLOBAL=======`);
	//console.debug(`=======CALL NUMBER ${++DEBUGcount}========`);
	//console.debug(`===============================`);
	kingCoord = match.GetPlayer(team).King;
	legalMovesArray = getLegalMoves(match, team, true);
	for (const turn of legalMovesArray)
	{
		if (turn.move?.from == kingCoord)
			continue ;
		if (turn.move?.from == "c3" && turn.move?.to == "d3")
			console.log(`BREAKPOINT`);
		if (turn.move && turn.moveBoost && simulation([turn.move.from, turn.move.to], match, null, [turn.moveBoost.from, turn.moveBoost.to], true))
			return (true);
		else if (turn.move && !turn.moveBoost && simulation([turn.move.from, turn.move.to], match, null, null, true))
			return (true);
		else if (!turn.move && turn.moveBoost && simulation([turn.moveBoost.from, turn.moveBoost.to], match, null, null, true, true))
			return (true);
	}
	return (false);
}

//SECTION - utils

/**
 * the king is in danger, but a second move can save him?
 * it must be called in the original pieces state
 * @param {Match} match 
 * @param {Array<string>} coords 
 */
function checkGuardiansDanger(match, coords)
{
	let	guardianSquare;
	let	boostTargets;

	for (let {coord, target} of match.currentPlayer.guardianPieces)
	{
		if (coord != coords[0])
			continue ;
		//we use piece destination
		guardianSquare = match.board.get(coords[0]);
		boostTargets = guardianSquare.boostedTargetZones.get(coords[1]);
		if (!boostTargets)
			continue ;
		if (boostTargets.has(target) == false)
			continue ;
		match.currentPlayer.guardianPieces.clear();
		return (false);	
	}
	return (true);
}

/**
 * 
 * @param {Match} match 
 * @param {Array<string>} coords 
 * @param {Result | null} result
 */
function checkDoubleMoveMate(match, coords, result=null)
{
	let	OtherPiece;
	let	pieceData;

	OtherPiece = match.GetBoostedPieceCoords();
	let	theKING = match.
	currentPlayer.King;
	if (coords.length >= 2 && coords[0] == theKING)
		theKING = coords[1];
	if (OtherPiece == null)
		return (false);
	for (const coords of OtherPiece)
	{
		pieceData = match.board.get(coords).piece;
		if (!pieceData)
			throw ("checkDoubleMoveMate: cannot find boosted piece");
		if (pieceData.type != enumNames.BASTARDS)
			continue ;
		if (!boostBastardsUpdates(match, coords, theKING, result))
			return (true);
	}
	return (false);
}

/**
 * 
 * @param {Match} match 
 * @param {string} coords 
 * @param {string} theKING
 * @param {Result | null} result
 * @returns 
 */
function boostBastardsUpdates(match, coords, theKING, result)
{
	let boosts = match.board.get(coords).boostedTargetZones.get(coords);
	if (boosts == undefined || boosts.size == 0)
			return (true);
	for (const squareCoord of boosts)
	{
		let	square = match.board.get(squareCoord);
		if (!square.piece)
			throw ("DEBUG error 1");
		match.cursor.Save();
		for (const moves of square.piece.moveArray)
		{
			match.cursor.set(squareCoord);
			while (movePiece(match, moves.dy, moves.dx))
			{
				let piece;
				let squareBastard = "";
				piece = match.board.get(match.cursor.square).piece;
				if (match.cursor.square == theKING)
				{
					if (square.piece.type != enumNames.BASTARDS || (square.piece.type == enumNames.BASTARDS && square.targetZones.has(match.cursor.square)))
						return vitaNeraError(result);
				}
				if (!piece)
				{
					if (!square.piece.moveLongRangeDEBUG)
						break ;
					else
						continue ;
				}
				if (piece.isBoostedBool == true && piece.type == enumNames.BASTARDS && piece.team == square.piece.team)
				{
					squareBastard = match.cursor.square;
					if (movePiece(match, moves.dy, moves.dx) == false)
						break ;
					if (match.cursor.square == theKING)
						return vitaNeraError(result);
					if (match.board.get(squareBastard).targetZones.has(match.cursor.square) && 
					match.board.get(squareBastard).targetZones.size <= 1)
						break ;
					if (piece.moveCount)
					{
						if (!square.piece.moveLongRangeDEBUG)
							break ;
						else
						{
							match.cursor.square = squareBastard;
							continue ;
						}
					}
					squareBastard = match.cursor.square;
					if (movePiece(match, moves.dy, moves.dx) == false)
						break ;
					if (match.cursor.square == theKING)
						return vitaNeraError(result);
					if (match.board.get(squareBastard).targetZones.has(match.cursor.square) && 
					match.board.get(squareBastard).targetZones.size <= 2)
						break ;
				}
				else
					break ;
			}
			match.cursor.Restore();
		}
		match.cursor.Restore();
	}
	match.cursor.Restore();
	return (true);
}

/**
 * 
 * @param {Result | null} result 
 */
function vitaNeraError(result)
{
	if (result)
		error(result, 403, "boost bastard and his gang would threaten king");
	return (false);
}
