// @ts-check
import {berserkMode} from "./berserkMode.js";
import {movePiece} from "../../../utils/dangerUpdate.js";
import {isDangerous} from "../../../utils/checkDanger.js";
import { checkPieceDanger } from "../../../GameLogic/pathFinding.js";
import { enumNames } from "../../../Macro/enums.js";

/** @typedef {import("../match.js").Match} Match*/
/** @typedef {import("./pieces.js").Piece} Piece*/

/**
 * 
 * @param {*} match 
 * @returns 
 */
let movementChampion = function (match)
{
	let	startPos;
	let	piece;
	let	otherSquare;
	let	menaceFromStartBool;

	startPos = match.cursor.square;
	piece = match.board.get(match.cursor.square)?.piece;
	if (piece == undefined)
		return (0);
	if (piece.pos != startPos)
	{
		throw (`movementChampion: mismatch: startPos ${startPos}, piece.pos ${piece.pos}`);
	}
	for (let {dx, dy} of piece.moveArray)
	{
		match.cursor.square = startPos;
		menaceFromStartBool = true;
		while (movePiece(match, dx, dy))
		{
			if (menaceFromStartBool == true)
				menaceFromStartBool = checkPieceDanger(match, startPos, piece, match.cursor.square, startPos);
			otherSquare = match.board.get(match.cursor.square);
			otherSquare.dangerZones.add(startPos);
			match.board.get(startPos)?.targetZones.add(match.cursor.square);
			match.board.AddInfluence(startPos, match.cursor.square);
			if (!menaceFromStartBool && 
			!isDangerous(match, otherSquare.dangerZones, piece.team) && 
			(otherSquare.piece == null || 
			otherSquare.piece?.team != piece.team) && 
			(otherSquare.piece == null || 
			otherSquare.piece.type != enumNames.KING))//NOTE - il re non deve estendere le boosted per checkmate
				berserkMode(startPos, match);
			if (otherSquare.piece != null)
				break ;
		}
	}
	match.cursor.square = startPos;
	return (1);
}

export {movementChampion};