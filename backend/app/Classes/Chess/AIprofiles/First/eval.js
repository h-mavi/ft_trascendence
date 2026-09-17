//@ts-check

import { checkKingDanger } from "../../../../utils/checkDanger.js";
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
export function AI_first_eval(match, ai, turns)
{
	return (basicEval(match, ai, turns));
}