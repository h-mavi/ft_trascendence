//@ts-check

import { cancelEvent } from "../GameLogic/cancelEvent.js";
import { move } from "../handlers/game/move.js";
import { boost } from "../handlers/game/boost.js";
import { makeTransfiguration } from "../handlers/game/transfiguration.js";
import { endTurn } from "../handlers/game/endTurn.js";
import { eEvents } from "../Macro/enums.js";
import { render } from "../test/render.js";
import { checkKingDanger } from "./checkDanger.js";
import { isOneOf } from "./string.js";

/** @typedef {import("../Classes/Chess/match.js").Match} Match*/
/** @typedef {{from: string, to: string}} Move */
/** @typedef {{move: Move | null, moveBoost: Move | null, transform: string, boost: string}} Turn */

let	DEB = 0;
let	DEB1 = 0;
let	DEB2 = 0;
//226768 - 	226629
//3636
//3213
/**
 * 
 * @param {Match} match 
 * @param {Turn} turn 
 * @param {Array<Turn> | null} prevTurns
 */
export function execTurn(match, turn, prevTurns=null)
{
	/** @type {string} */	let	toCoord;
	let	team;
	let	result;
	let	historySize;
	let	oldPlayerDEBUG;

	DEB++;
	historySize = match.history.events.length;
	oldPlayerDEBUG = {team: match.currentPlayer.team, boosted: match.currentPlayer.boostedPiece};
	team = match.currentPlayer.team;
	if (turn.move && move(match, turn.move.from, turn.move.to).status != 200)
		return (cancelMove(match, historySize), false);
	if (turn.move?.to == match.currentPlayer.boostedPiece && !turn.moveBoost && checkKingDanger(match))
		return (cancelMove(match, historySize), false);
	if (turn.moveBoost && move(match, turn.moveBoost.from, turn.moveBoost.to, true).status != 200)
		return (cancelMove(match, historySize), false);
	if (turn.boost && (result = boost(match, turn.boost)).status != 200)
		return (cancelMove(match, historySize), false);//@ts-ignore
	toCoord = turn.moveBoost ? turn.moveBoost.to : turn.move?.to;
	if (turn.transform && makeTransfiguration(match, toCoord, turn.transform).status != 200)
		throw (`execTurn: transfiguration has failed`);
	if (team == match.currentPlayer.team)
	{
		if ((result = endTurn(match, false)).status != 200)
			return (cancelMove(match, historySize), false);
	}
	return true;
}

//250759
/**
 * 
 * @param {Match} match 
 * @param {Turn} turn 
 */
export function cancelTurn(match, turn)
{
	let	result;

	if (match.history.Last().type != eEvents.EndTurn)
		throw ("cancelTurn: last turn is not endTurn:" + JSON.stringify(turn, null, 2) + JSON.stringify(match.history.events, null, 2));
	result = cancelEvent(match);
	if (result.status != 200)
		throw (`cancelTurn: error on cancel last endTurn: ${result.msg} => ${JSON.stringify(turn, null, 2)} => ${JSON.stringify(match.history.Last(), null, 2)}`);
	while (match.history.Last().type != eEvents.EndTurn && match.history.events.length)
	{
		result = cancelEvent(match);
		if (result.status != 200)
			throw (`cancelTurn: error on cancel event: ${result.msg} => ${JSON.stringify(turn, null, 2)}`);
	}
}

//SECTION - utils

/**
 * 
 * @param {Match} match 
 * @param {number} prevHistorySize 
 */
function cancelMove(match, prevHistorySize)
{
	let	result;

	while (match.history.events.length != prevHistorySize)
	{
		result = cancelEvent(match);
		if (result.status != 200)
			throw (`cancelTurn: error on cancel last endTurn: ${result.msg} => ${match.history.Last()} => ${console.trace()}`);
	}
}
