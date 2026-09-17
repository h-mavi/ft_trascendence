// @ts-check

/**@typedef {import("../match.js").Match} Match*/

/**
 * 
 * @param {Match} match 
 * @returns 
 */
let movementJester = function (match)
{
	let	startPos;
	let	piece;
	let	diff;

	startPos = match.cursor.square;
	piece = match.board.get(match.cursor.square)?.piece;
	diff = (match.board.heigth - 8) / 2;
	if (piece == null)
		return (0);
	match.board.get(startPos)?.boostedTargetZones.set(startPos, new Set());
	for (let {dx, dy} of piece.moveArray)
	{
		let row = match.cursor.getRow();
		let col = match.cursor.getCol();

		while (dx != 0)
		{
			row += dx > 0 ? 1 : -1;
			if (row > match.board.heigth)
				row = 1;
			else if (row <= 0)
				row = match.board.heigth;
			else if ((row <= diff && (col <= diff || col > 8 + diff)) && match.settings.board.corners)
				row = 8 + diff;
			else if ((row > 8 + diff && (col <= diff || col > 8 + diff)) && match.settings.board.corners)
				row = diff + 1;
			dx -= dx > 0 ? 1: -1;
		}
		while (dy != 0)
		{
			col += dy > 0 ? 1: -1;
			if (col > match.board.width)
				col = 1;
			else if (col <= 0)
				col = match.board.width;
			else if (((row <= diff || row > 8 + diff) && col <= diff) && match.settings.board.corners)
				col = 8 + diff;
			else if (((row <= diff || row > 8 + diff) && col > 8 + diff) && match.settings.board.corners)
				col = diff + 1;
			dy -= dy > 0 ? 1: -1;
		}
		match.cursor.setCursor(row, col);
		if (!match.board.get(startPos).targetZones.has(match.cursor.square))
			match.board.get(startPos)?.boostedTargetZones.get(startPos)?.add(match.cursor.square);
		match.board.AddInfluence(startPos, match.cursor.square);
		match.board.get(match.cursor.square)?.dangerZones.add(startPos);
		match.cursor.square = startPos;
	}
	return (1);
}

/*
	'd2', 'j2', 'd<', 'j<', 'e1', 'i1', 'e=', 'i='
*/

export {movementJester};