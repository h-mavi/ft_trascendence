//@ts-check
import { globals } 							from "../../Classes/Globals/globals.js";
import { enumConnection, enumSocketState } 	from "../../Macro/enums.js";
import { Match } 							from "../../Classes/Chess/match.js";
import { init } 							from "../../handlers/game/init.js";
import { render } 							from "../../test/render.js";
import { query } 							from "../../lib/query.js";
import { responseFormatter }				from "../../utils/response.js";
import { saveMatch } from "../../utils/saveMatch.js";
import { rng } from "../../utils/random.js";
import { clientResetData } from "../utils.js";
import { openMatch } from "../../query/gameQuery.js";

/** @typedef {import("../../Classes/Chess/player.js").Player} Player*/
/** @typedef {import("../../Classes/endPoint/result.js").Result} Result*/
/** @typedef {import("../../Classes/Globals/socketInfo.js")} Socket */
/** @typedef {import("../../Classes/endPoint/matchInit.js").matchMakingOpt} MatchMakingOpt*/
/** @typedef {import("../../Classes/Globals/Queue.js").Queue} Queue*/
/** @typedef {import("../../Classes/Globals/Queue.js").QueueNode} QueueNode*/
/** @typedef {import("../../Classes/Chess/player.js").dbUser} dbUser*/

/**
 * 
 * @param {import("../../Classes/Chess/player.js").dbUser} user
 * @param {MatchMakingOpt} options
 *///@ts-ignore
export async function MatchMaking(user, options={})
{
	let queue;
	let	queueNode;
	let	socketData;

	console.log(user);
	socketData = globals.clientMap.get(user.id_user);
	if (!socketData)
		throw (`user id ${user.id_user} does not exist`);
	socketData.reconnectBool = false;
	if (socketData.state == enumSocketState.MATCHMAKING)//NOTE - se il client era in fase di disconnessione
		queue = globals.FindQueue(user.id_user, options);
	else
		queue = globals.GetQueue(options.roomType);
	socketData.state = enumSocketState.MATCHMAKING;
	queueNode = queue.get(user.id_user);
	if (queueNode?.IsFull() == true)
		return createMatchFromQueue(queue, queueNode);
	queue.AddNode(user, options);
	findMatch(queue, user);
	console.log(`user in queue ${options?.roomType}:`);
	console.log(queue);
}

/**
 * 
 * @param {Queue} queue 
 * @param {dbUser} user 
 * @returns 
 */
export async function findMatch(queue, user)
{
	let findBool = false;
	let	queueNode;

	queueNode = queue.get(user.id_user);
	if (!queueNode)
	{
		console.warn(`findMatch: node for user ${user.id_user} undefined. ${console.trace()}`);
		return ;
	}
	if (queue.get(user.id_user)?.IsFull())
		return createMatchFromQueue(queue, queueNode);
	else
		findBool = queue.Find(user);
	queueNode = queue.get(user.id_user);
	if (!queueNode)
		throw (`findMatch, after FIND: node for user ${user.id_user} undefined. ${console.trace()}`);
	if (findBool && queue.get(user.id_user)?.IsFull())
		return createMatchFromQueue(queue, queueNode);
	else if (!findBool)
		queueNode.increaseDelta(queueNode.eloRange.max + 15, queueNode.eloRange.min + 15);
	console.log("Adding timer for", user.id_user);
	globals.timers.set(user.id_user, setTimeout(() => {
		clearTimeout(globals.timers.get(user.id_user));
		globals.timers.delete(user.id_user);
		findMatch(queue, user);
	}, 5000));
	return (true);
}

/**
 * @param {Queue} queue 
 * @param {QueueNode} queueNode
 */
async function createMatchFromQueue(queue, queueNode)
{
	let	match;
	let	result;
	let	preset;
	let	set;

	if (await validateMatch(queueNode) == false) 
		return (false);
	set = structuredClone(queueNode.userSet);
	preset = queueNode.matchOptions? queueNode.matchOptions: queueNode.matchType;
	clientResetData(queueNode.userSet);
	console.log(preset);
	match = new Match(preset);
	result = init(match, preset);
	if (queue.roomType == enumConnection.RANKED)
		match.settings.room.isRanked = true;
	match.id = `${await openMatch(match)}`;
	globals.lastMatchId = match.id;
	globals.matches.set(globals.lastMatchId, match);
	result.Format({id: match.id});
	await bindPlayersToMatch(match, set, result);
	render(match);
	console.log("CREAZIONE MATCH: ♟️");
	console.log(set);
	return (true);
}

/**
 * check that all players are properly connected
 * @param {QueueNode} queueNode
 */
function validateMatch(queueNode)
{
	let	socket;

	for (const id_user of queueNode.userSet)
	{
		socket = globals.clientMap.get(id_user);
		if (socket?.reconnectBool == true)
			return (false);
	}
	return (true);
}

/**
 * check that all players are properly connected
 * @param {Match} match
 * @param {Set<number>} userSet
 * @param {Result} result
 * @param {Map<number, number> | null} userIdIndexMap
 */
export async function bindPlayersToMatch(match, userSet, result, userIdIndexMap=null)
{
	let	i;
	let	userArray;
	let	user;
	let	userId;
	let	currTeam;
	let dbTable;
	let	tourIndex;
	let	startTeam;

	match.socketBool = true;
	i = 0;
	userArray = Array.from(userSet);
	currTeam = match.currentPlayer.team;
	do
	{
		userId = userArray[i];
		user = globals.clientMap.get(userId);
		if (!user)
		{
			console.log("bindPlayerToMatch: userId " + userArray[i] + " has left");
			match.users.push({id_user: userId, outcome: "Lose", startTeam: null, team: match.currentPlayer.team, tour_index: tourIndex});
			match.currentPlayer.tournament_index = tourIndex;
			match.currentPlayer.id = userId;
			match.currentPlayer.matchId = match.id;
			++i;
			console.log(`team ${match.currentPlayer.team} settato come sconfitto`);
			match.DeletePlayer();
			if (match.currentPlayer.team == currTeam)
				break ;
			match.endTurn();
			continue ;
		}
		user.state = enumSocketState.PLAYING;
		match.currentPlayer.matchId = match.id;
		match.currentPlayer.id = userId;
		dbTable = await query.usersQuery.getUserById(userId);
		if (!dbTable)
			throw (`bindPlayersToMatch: cannot get user ${userId} from db`);//@ts-ignore
		match.currentPlayer.dbTable = dbTable;//@ts-ignore
		startTeam = match.settings?.players[match.currentPlayer.team];
		tourIndex = userIdIndexMap?.get(userId);
		match.currentPlayer.tournament_index = tourIndex;
		match.users.push({id_user: userId, outcome: "Lose", startTeam: null, team: match.currentPlayer.team, tour_index: tourIndex});
		user.matchData = match.currentPlayer;
		globals.RemoveFromAllQueues(userId, false);
		//@ts-ignore
		result.team = match.currentPlayer.team;
		user.socket.join(`match_${match.id}`);
		++i;
		match.endTurn();
	}
	while (currTeam != match.currentPlayer.team)
	match.ExpectedElo();
	result = responseFormatter(match, result, "Room created!", 200);
	i = 0;
	do
	{
		userId = userArray[i];
		user = globals.clientMap.get(userId);
		if (!user?.socket)
			throw (`bindPlayersToMatch: user 0 with id ${userId} undefined or invalid`);
		//@ts-ignore
		result.team = match.currentPlayer.team;
		user.socket.emit("game", result);
		i++;
		match.endTurn();
	}
	while (currTeam != match.currentPlayer.team)
	if (match.playerNum == 1)
		match.CheckMate();
	if (match.playerNum == 0)
		match.victory = match.users[rng(match.users.length)].team;
	if (match.victory)
		saveMatch(match);
}
