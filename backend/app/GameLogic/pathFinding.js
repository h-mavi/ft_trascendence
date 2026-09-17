//@ts-check

//SECTION - pathFinding functions
/*
	list of exports:
	-	checkPieceDanger:	checks piece danger ignoring a coord
	-	pathFinding:		check if is possible to go from start to dest
*/

import {movePiece} from "../utils/dangerUpdate.js";

/** @typedef {import("../Classes/Chess/match.js").Match} Match*/
/** @typedef {import("../Classes/Chess/Pieces/pieces.js").Piece} Piece*/
/** @typedef {import("../Classes/Chess/chessBoard.js").Square} Square*/

/**
 * checks piece danger ignoring a coord
 * @param {Match} match 
 * @param {string} checkDangerCoord the coord source of danger 
 * @param {Piece} piece the piece to check
 * @param {string} pieceCoord the current piece coord
 * @param {string} ignoreCoord the coord to ignore (usually is the `from` coord)
 */
export function checkPieceDanger(match, checkDangerCoord, piece, pieceCoord, ignoreCoord)
{
	let	square;
	let	dangerSquare;

	square = match.board.get(checkDangerCoord);
	for (const dangerCoord of square.dangerZones)
	{
		dangerSquare = match.board.get(dangerCoord);
		if (!dangerSquare.piece || dangerSquare.piece.team == piece.team)
			continue ;
		if (pathFinding(match, dangerCoord, pieceCoord, ignoreCoord, dangerSquare) != null)
		{
			return (true);
		}
	}
	return (false);
}

/**
 * check if is possible to go from start to dest
 * @param {Match} match 
 * @param {string} startCoord 
 * @param {string} destCoord 
 * @param {Set<string> | string} ignoredCoords example: avoiding the fromCoord in move
 * @param {Square | null} startSquare if null, is taken from startCoord
 */
export function pathFinding(match, startCoord, destCoord, ignoredCoords=new Set, startSquare=null)
{
	let	moveData;

	if (!startSquare)
		startSquare = match.board.get(startCoord);
	if (typeof(ignoredCoords) == "string")
		ignoredCoords = new Set().add(ignoredCoords);
	if (!startCoord || !destCoord || !startSquare.piece)
		throw (`pathFinding: invalid parameters => ${startCoord}/${destCoord}/${startSquare}`);
	for (const move of startSquare.piece.moveArray)
	{
		moveData = moveSimulation(match, startCoord, destCoord, ignoredCoords, startSquare.piece, move);
		if (moveData)
		{
			return (moveData);
		}
	}
	return (null);
}

/**
 * 
 * @param {Match} match 
 * @param {string} startCoord
 * @param {string} destCoord 
 * @param {Set<string>} ignoredCoords 
 * @param {Piece} startPiece
 * @param {{dx: number, dy: number}} move
 */
function moveSimulation(match, startCoord, destCoord, ignoredCoords=new Set, startPiece, move)
{
	let	square;
	let	moveData;

	match.cursor.Save();
	match.cursor.set(startCoord);
	while (movePiece(match, move.dy, move.dx))
	{
		if (ignoredCoords.has(match.cursor.square))
		{
			if (!startPiece.moveLongRangeDEBUG)
				break ;
			continue ;
		}
		if (destCoord == match.cursor.square)
		{
			moveData = {from: startCoord, to: destCoord};
			match.cursor.Restore();
			return (moveData);
		}
		square = match.board.get(match.cursor.square);
		if (square.piece || !startPiece.moveLongRangeDEBUG)
			break ;
	}
	match.cursor.Restore();
	return (null);
}
