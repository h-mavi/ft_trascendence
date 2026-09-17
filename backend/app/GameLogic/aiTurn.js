//@ts-check

import { getBestTurn } from "../Classes/Chess/AI.js";
import { aiSpeech } from "../Classes/Chess/AIprofiles/speech.js";
import { Result } from "../Classes/endPoint/result.js";
import { boost } from "../handlers/game/boost.js";
import { endTurn } from "../handlers/game/endTurn.js";
import { move } from "../handlers/game/move.js";
import { makeTransfiguration } from "../handlers/game/transfiguration.js";
import { eEvents } from "../Macro/enums.js";
import { AI_EVENTS, IS_CHILD_PROCESS } from "../Macro/macro.js";
import { render, boardStringify } from "../test/render.js";
import { responseFormatter, sendData } from "../utils/response.js";
import { gameMessage, roomMessage } from "../websocket/utils.js";

/** @typedef {import("../Classes/Chess/match").Match} Match */

let	DEBUG_turn = {};

/**
 * 
 * @param {Match} match 
 */
export function AIexecuteTurn(match)
{
	let	result;
	let	turnData;
	let	turn;
	let	team;
	let	aiDefeatBool = false;
	let	lastEvents;

	if (!match.currentPlayer.ai)
		throw (`AIexecuteTurn: there is no AI`);
	match.aiSimulation = true;
	turnData = getBestTurn(match);
	turn = turnData.Turn;
	DEBUG_turn = turn;
	match.aiSimulation = false;
	team = match.currentPlayer.team;
	if (match.currentPlayer.ai?.defeatStatus == 1)
	{
		aiDefeatBool = true;
		match.currentPlayer.ai.defeatStatus = 2;
	}
	if (turn == undefined)
		console.log();
	if (turn.move)
	{
		result = move(match, turn.move.from, turn.move.to, false);
		sendResult(match, result, eEvents.Move);
	}
	if (turn.moveBoost)
	{
		result = move(match, turn.moveBoost.from, turn.moveBoost.to, true);
		sendResult(match, result, eEvents.MoveBoost);
	}
	if (turn.boost)
	{
		result = boost(match, turn.boost);
		sendResult(match, result, eEvents.Boost);
	}
	else if (turn.transform)
	{//@ts-ignore
		result = makeTransfiguration(match, turn.moveBoost? turn.moveBoost.to : turn.move?.to, turn.transform, false);
		sendResult(match, result, eEvents.Transform);
	}
	if (team == match.currentPlayer.team && match.victory == "")
	{
		result = endTurn(match, false);
		result.history = match.history.clientEvents[match.history.clientEvents.length - 1];
		sendResult(match, result, eEvents.EndTurn);
	}
	lastEvents = match.history.LastTurn();
	for (let event of lastEvents)
		event.score = turnData.Score;
	render(match);
	if (aiDefeatBool)
	{
		aiSpeech(match, AI_EVENTS.offerDraw, [], false);
		sendData("game", match.id, new Result().Success("OK", eEvents.Draw).Format({draw: true}));
	}
}

/**
 * 
 * @param {Match} match 
 * @param {Result} result 
 * @param {string} type
 */
function sendResult(match, result, type="")
{
	if (result.status != 200)
		throw (`AIExecuteTurn: ${type} failed. Reason: "${result.msg}".Info: ${JSON.stringify(DEBUG_turn, null, 2)}`);
	result.Format({"aiGame": true});
	sendData("game", match.id, responseFormatter(match, result, null, null));
}
