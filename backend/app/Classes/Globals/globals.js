// @ts-check

import { Match } 										from "../Chess/match.js";
import { Queue } 										from "./Queue.js";
import { Room } 										from "./room.js";
import { AI_PROFILE_PATH, DEBUG, CHILD_NUM, IS_CHILD_PROCESS}				from "../../Macro/macro.js";
import { render } 										from "../../test/render.js";
import { AIprofiles, AIprofilesArray, enumConnection }	from "../../Macro/enums.js";
import { Result } 										from "../endPoint/result.js";
import { SocketInfo } 									from "./socketInfo.js";
import fs 												from "fs";
import { zobristGenerateTable } 						from "../../utils/zobrist.js";
import { Tournament } 									from "../Chess/tournament.js";
import { clientSetState } 								from "../../websocket/utils.js";
import { Child } 										from "./Child.js";

/** @typedef {import("../Chess/chessBoard.js").ChessBoard} ChessBoard*/
/** @typedef {import("../Chess/player.js").Player} Player*/
/** @typedef {import("./socketInfo.js").SocketInfo} Socket*/
/** @typedef {Record<string, [number, number]>} ZobristCache*/
/** @typedef {string} matchId */
/** @typedef {string} stringifyBoard*/

const	TEST_MATCH = "0";

/**SECTION class Globals 
 * the place where server runtime data are stored
 * 
*/
class Globals
{
	constructor()
	{
		/** @type {Map<string | undefined, Match>} */
		this.matches = new Map();
		/** @type {Map<number, Socket>} */
		this.clientMap = new Map();
		/** @type {Map<number | undefined, Child>} */
		this.childMap = new Map();
		/** @type {Queue} */
		this.rankedQueue = new Queue(enumConnection.RANKED);
		/** @type {Queue} */
		this.friendlyQueue = new Queue(enumConnection.FRIENDLY);
		/** @type {Map<number | undefined | null, Tournament>} */
		this.tournamentMap = new Map();
		// /** @type {Queue} */
		// this.arenaQueue = new Queue(enumConnection.ARENA);
		/** @type {Map<string | undefined, Room>} */
		this.rooms = new Map();
		/** @type {Map<number, NodeJS.Timeout>} */
		this.timers = new Map();
		this.lastMatchId = TEST_MATCH;
		/** @type {Map<matchId, Array<stringifyBoard>>} */
		this.matchCache = new Map();
		this.turns = ['QF', 'SF', 'F'];
		this.zobristTable = zobristGenerateTable();
		this.AITraining = getTrainingSchedule();
		/** @type {Map<string, number>} */
		this.AIgameCounter = new Map();
		this.tournamentMap.set(0, new Tournament("DEBUG"));
		this.tournamentMap.get(0)?.DEBUGtournament();
		if (IS_CHILD_PROCESS == false)
			this.CreateChild();
		this.childId = -1;
	}
	/** @param {string} roomType */
	GetQueue(roomType)
	{
		switch (roomType)
		{
			case (enumConnection.RANKED):
				return (this.rankedQueue);
			case (enumConnection.FRIENDLY):
				return (this.friendlyQueue);
			case (enumConnection.PRIVATE):
				throw (`GetQueue: roomType ${roomType} invalid for matchmaking`);
			default:
				throw (`GetQueue: roomType ${roomType} invalid`);
		}
	}
	/** 
	 * 
	 * @param {number} userId
	 * @param {*} options
	*/
	FindQueue(userId, options)
	{
		let	queue;
		let	queueNode;
		let	queueNodeArray = [];

		if (!options)
			throw ("FindQueue: please give an empty object as second parameter.");
		queueNodeArray.push(this.rankedQueue.get(userId));
		queueNodeArray.push(this.friendlyQueue.get(userId));
		console.log(this.friendlyQueue);
		if (queueNodeArray[0])
			queue = this.rankedQueue;
		else if (queueNodeArray[1])
			queue = this.friendlyQueue;
		else
			throw ("FindQueue: user " + userId + " is not in any queue");
		queueNode = queue.get(userId);
		if (!queueNode)
			throw ("FindQueue: something went wrong with " + userId);
		options.roomType = queue.roomType;
		options.matchType = queueNode.matchType;
		options.matchSettings = queueNode.matchOptions;
		return (queue);
	}
	/** @param {number} userId */
	RemoveFromAllQueues(userId, resetTimerBool=true)
	{
		this.friendlyQueue.DelNode(userId, resetTimerBool);
		this.rankedQueue.DelNode(userId, resetTimerBool);
	}
	/** @param {number} timerId */
	ClearTimer(timerId)
	{
		clearTimeout(this.timers.get(timerId));
		this.timers.delete(timerId);
	}
	GetLastMatch()
	{
		let	match;

		match = this.matches.get(this.lastMatchId);
		if (!match)
			throw (`GetLastMatch: ${this.lastMatchId} does not exist`);
		return (match);
	}
	getDebugMatch()
	{
		let	debugMatch;

		if (!DEBUG)
			return (null);
		debugMatch = this.matches.get(TEST_MATCH);
		return (debugMatch);
	}
	/**
	 * 
	 * @param {string | undefined} matchId 
	 * @param {string} playerTeam 
	 */
	DeletePlayer(matchId, playerTeam)
	{
		let	match;
		/** @type {Player}*/
		let	player;
		let	result;

		if (!matchId)
			return (null);
		match = this.matches.get(matchId);
		if (!match)
			return (null);//@ts-ignore
		player = match[playerTeam];
		if (!player)
			return (null);
		result = match.PlayerLost(null, player);
		//NOTE - refresho il currentPlayer
		if (match.currentPlayer.next == playerTeam)//@ts-ignore
			match.currentPlayer.next = match[match.currentPlayer.next].next;
		if (match.currentPlayer.team == playerTeam)
			match.endTurn();
		render(match);
		if (match.playerNum <= 1)
		{
			result = match.CheckMate(null);
			clientSetState(match.currentPlayer.dbTable.id_user);
		} 
		return (result);
	}
	/** 
	 * 
	 * @param {SocketInfo} socketInfo
	 * @param {number} idUser
	 * */
	LeaveRoom(socketInfo, idUser)
	{
		let	room;

		room = this.rooms.get(socketInfo.roomData?.cryptId);
		if (!room)
			return ;
		socketInfo.socket.leave(room.id);
		if (room.players.delete(idUser) == true)
			return (new Result().Success());
		return (new Result().Error('User not in this room', 400));
	}
	CreateChild()
	{
		let i = 0;

		console.log(`creazione ${CHILD_NUM} processi figli`);
		while (i < CHILD_NUM)
		{
			this.childMap.set(i, new Child(i));
			++i;
		}
	}
	LessBusyChild()
	{
		let	lowMatch = Infinity;
		let	lowIndex = 0;

		for (const [id, child] of this.childMap)
		{
			if (child.matchSet.size < lowMatch)
			{
				lowMatch = child.matchSet.size;//@ts-ignore
				lowIndex = id;
			}
		}
		return lowIndex;
	}
}

function getTrainingSchedule()
{
	let trainings = new Map();
	/** @type {ZobristCache} */ let data;

	AIprofilesArray
	for (let profile of AIprofilesArray)
	{
		if (!fs.existsSync(`${AI_PROFILE_PATH}/${profile}/cache.json`))
		{
			fs.openSync(`${AI_PROFILE_PATH}/${profile}/cache.json`, "a+");
			fs.writeFileSync(`${AI_PROFILE_PATH}/${profile}/cache.json`, JSON.stringify({data: []}, null, 2));
		}
		data = JSON.parse(fs.readFileSync(`${AI_PROFILE_PATH}/${profile}/cache.json`, 'utf-8'));
		trainings.set(profile, data);
	}
	return trainings;
}

const	globals = new Globals();

export {globals};