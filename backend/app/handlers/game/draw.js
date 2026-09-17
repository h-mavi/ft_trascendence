//@ts-check

import { aiSpeech } from "../../Classes/Chess/AIprofiles/speech.js";
import { AI_EVENTS, IS_CHILD_PROCESS } from "../../Macro/macro.js";
import { Result } from "./utils.js";

/**
 * handler of draw requests
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("./utils.js").RequestBody} body
 * @param {import("../../Classes/Globals/globals.js").Socket | null} socketData
 */
export function drawHandler(match, body, socketData)
{
	let	ai;

	if (IS_CHILD_PROCESS == true)
	{
		ai = match.currentPlayer.ai ? match.currentPlayer : match.NextPlayer();
		if (ai.ai?.defeatStatus && body.draw == true)
		{
			aiSpeech(match, AI_EVENTS.acceptDraw, [], match.currentPlayer.ai != null);
			return (match.DrawMatch(null, `Player decision`));
		}
		aiSpeech(match, AI_EVENTS.declineDraw, [], match.currentPlayer.ai != null);
		return (new Result().Success("OK", "draw").Format({draw: false}));
	}
	if (!socketData)
		return (new Result().Error("no socketData", 500));
	if (!match.drawPendingBool && !body.draw)
		return (new Result().Success("OK", "draw"));
	if (body.draw == false)
		return (declineDraw(match, body, socketData));
	if (!match.drawPendingBool)
		return (offerDraw(match, body, socketData));
	return (acceptDraw(match, body, socketData));
}

/**
 * decline draw
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("./utils.js").RequestBody} body
 * @param {import("../../Classes/Globals/globals.js").Socket} socketData
 */
function declineDraw(match, body, socketData)
{
	let	currTeam;
	let	result;

	match.drawPendingBool = false;
	currTeam = match.currentPlayer.team;
	do
	{
		match.currentPlayer.drawAcceptedBool = false;
		match.endTurn();
	}
	while (currTeam != match.currentPlayer.team)
	result = new Result().Success("OK", "draw");
	result.draw = false;
	socketData.socket.to(`match_${match.id}`).emit("game", result);
	return (result);
}

/**
 * accept draw
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("./utils.js").RequestBody} body
 * @param {import("../../Classes/Globals/globals.js").Socket} socketData
 */
function offerDraw(match, body, socketData)
{
	let	result;

	match.drawPendingBool = true;
	match.GetPlayer(socketData.matchData?.team).drawAcceptedBool = true;
	result = new Result().Success("OK", "draw");
	result.draw = true;
	socketData.socket.to(`match_${match.id}`).emit("game", result);
	return (result);
}

/**
 * accept draw
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("./utils.js").RequestBody} body
 * @param {import("../../Classes/Globals/globals.js").Socket} socketData
 */
function acceptDraw(match, body, socketData)
{
	let	currTeam;
	let	acceptAll;
	let	result;

	match.GetPlayer(socketData.matchData?.team).drawAcceptedBool = true;
	currTeam = match.currentPlayer.team;
	acceptAll = true;
	do
	{
		if (!match.currentPlayer.drawAcceptedBool)
		{
			acceptAll = false;
			break ;
		}
		match.endTurn();
	}
	while (currTeam != match.currentPlayer.team)
	if (acceptAll == false)
		return (new Result().Success("OK", "draw"));
	result = match.DrawMatch(null, `Player decision`);
	result.type = "draw";
	return (result);
}
