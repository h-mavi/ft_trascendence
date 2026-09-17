//@ts-check 

import { callbackify } from "node:util";
import { Result } from "../../Classes/endPoint/result.js";
import { globals } from "../../Classes/Globals/globals.js";
import { boost, gameAIHandler, gameWebSocketHandler } from "../../handlers/game/Game.js";
import { eEvents, enumConnection, enumSocketState } from "../../Macro/enums.js";
import { historyGetMatchState } from "../../utils/history.js";
import { gameMessage, isBusy } from "../utils.js";
import { fakeBoost } from "../../handlers/game/boost.js";
import { AIexecuteTurn } from "../../GameLogic/aiTurn.js";

/** @typedef {{from: *, to: *}} */

/** 
 * @param {import("socket.io").Socket} socket
 * @param {import("../../Classes/Chess/player.js").dbUser} user
 * */
export function routesGame(socket, user)
{
	let socketData;

	socket.on("amiplaying", async(req, callback) =>
	{
		let	socketData;
		let	isPlaying;

		if (!callback && typeof(req) == "function") //questo serve perchè io da frontend non mando mai callback come argomento
			callback = req;
		socketData = globals.clientMap.get(user.id_user);
		isPlaying = socketData?.state == enumSocketState.PLAYING;
		if (typeof(callback) == "function")
			callback(isPlaying);
	});

	socket.on("game", async(/** @type {{from: *, to: *, type: string, draw: boolean}}*/req, callback) =>
	{
		let	status;

		socketData = globals.clientMap.get(user.id_user);
		try
		{
			status = await gameWebSocketHandler(req, user.id_user, socketData);
		}
		catch(err)
		{
			let	match;

			//@ts-ignore
			match = globals.matches.get(socketData?.matchData?.matchId); 
			if (match)
				match.history.Log(match, `CRASH_${match.id}`);
			throw (`routesGame: ${err}`);
		}
		//NOTE - the callback alerts the frontend that emit is done
		if (typeof(callback) == "function")
			callback({log: {status: status}});
	});

	socket.on("simulate_boost", async(req, callback) => 
	{
		let result;
		let	socketData;
		let match;

		socketData = globals.clientMap.get(user.id_user);
		if (socketData?.aiMatchData)
		{
			if (typeof(callback) == 'function')
				callback(new Result().Success("OK"));
			req.type = eEvents.SimulateBoost;
			return (gameAIHandler(req, socketData));
		}
		match = globals.matches.get(socketData?.matchData?.matchId);//@ts-ignore
		if (!match || !match[socketData?.matchData?.team])
			result = new Result().Error("You can't simulate the boost", 403);
		else
		{
			result = fakeBoost(match, req.from);
			socket.emit("simulate_boost", result);
		}
		if (typeof(callback) == 'function')
			callback(result);
	});

	socket.on("replay_game", async(/** @type {{matchId: number, moveId: number, delBool?: Boolean}}*/req, callback) => 
	{
		let	result;

		if (isBusy(user.id_user) == true)
			result = new Result().Error("You are already doing something", 400);
		else
			result = await historyGetMatchState(req);
		socket.emit("replay_game", result);
		if (typeof(callback) == "function")
			callback(result);
	});

	socket.on("spectate", async(/** @type {{matchId: number, exitBool: boolean}} */req, callback) =>
	{
		let	result;
		let	socketData;
		//FIXME - gestione exitBool
		socketData = globals.clientMap.get(user.id_user);
		if (!socketData)
			result = new Result().Error("Server lost your data", 500);
		else if (!globals.matches.get(`${req?.matchId}`))
			result = new Result().Error("Cannot find match " + req?.matchId, 404);
		else
		{
			result = new Result().Success();
			socket.join(`match_${req.matchId}`);
			socket.to(`match_${req.matchId}`).emit(`${socketData}`);
		}
		socket.emit("spectate", result);
		if (typeof(callback) == "function")
			callback(result);
	});

	socket.on("gameMsg", async(/** @type {{author: string, msg: string}}*/req, callback) => 
	{
		let	result;
		let	socketData;

		console.log("messaggio: ");
		console.log(req);
		socketData = globals.clientMap.get(user.id_user);
		if (!req || !req.author || !req.msg)
			result = new Result().Error(`missing 'author' or 'msg' in ${req}`, 400, true);
		else if (!socketData)
			result = new Result().Error("Server lost your data", 500, true);
		else if (!socketData.aiMatchData && !socketData.matchData && !socketData.spectateData)
			result = new Result().Error("Match does not exist", 404, true);
		else if (!socketData.aiMatchData && !(globals.matches.get(`${socketData.GetmatchId()}`)))
			result = new Result().Error("Match is lost.. " + socketData.GetmatchId(), 500, true);
		else
		{
			gameMessage(socketData.GetmatchId(), req.msg, req.author, console.log);
			result = new Result().Success("OK", "msg");
		}
		socket.emit("gameMsg", result);
		if (typeof(callback) == "function")
			callback(result);
	});
}
