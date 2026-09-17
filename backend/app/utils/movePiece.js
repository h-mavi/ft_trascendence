//@ts-check

import { enumNames } from "../Macro/enums.js";

//SECTION - movePiece function
/*
	list of exports:
	-	movePiece:		try to move the cursor to dx, dy. return true/false.
	-	getPieces:		it takes the coords of the king and the minotaurus.
	-	getDirection:	it takes Δx/Δy between the king coord and enemy coord.
*/

/**@typedef {import("../Classes/Chess/match.js").Match} Match*/
/**@typedef {import("../Classes/Chess/chessBoard.js").Square} Square*/
/**@typedef {import("../Classes/Chess/Pieces/pieces.js").Piece} Piece*/
/**@typedef {{"king": Piece, "mino": Piece, "dir": { diffRow: number; diffCol: number; }, "kingDanger": Set<string>}} pieces */


/**
 * try to move the cursor to dx, dy. return true/false
 * @param {Match} match
 * @param {number} dx 
 * @param {number} dy
 */
export function movePiece(match, dy, dx)
{
	let newRow = match.cursor.getRow() + dx;
	let newCol = match.cursor.getCol() + dy;
	let	oldCursor = match.cursor.square;

	if (newRow < 1 || newRow > match.board.heigth)
		return false;
	else if (newCol <= 0 || newCol > match.board.width)
		return false;
	match.cursor.setCursor(newRow, newCol);
	if (match.board.get(match.cursor.square).wallBool == true)
	{
		match.cursor.set(oldCursor);
		return false;
	}
	return true;
}

/**
 * it takes the coords of the king and the minotaurus
 * @param {Match} match
 * @param {Square} from 
 * @param {Square} to 
 * @returns 
 */
export function getPieces(match, from, to)
{
	let toType;
	let fromType;
	let	board;
	/** @type {pieces}*/let	piece;

	board = match.board;
	// @ts-ignore
	piece = {};
	toType = to.piece?.type;
	fromType = from.piece?.type;
	if (!toType || !fromType)
		return (null);
	if (!from.piece || !to.piece)
		return (null);
	if ((to.piece?.team != from.piece?.team) && !to.piece?.moveCount)
		return null;
	if (fromType == enumNames.KING && toType == enumNames.MINOTAURUS)
	{
		piece.king = from.piece;
		piece.mino = to.piece;
	}
	else
		return (null);
	piece.dir = getDirection(match, piece.mino.pos, piece.king.pos);
	piece.kingDanger = board.get(piece.king.pos).dangerZones;
	return (piece);
}

/**
 * it takes Δx and Δy between the king coord and the enemy coord.
 * @param {Match} match
 * @param {string} kingCoord 
 * @param {string} enemyCoord 
 */
export function getDirection(match, kingCoord, enemyCoord)
{
	let rowK, rowE, diffRow;
	let colK, colE, diffCol;

	match.cursor.square = kingCoord;
	rowK = match.cursor.getRow();
	colK = match.cursor.getCol();
	match.cursor.square = enemyCoord;
	rowE = match.cursor.getRow();
	colE = match.cursor.getCol();
	diffRow = rowK - rowE;
	diffCol = colK - colE;
	if (diffRow != 0)
		diffRow /= Math.abs(diffRow);
	if (diffCol != 0)
		diffCol /= Math.abs(diffCol);
	return ({diffRow, diffCol});
}
