// @ts-check

//SECTION - castling (arrocco) functions
/*
	list of exports:
	-	checkCastling:	checks if a castling move is possible or not.
	-	moveCastling:	performs a castling move.
*/

import { Match } from "../Classes/Chess/match.js";
import { isDangerous } from "../utils/checkDanger.js";
import { movePiece, getPieces } from "../utils/movePiece.js";
import { Result } from "../Classes/endPoint/result.js";
import { DangerUpdate } from "../utils/dangerUpdate.js";
import { enumNames, eTeam } from "../Macro/enums.js";

/** @typedef {import('../Classes/Chess/Pieces/pieces.js').Piece} Piece */
/** @typedef {import('../Classes/Chess/chessBoard.js').Square} Square */

/* 
stesso team - OK
non mossi -  OK
re non sotto scacco - OK
caselle di movimento del re non sotto scacco
non in diagonale - OK

*/

/**
 * checks if a castling move is possible or not.
 * @param {Match} match
 * @param {Result} result
 * @param {Square} to
 * @param {Square} from 
 * @returns {boolean} 
 */
function checkCastling(match, result, to, from)
{
	let	pieces;
	let	board;
	let	currSquare;

	board = match.board;
	match.cursor.Save();
	pieces = getPieces(match, from, to);
	if (!pieces)
		return false;
	if (isDangerous(match, pieces.kingDanger, pieces.king.team))
		return false;
	if (pieces.king.moveCount || pieces.mino.moveCount)
		return false;
	if (pieces.dir.diffRow != 0 && pieces.dir.diffCol != 0)
		return false;
	else if (pieces.dir.diffRow == 0 && pieces.dir.diffCol == 0)
		return false;
	match.cursor.set(pieces.king.pos);
	for (let i = 0; movePiece(match, pieces.dir.diffCol, pieces.dir.diffRow); ++i)
	{
		currSquare = board.get(match.cursor.square);
		if (isDangerous(match, currSquare.dangerZones, pieces.king.team))
		{
			match.cursor.Restore();
			return false;
		}
		if (match.cursor.square == pieces.mino.pos || i == 1)
			break;
		if (currSquare.piece)
		{
			match.cursor.Restore();
			return false;
		}
	}
	match.cursor.Restore();
	result.specialMoves.SetCastling();
	return true;
}

/**
 * 
 * @param {Match} match 
 * @param {Square} from 
 * @param {Square} to 
 */
function moveCastling(match, from, to)
{
	let pieces = getPieces(match, from, to);
	let kpos;
	let mpos;

	kpos = pieces?.king.pos;
	mpos = pieces?.mino.pos;
	match.cursor.Save();
	if (pieces == null)
		throw ("moveCastling: we have lost our pieces coords, sorry");
	match.board.updates.add(kpos);
	match.board.updates.add(mpos);
	match.cursor.set(pieces.king.pos);
	for (let i = 0; movePiece(match, pieces.dir.diffCol, pieces.dir.diffRow); ++i)
	{
		if (match.cursor.square == pieces.mino.pos || i == 1)
			break;
	}
	let square1 = match.board.get(match.cursor.square);
	if (square1)
	{
		pieces.king.pos = match.cursor.square;
		square1.piece = pieces.king;
	}
	// @ts-ignore
	let square2 = match.board.get(kpos);
	if (square2)
		square2.piece = null;
	movePiece(match, -pieces.dir.diffCol, -pieces.dir.diffRow);
	let square3 = match.board.get(match.cursor.square);
	if (square3)
	{
		pieces.mino.pos = match.cursor.square;
		square3.piece = pieces.mino;
	}
	// @ts-ignore
	let square4 = match.board.get(mpos);
	if (square4)
		square4.piece = null;
	if (square1.piece)
		match.currentPlayer.King = square1.piece.pos;
	else
		throw ("moveCastling: backend has lost the king");
	match.currentPlayer.castlingArray.clear();
	pieces.king.moveCount += 1;
	pieces.mino.moveCount += 1;
	DangerUpdate(match, pieces.mino.pos, true, true);
	DangerUpdate(match, pieces.king.pos, true, true);
	match.cursor.Restore();
}

//NOTE - valido solo per partite a due
/**
 * 
 * @param {Match} match
 */
function refreshCastling(match)
{
	let	minoW = new Array("a1", "h1");
	let	minoB = new Array("a8", "h8");
	let mino;
	let	minoPiece;
	let	currPlayer;

	currPlayer = match.currentPlayer.team;
	do
	{
		if (match.currentPlayer.team == eTeam.White)
			mino = minoW;
		else
			mino = minoB;
		match.currentPlayer.castlingArray.clear();
		for (const minoCoord of mino)
		{
			minoPiece = match.board.get(minoCoord).piece;
			if (minoPiece?.moveCount == 0 && minoPiece?.type == enumNames.MINOTAURUS && minoPiece?.team == match.currentPlayer.team && 
			checkCastling(match, new Result(), match.board.get(match.currentPlayer.King), match.board.get(minoCoord)))
			{
				match.board.get(match.currentPlayer.King).targetZones.add(minoCoord)
				match.board.get(minoCoord).targetZones.add(match.currentPlayer.King)
			}
		}
		match.endTurn();
	}
	while (currPlayer != match.currentPlayer.team)
}

export {checkCastling, moveCastling, refreshCastling};