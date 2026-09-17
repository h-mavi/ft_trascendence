// @ts-check
import {movePiece} from "../../../utils/dangerUpdate.js";

/**
 * 
 * @param {*} match 
 * @returns 
 */
let movementValkirya = function (match)
{
	let	startPos;
	let	piece;

	startPos = match.cursor.square;
	piece = match.board.get(match.cursor.square)?.piece;
	if (piece == null)
		return (0);
	match.board.get(startPos)?.boostedTargetZones.set(startPos, new Set());
	for (let {dx, dy} of piece.moveArray)
	{
		let maxTarget = 2; 
		while (movePiece(match, dx, dy))
		{
			match.board.AddInfluence(startPos, match.cursor.square);
			match.board.get(match.cursor.square)?.dangerZones.add(startPos);
			if (maxTarget != 1)
			{
				match.board.get(startPos)?.targetZones.add(match.cursor.square);
				match.board.AddInfluence(startPos, match.cursor.square);
				if (match.board.get(match.cursor.square)?.piece)
					match.board.get(startPos)?.boostedTargetZones.get(startPos)?.add(match.cursor.square);
			}
			if (match.board.get(match.cursor.square)?.piece != null)
				maxTarget--;
			if (maxTarget == 0)
			{
				match.board.get(startPos)?.boostedTargetZones.get(startPos)?.add(match.cursor.square);
				match.board.AddInfluence(startPos, match.cursor.square);
				break ;
			}
		}
		match.cursor.square = startPos;
	}
	return (1);
}

export {movementValkirya};