//@ts-check

import { Result } from "../../Classes/endPoint/result.js";
import { globals } from "../../Classes/Globals/globals.js";
import { enumSocketState } from "../../Macro/enums.js";
import { roomMessage } from "../utils.js";
import { createTournamentRoomHandler, initTournament, joinTournamentRoomHandler, startRoundHandler } from "../handlers/tournament.js";

/** @typedef {import("../../Classes/Globals/socketInfo.js").SocketInfo} SocketInfo */

/** 
 * 
 * @param {import("socket.io").Socket} socket
 * @param {import("../../Classes/Chess/player.js").dbUser} user
 * */
export function routesTournament(socket, user)
{
	let socketData;
	let result;

	socket.on('create_tournament', async (/** @type {{name: string, maxPlayers: number}}*/req, callback) => 
	{
		result = await createTournamentRoomHandler(req, socket, user);
		socket.emit('create_tournament', result);
		if (typeof(callback) == "function")
			callback(result);
	});

	socket.on('join_tournament', async(/** @type {{tournament_pwd: string}}*/req, callback) =>
	{
		result = await joinTournamentRoomHandler(req, socket, user);
		socket.emit('join_tournament', result);
		if (typeof(callback) == "function")
			callback(result);
	});

	socket.on('leave_tournament', async(req, callback) =>
	{
		socketData = globals.clientMap.get(user.id_user);
		if (!socketData)
			throw (`leave_tournament: socketData is empty`);
		socketData.state = enumSocketState.NAVIGATING;
		result = globals.LeaveRoom(socketData, user.id_user);
		roomMessage(socketData.roomData?.cryptId, 'leave_tournament', result);
		if (typeof(callback) == "function")
			callback(result);
	});

	socket.on('start_round', async (/** @type {{DEBUG: Boolean}} */ req, callback) => 
	{
		result = await startRoundHandler(req, socket, user);
		if (result.status != 200)
			console.log("Round error: " + JSON.stringify(result, null, 2));
		else
			console.log("round started");
		socket.emit("start_round", result);
		if (typeof(callback) == "function")
			callback(result);
	});

	socket.on('tournament_tree', async (req, callback) =>
	{
		let	tournamentData;

		tournamentData = getTourData(user.id_user);
		if (!tournamentData)
			result = new Result().Error(`tournament not found.`, 404);
		else if (req?.index != undefined && Number.isInteger(req.index) == false)
			result = new Result().Error(`Invalid index ${req.index}`, 400);
		else
		{
			result = new Result().Success();
			if (tournamentData.userIds[req.index])//@ts-ignore
				result.data = tournamentData.userIds[req.index];
			else//@ts-ignore
				result.data = tournamentData.userIds;
		}
		if (typeof(callback) == "function")
			callback(result);	
	});

	//FIXME - ban_tournament
}

/** @param {number | SocketInfo} userData */
function getTourData(userData)
{
	let	socketData;
	let	tournament;

	if (typeof(userData) == "number")
		socketData = globals.clientMap.get(userData);
	else
		socketData = userData;
	if (!socketData)
		throw (`getTourData: socketData for ${userData} does not exist`);
	tournament = globals.tournamentMap.get(socketData.tournamentData?.id);
	return (tournament);
}