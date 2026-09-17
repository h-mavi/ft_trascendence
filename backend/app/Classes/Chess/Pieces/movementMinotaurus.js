// @ts-check
import {berserkMode} from "./berserkMode.js";
import {movePiece} from "../../../utils/dangerUpdate.js";
/**
 * 
 * @param {*} match 
 * @returns 
 */
let movementMinotaurus = function (match)
{
	let	startPos;
	let	piece;
	let	otherPiece;

	startPos = match.cursor.square;
	piece = match.board.get(match.cursor.square)?.piece;
	if (piece == null)
		return (0);
	for (let {dx, dy} of piece.moveArray)
	{
		while (movePiece(match, dx, dy))
		{
			otherPiece = match.board.get(match.cursor.square)?.piece;
			match.board.get(match.cursor.square)?.dangerZones.add(startPos);
			match.board.get(startPos)?.targetZones.add(match.cursor.square);
			if (otherPiece != null)
			{
				if (otherPiece.team != piece.team)
				{
					berserkMode(startPos, match);
					match.board.get(startPos).boostedTargetZones.get(match.cursor.square)?.delete(startPos);
				}
				break ;
			}
		}
		match.cursor.square = startPos;
	}
	return (1);
}

export {movementMinotaurus};