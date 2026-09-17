// @ts-check

//SECTION - boost function
/*
	list of exports:
	-	gameHttpHandler:		Handles game http request/responses
	-	gameWebSocketHandler:	Handles game websocket events
	-	error:					USED ONLY BY TERM.JS to display game error
*/

import {jsonParser, responseFormatter} from "../../utils/response.js";
import { Result, clientBoard, normifyRequest } from "./utils.js";
import { move } from "./move.js";
import { endTurn } from "./endTurn.js";
import { boost } from "./boost.js";
import { init } from "./init.js";
import { render } from "../../test/render.js";
import {makeTransfiguration} from "./transfiguration.js";
import { globals } from "../../Classes/Globals/globals.js";
import { Match} from "../../Classes/Chess/match.js";
import { isOneOf } from "../../utils/string.js";
import { gameMessage, roomMessage } from "../../websocket/utils.js";
import { eEvents, enumSocketState, eChildEvents } from "../../Macro/enums.js";
import { saveMatch } from "../../utils/saveMatch.js";
import { checkKingDanger } from "../../utils/checkDanger.js";
import { reload } from "./reload.js";
import { AItraining } from "../../Classes/Chess/AIprofiles/training.js";
import { drawHandler } from "./draw.js";

/** @typedef {import("express").Request} Request*/
/** @typedef {import("express").Response} Response*/

/**
 * handler of game POST requests
 * @param {*} req 
 * @param {*} res 
 */
async function gameHttpHandler(req, res)
{
	let	body;
	let	match;
	let	result;

	match = globals.getDebugMatch();
	if (!match)
		return (res.status(401).json({log: {status: 401, msg: "DEBUG IS FALSE"}}));
	body = normifyRequest(match.cursor, req.body);
	if (body.type == "init")
	{
		result = init(match, body.from);
		match.cursor.set(match.currentPlayer.King);
		responseFormatter(match, result, null, null);
		render(match);
		globals.matches.set("0", match);
	}
	else
		result = await gameHandler(match, body);
	res.status(result.log.status).json(result);
}

/**
 * 
 * @param {import("./utils.js").RequestBody} req
 * @param {import("../../Classes/Globals/globals.js").Socket | undefined} socketData 
 */
async function gameAIHandler(req, socketData)
{
	let	child;

	child = globals.childMap.get(socketData?.aiMatchData?.ChildId);
	if (!child)
		throw (`gameAIHandler: child of ${socketData?.aiMatchData?.ChildId} not set`);
	child.Send(eChildEvents.Game, req, socketData?.aiMatchData?.matchId);
	return (200);
}

/**
 * 
 * @param {import("./utils.js").RequestBody} req
 * @param {number} id_user 
 * @param {import("../../Classes/Globals/globals.js").Socket | undefined} socketData 
 */
async function gameWebSocketHandler(req, id_user, socketData)
{
	let	match;
	let	matchId;
	let	result;
	let	id;
	let	user;

	if (!socketData)
		return (console.error("ERROR: disconnected player not eliminated"), 500);
	if (socketData.aiMatchData)
		return (await gameAIHandler(req, socketData));
	if (!socketData.matchData)
		return (socketError(socketData.socket, null, 401, "Socket: you are not a player."));
	matchId = socketData.GetmatchId();
	if (!matchId)
		return (socketError(socketData.socket, null, 401, `Socket: match ${matchId} does not exist.`));
	match = globals.matches.get(matchId);
	if (!match)
		return (socketError(socketData.socket, null, 403, "Socket: invalid match id " + matchId));
	id = match.id;
	req = normifyRequest(match.cursor, req);
	if (isOneOf(req.type, "reload", "history"))
		result = await gameInfoHandler(match, req, socketData);
	else if (isOneOf(req.type, "giveup", "draw"))
		result = gamePlayerNotificationHandler(match, req, socketData);
	else if (match.currentPlayer.team != socketData.matchData?.team)
		return (socketError(socketData.socket, null, 401, "Socket: it's not your turn, mr.greedy cheeta", match));
	else if (!req.type)
		return (socketError(socketData.socket, null, 403, "Socket: missing param type in request", match));
	else
		result = await gameHandler(match, req, socketData);
	if (result.log.status != 200)
		return (socketError(socketData.socket, result, result.log.status, result.log.msg, match));
	result = jsonParser(result);
	//@ts-ignore
	if (!result.type)//@ts-ignore
		result.type = eEvents.Move;
	socketData.socket.emit("game", result);	
	socketData.socket.to(`match_${id}`).emit("game", result);
	console.log(socketData.socket.rooms);
	if (match.victory != "")
	{
		user = globals.clientMap.get(match.currentPlayer.id);
		if (match.victory != "draw" && user)
			user.state = enumSocketState.NAVIGATING;//@ts-ignore
		roomMessage(`match_${id}`, "game", {victory: match.victory, log: result.log});
	}
	return (200);
}

/**
 * handler of websockets and http request
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("./utils.js").RequestBody} body
 * @param {import("../../Classes/Globals/globals.js").Socket | null} socketData
 */
async function gameHandler(match, body, socketData=null)
{
	let	result;

	if (isOneOf(body.type, "reload", "history"))
		return (gameInfoHandler(match, body, socketData));
	result = new Result();
	console.clear();
	if (match.victory != "")
	{
		if (match.victory == "draw")
			error(null, result, 403, `match already finished in a ${match.victory}!`);
		else
			error(null, result, 403, `match already finished: won by ${match.victory}!`);
		return (result);
	}
	if (body.type == "move")
		result = move(match, body.from, body.to);
	else if (body.type == "boost")
		result = boost(match, body.from);
	else if (body.type == "moveboost")
		result = move(match, body.from, body.to, true);
	else if (body.type == "endturn")
		result = endTurn(match);
	else if (body.type == "trans")
		result = makeTransfiguration(match, body.from, body.to);
	else
	{
		result.Error(`invalid type ${body.type}`, 400);
		error(null, result);
		return (result);
	}
	if (!result || !result.status)
		return (error(null, result, 500, "backend function failed for unknown reasons"), result);
	if (result.status != 200)
		return (error(null, result), result);
	result = responseFormatter(match, result, null, null);//@ts-ignore
	result.type = body.type;
	render(match);
	if (match.victory && match.aiBool)
		AItraining(match);
	if (match.victory != "" && match.id != "0")
		saveMatch(match);
	return (result);
}

/**
 * handler of game info request
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("./utils.js").RequestBody} body
 * @param {import("../../Classes/Globals/globals.js").Socket | null} socketData
 */
async function gameInfoHandler(match, body, socketData=null)
{
	let	result;
	let team;

	result = new Result().Success("OK", body.type);
	if (socketData?.matchData)
		team = socketData.matchData.team;
	else if (match.currentPlayer.ai)
		team = match.NextPlayer().team;
	else
		team = match.currentPlayer.team;
	if (body.type == "reload")
	{
		reload(match, result, team);
	}
	else if (body.type == "history")
	{
		//@ts-ignore
		result.history = match.history.clientEvents[match.history.clientEvents.length - 1];
	}
	else
		throw ("gameInfoHandler: invalid type " + body.type);
	if (checkKingDanger(match))
		result.specialMoves.SetKingDanger();
	result = responseFormatter(match, result, null, null);
	return (result);
}

/**
 * handler of notification request
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("./utils.js").RequestBody} body
 * @param {import("../../Classes/Globals/globals.js").Socket | null} socketData
 */
function gamePlayerNotificationHandler(match, body, socketData)
{
	let	result;
	let	team;

	result = new Result().Success("OK", body.type);
	if (body.type == "giveup")
	{
		if (socketData)
			team = socketData.matchData?.team;
		else
			team = match.currentPlayer.ai ? match.NextPlayer().team : match.currentPlayer.team;
		match.PlayerLost(result, match.GetPlayer(team));
		if (match.currentPlayer.team == team)
			match.endTurn();
		if (match.playerNum <= 1)
			match.CheckMate(result);
		else if (checkKingDanger(match))
			result.specialMoves.SetKingDanger();
	}
	else if (body.type == "draw")
	{
		result = drawHandler(match, body, socketData);
	}
	else
		throw ("gameInfoHandler: invalid type " + body.type);
	result = responseFormatter(match, result, result.log.msg, result.log.status);
	if (match.victory != "" && match.id != "0")
		saveMatch(match);
	return (result);
}

/**
 * prints the error in console and return a valid json
 * @param {Response | null} res default: null
 * @param {*} result
 * @param {Number} status default: 0
 * @param {String | null} msg default: null
 * @param {boolean} renderBool
 * @returns false
 */
function error(res=null, result=null, status=0, msg=null, renderBool=true)
{
	if (!result)
		result = responseFormatter(null, result, msg, status);
	else
		result = responseFormatter(result.match, result, msg, status);
	if (renderBool == true)
		console.clear();
	console.log("\x1b[31mGame error\x1b[0m");
	console.log(`status: ${result.log.status}\nmsg: ${result.log.msg}`);
	if (renderBool == true)
		render(globals.getDebugMatch());
	if (!res)
		return (result);
	if (result.log.status != 0)
		res.status(result.log.status);
	res.json(result);
	return (result);
}

/**
 * 
 * @param {*} socket
 * @param {Result | null} result 
 * @param {number} status 
 * @param {string | null} msg 
 * @param {Match | null} match 
 * @param {boolean} renderBool 
 */
function socketError(socket=null, result=null, status=0, msg=null, match=null, renderBool=false)
{
	if (!result)
	{
		result = responseFormatter(null, result, msg, status);
		if (renderBool == true)
			console.clear();
		console.log("\x1b[31mGame error\x1b[0m");
		console.log(`status: ${result.log.status}\nmsg: ${result.log.msg}`);
		if (renderBool == true)
			render(match);
	}
	if (match)
	{
		gameMessage(match, result.log.msg);
	}
	if (socket)
		socket.emit("game", jsonParser(result));
	return (result?.log?.status? result.log.status: 500);
}

export {gameHandler, gameHttpHandler, gameWebSocketHandler, gamePlayerNotificationHandler, gameAIHandler, error, move, endTurn, boost, init};
