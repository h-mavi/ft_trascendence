// @ts-check

//SECTION - checkLegalMoves function
/*
	list of exports:
	-	checkInsuficientResources:	checks if all player cannot win
*/

import { enumNames } from "../Macro/enums.js";
import { Match } from "../Classes/Chess/match.js";

/**
 * checks if all player cannot win
 * @param {Match} match 
 * @param {number} nPieces 
 */
export function checkInsuficientResources(match, nPieces)
{
	/** @type {Map<string, Set<string>>} */ let lastPieces = new Map();
											let same = false;
											let color = undefined;
											let team1;
											let team2;

	team1 = match.currentPlayer.team;
	team2 = match.currentPlayer.next;
	lastPieces.set(team1, new Set());
	lastPieces.set(team2, new Set());
	for (let [key, value] of match.board._data)
	{
		if (value.piece)
		{
			if ( value.piece.type == enumNames.VALKIRYA)
			{
				if (color == undefined)
					color = value.color;
				else if (color == value.color)
					same = true;
			}
			lastPieces.get(value.piece.team)?.add(value.piece.type);
		}
	}
	if (!lastPieces.get(team1)?.has(enumNames.KING))
		throw (`checkInsuficientResources: there isn't the ${team1} king`);
	else if  (!lastPieces.get(team2)?.has(enumNames.KING))
		throw (`checkInsuficientResources: there isn't the ${team2} king`);
	if (nPieces == 2)
		return true;
	if (lastPieces.get(team1)?.size == 2 && lastPieces.get(team2)?.size == 2 && same == true)
		return true;
	else if (lastPieces.get(team1)?.size == 1 && lastPieces.get(team2)?.size == 2)
	{
		if (lastPieces.get(team2)?.has(enumNames.JESTER) || lastPieces.get(team2)?.has(enumNames.VALKIRYA))
			return true;
	}
	else if (lastPieces.get(team1)?.size == 2 && lastPieces.get(team2)?.size == 1)
	{
		if (lastPieces.get(team1)?.has(enumNames.JESTER) || lastPieces.get(team1)?.has(enumNames.VALKIRYA))
			return true;
	}
	return false;
}