// @ts-check
import {movePiece} from "../../../utils/dangerUpdate.js";
import {dangerUpdateBastards} from "../../../utils/dangerUpdate.js";

/** @typedef {import("../match.js").Match} Match*/

/**
 * 
 * @param {Match} match 
 * @returns 
 */
let movementBastards = function (match)
{
	let	usedBoard;
	let	piece;
	let	startPos;

	usedBoard = match.board;
	startPos = match.cursor.square;
	piece = usedBoard.get(match.cursor.square)?.piece;
	if (piece == null)
		return (false);
	match.board.get(startPos)?.boostedTargetZones.set(startPos, new Set());
	for (let {dx, dy} of piece.moveArray)
	{
		if (!dangerUpdateBastards(match, dx, dy, piece))
		{
			usedBoard.get(match.cursor.square)?.dangerZones.add(startPos);
			continue ;
		}
		while (movePiece(match, dy, dx))
		{
			usedBoard.get(startPos)?.targetZones.add(match.cursor.square);
			match.board.AddInfluence(startPos, match.cursor.square);
			if (piece.moveLongRangeDEBUG == false || usedBoard.get(match.cursor.square)?.piece != null)
			{
				match.cursor.Save();
				match.cursor.set(startPos);
				for (let {dx, dy} of piece.moveArray)
				{
					movePiece(match, dy, dx);
					if (match.board.get(match.cursor.square).piece && match.board.get(match.cursor.square).piece?.team == piece.team)
					{
						match.board.AddInfluence(startPos, match.cursor.square);
						match.board.get(startPos)?.boostedTargetZones.get(startPos)?.add(match.cursor.square);
					}
					match.cursor.set(startPos);
				}
				match.cursor.Restore();
				break ;
			}
		}
		match.cursor.square = startPos;
	}
	match.board.get(startPos)?.boostedTargetZones.get(startPos)?.delete(startPos);
	return (true);
}

export {movementBastards};