//@ts-check

import { eEvents, eTeam } from "../../../Macro/enums.js";
import { AI_PROFILE_PATH, MAX_MOVES_REWARD_AND_PENALITY, CUTOFF, AI_MAX_DATA } from "../../../Macro/macro.js";
import { globals } from "../../Globals/globals.js";
import fs from "fs";

/**@typedef {import("../match.js").Match} Match*/
/**@typedef {import("../../Globals/globals.js").globals} Globals */
/**@typedef {import("../match.js").MatchSettings} MatchSettings*/
/**@typedef {import("../chessBoard.js").Square} Square*/
/**@typedef {import("../Pieces/pieces.js").Piece} Piece*/
/**@typedef {import("../player.js").Player} Player*/
/**@typedef {import("../history.js").HistoryEvent} HistoryEvent*/
/**@typedef {import("../../Globals/globals.js").ZobristCache} ZobristCache*/


/**
 * 
 * @param {Match} match
 */
export function AItraining(match)
{
	let data;
	let profileW;
	let profileB;
	let events = match.history.events;
	let	dataW;
	let	dataB;

	profileW = match.white.ai?.profile;
	profileB = match.black.ai?.profile;
	if (profileW)
	{
		if (!globals.AIgameCounter.has(profileW))
			globals.AIgameCounter.set(profileW, 0);//@ts-ignore
		globals.AIgameCounter.set(profileW, globals.AIgameCounter.get(profileW) + 1);
		dataW = globals.AITraining.get(profileW);
	}
	if (profileB)
	{
		if (!globals.AIgameCounter.has(profileB))
			globals.AIgameCounter.set(profileB, 0);//@ts-ignore
		globals.AIgameCounter.set(profileB, globals.AIgameCounter.get(profileB) + 1);
		dataB = globals.AITraining.get(profileB);
	}
	for (let event of events)
	{
		let val;

		data = event.team == eTeam.Black? dataB : dataW;
		if (!data || event.type == eEvents.EndTurn)
			continue ;
		if (event.score == +Infinity || event.score == -Infinity)
			continue ;
		if (data[event.zobristIndex])
		{
			val = evaluateEvent(match, event, data[event.zobristIndex][0], data[event.zobristIndex][1]);
			data[event.zobristIndex][0] = val;
			data[event.zobristIndex][1] += 1;
		}
		else
		{
			val = evaluateEvent(match, event, event.score, 1);
			data[event.zobristIndex] = [val, 1];
		}
	}//@ts-ignore
	if (dataW != undefined && globals.AIgameCounter.get(profileW) % 20 == 0)
	{
		updateTrainingData(dataW);
		fs.writeFileSync(`${AI_PROFILE_PATH}/${profileW}/cache.json`, JSON.stringify(dataW));
	}//@ts-ignore
	if (profileW != profileB && dataB != undefined && globals.AIgameCounter.get(profileB) % 20 == 0)
	{
		updateTrainingData(dataB);
		fs.writeFileSync(`${AI_PROFILE_PATH}/${profileB}/cache.json`, JSON.stringify(dataB));
	}
}

//SECTION - utils

/**
 * 
 * @param {Match} match 
 * @param {HistoryEvent} event 
 * @param {number} oldVal 
 * @param {number} counter 
 */
function evaluateEvent(match, event, oldVal, counter)
{
	let delta;
	let val;

	delta = getDelta(match, event);
	val = oldVal - (delta - oldVal) / counter;//NOTE - media incrementale: una mossa viene penalizzata meno se e' ripetuta piu' volte
	return Math.trunc(val);
}

/**
 * 
 * @param {Match} match 
 * @param {HistoryEvent} event 
 */
function getDelta(match, event)
{
	let win;
	let delta;
	let result;
	let tmp;

	win = match.victory == event.team ? 1 : -1;
	if (match.victory == "draw")//NOTE - ridurre a una frazione win
		win = 0.1;
	if (event.team == eTeam.Black)
		win *= -1;
	delta = match.history.clientEvents.length - event.turnCounter;
	tmp = (delta == 0 ? 1 : delta);
	result = MAX_MOVES_REWARD_AND_PENALITY / tmp;
	return result * win;
}

/**
 * 
 * @param {number} score 
 * @param {number} counter 
 */
function getImportance(score, counter)
{
	let confidence;

	confidence = counter / (counter + 1);
	return Math.abs(score * confidence);
}

/**
 * 
 * @param {ZobristCache} data 
 */
function updateTrainingData(data)
{
	let garbageIndex;
	let toDelete;
	let entries = Object.entries(data);

	entries.sort(([, [scoreA, counterA]], [, [scoreB, counterB]]) => 
		getImportance(scoreB, counterB) - getImportance(scoreA, counterA)
	);
	if (entries.length > AI_MAX_DATA)
		garbageIndex = AI_MAX_DATA;
	else
		return data;
	toDelete = entries.slice(garbageIndex, entries.length);
	for (const [key] of toDelete)
		delete data[key];
	return data;
}
