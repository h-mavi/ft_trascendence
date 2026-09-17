//@ts-check

import { eMatchPresets } from "../../Macro/enums.js";
import { createTournament } from "../../query/tournamentsQuery.js";
import { rng } from "../../utils/random.js";
import { createMatchTournament } from "../../websocket/handlers/tournament.js";
import { roomMessage } from "../../websocket/utils.js";
import { globals } from "../Globals/globals.js";
import { createMatchId } from "./match.js";

/** @typedef {number} matchId */
/** @typedef {number} userId */
/** @typedef {Array<Array<matchId>>} OldMatch */
/** @typedef {Array<Array<userId>>} UserIds */

/*
### Oggetto torneo

- Array(round)<Array(matches)<matchId>> oldMatchIds
- Array(round)<Array(users)<matchId>> usersId
- string matchType
- number playerNum
*/

export class Tournament
{
	/**
	 * 
	 * @param {string} name
	 * @param {string} matchType 
	 * @param {number} playerNum 
	 */
	constructor (name="", matchType=eMatchPresets.ClassicTwoPlayers, playerNum=8)
	{
		this.id = 0;//NOTE - prendiamo da prisma
		this.adminId = 0;
		this.name = name;
		/** @type {OldMatch} */
		this.oldMatchIds = new Array();
		this.startUserIds = new Set();
		/** @type {UserIds} */
		this.userIds = new Array();
		this.matchType = matchType;
		this.playerNum = playerNum;
		this.round = 0;
		this.activeMatches = 0;
		this.first = 0;
		this.second = 0;
		this.third = [0, 0];
	}
	RNGplayer()
	{
		this.userIds.at(0)?.sort(() => 
		{
			return (rng(2) == 1? -1: 1);
		});
	}
	async initAllMatches()
	{
		/** @type {Map<number, number>} */
		let	userIdIndexMap;
		let	players;
		let	roundIds;
		let	match;

		roundIds = this.userIds[this.round];
		for (let i = 0; i != roundIds.length; i += 2)
		{
			players = new Set([roundIds[i], roundIds[i + 1]]);
			userIdIndexMap = new Map();
			userIdIndexMap.set(roundIds[i], roundIds[i + 1]);
			userIdIndexMap.set(roundIds[i + 1], roundIds[i]);
			match = await createMatchTournament(players, createMatchId(players), this.id, userIdIndexMap);
		}
	}
	/** @param {number} id */
	addUser(id)
	{
		this.startUserIds.add(id);
	}
	/** @param {number} id */
	delUser(id)
	{
		this.startUserIds.delete(id);
	}
	/** @param {number} id */
	addMatch (id)
	{
		if (!this.oldMatchIds.at(this.round))
			this.oldMatchIds[this.round] = new Array();
		this.oldMatchIds[this.round].push(id);
	}
	nextRound()
	{
		let	i;
		let	me;
		let	meId;
		let	opponent;
		let	oppoId;
		let	matchId;

		i = 0;
		while (this.userIds[this.round].length > i)
		{
			meId = this.userIds[this.round][i];
			oppoId = this.userIds[this.round][i + 1];
			matchId = createMatchId(new Set([meId, oppoId]));
			me = globals.clientMap.get(meId);
			opponent = globals.clientMap.get(oppoId);
			if (!me || !opponent)
				throw (new Error(`initTournament: unhandled player disconnect. info: ${{me: me, opponent: opponent}}`));
			this.activeMatches += 1;
			me.tournamentData = {id: this.id, me: {id: meId, index: i}, opponent: {id: oppoId, index: i + 1}, matchId: matchId, ready: false};
			opponent.tournamentData = {id: this.id, me: {id: oppoId, index: i + 1}, opponent: {id: meId, index: i}, matchId: matchId, ready: false};
			me.socket.join(`match_${matchId}`);
			opponent.socket.join(`match_${matchId}`);
			me.socket.join(`tournament_${this.id}`);
			opponent.socket.join(`tournament_${this.id}`);
			i += 2;
		}
		roomMessage(`tournament_${this.id}`, "update_tournament", {data: this.userIds[this.round], roundId: this.round});
		this.round += 1;
	}
	checkFinish()
	{
		if (this.userIds[this.round].length != 1)
			return false;
		return true;
	}
	DEBUGtournament()
	{
		this.id = 113;
		this.adminId = 84;
		this.name = "DEBUG";
		/** @type {OldMatch} */
		this.oldMatchIds = new Array();
		this.startUserIds = new Set();
		/** @type {UserIds} */
		this.userIds = new Array();
		this.userIds[0] = [84, 2, 85, 86, 88, 67, 108, 105];
		for (const id of this.userIds[0])
			this.startUserIds.add(id);
		this.playerNum = 8;
		this.round = 0;
		this.activeMatches = 0;
		this.first = 0;
		this.second = 0;
		this.third = [0, 0];
	}
}
