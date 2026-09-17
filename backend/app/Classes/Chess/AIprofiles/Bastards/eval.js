//@ts-check

import { enumNames } from "../../../../Macro/enums.js";
import { AIfavouritePieceEval, basicEval } from "../evalUtils.js";

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
export function AI_bastard_eval(match, ai, turns)
{
	let	score;

	score = basicEval(match, ai, turns);
	return (score + AIfavouritePieceEval(match, ai, turns, enumNames.BASTARDS));
}
