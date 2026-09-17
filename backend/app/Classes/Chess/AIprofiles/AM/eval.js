//@ts-check

import { enumNames, eTeam } from "../../../../Macro/enums.js";
import { checkKingDanger, isDangerous } from "../../../../utils/checkDanger.js";
import { getBestTurn } from "../../AI.js";
import { basicEval } from "../evalUtils.js";

/** @typedef {import("../../match.js").Match} Match*/
/** @typedef {import("../../AI.js").AI<null>} AI*/
/** @typedef {{from: string, to: string}} Move */
/** @typedef {{move: Move | null, moveBoost: Move | null, transform: string, boost: string}} Turn */

/**
 *
 * @param {Match} match
 * @param {AI} ai
 * @param {Array<Turn>} turns
 */
export function AI_am_eval(match, ai, turns)
{
	let	nextPlayer;
	let	score;

	nextPlayer = match.NextPlayer();
	//1)	differenza punti
	score = basicEval(match, ai, turns);
	for (let [key, square] of match.board)
	{
		if (!square.piece)
			continue ;
		else if (square.piece.team == match.currentPlayer.team)
		{
			for (let x of square.dangerZones)
			{
				if (match.board.get(x).piece?.team == nextPlayer.team)
					score -= 10 * square.piece.price;
			}
			for (let x of square.targetZones)
			{
				if (match.board.get(x).piece?.team == nextPlayer.team)//@ts-ignore
					score += 10 * match.board.get(x).piece?.price;
			}
		}
		else if (square.piece.team == nextPlayer.team)
		{
			for (let x of square.dangerZones)
			{
				if (match.board.get(x).piece?.team == match.currentPlayer.team)
					score += 10 * square.piece.price;
			}
			for (let x of square.targetZones)
			{
				if (match.board.get(x).piece?.team == match.currentPlayer.team)// @ts-ignore
					score -= 10 * match.board.get(x).piece?.price;
			}
		}
	}
	return (score);
}