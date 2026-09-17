//@ts-check

import { isOneOf } from "../../utils/string.js";
import { eMatchPresets } from "../../Macro/enums.js";
import { matchMakingOpt } from "../endPoint/matchInit.js";
import { enumConnection } from "../../Macro/enums.js";
import { globals } from "./globals.js";
import { findMatch } from "../../websocket/handlers/MatchMaking.js";

/** @typedef {import("../Chess/match.js").MatchSettings} MatchSettings*/
/** @typedef {import("../Chess/player.js").dbUser} dbUser*/
/** @typedef {{min: number, max: number, avg: number}} EloRange*/

const fourPresets = [
	eMatchPresets.ClassicFourPlayers,
	eMatchPresets.ClassicFreeForAll,
	eMatchPresets.NoCornersFourPlayers];

/**
 * key: userId
 * val: user matchMaking node
 * @extends {Map<number, QueueNode>}
 */
export class Queue extends Map
{
	/** @param {string} roomType*/
	constructor(roomType) 
	{
		super();
		this.roomType = roomType;
	}
	/**
	 *  @param {dbUser} user
	 *  @param {matchMakingOpt} options
	*/
	AddNode(user, options)
	{
		if (this.has(user.id_user))
			return ;
		this.set(user.id_user, new QueueNode(user, options));
		this.get(user.id_user)?.userSet.add(user.id_user);
	}
	/**
	 *  
	 * @param {number} id_user 
	 * @param {boolean} resetTimerBool
	 * */
	DelNode(id_user, resetTimerBool=true)
	{
		let	node;
		let	tmpArray;
		let	isLeader = false;
		let	newLeaderId;

		node = this.get(id_user);
		if (!node)
			return ;
		tmpArray = Array.from(node.userSet);
		isLeader = node.userSet.size > 1 && tmpArray.indexOf(id_user) == 0;
		newLeaderId = tmpArray[1];
		node.userSet.delete(id_user);
		this.delete(id_user);
		//NOTE - if it was not the leader socket, its ok to just remove it
		if (isLeader == false || !resetTimerBool)
			return ;
		//NOTE - even the second is reconnecting, lol
		//if it disconnects: it will call delNode
		//if it reconnects: it will call matchMaking
		if (globals.clientMap.get(id_user)?.reconnectBool == true)
			return ;
		//NOTE - else, the newLeader will search new playmates
		clearTimeout(globals.timers.get(id_user));
		clearTimeout(globals.timers.get(newLeaderId));
		console.log("new matchMaking leader: old is", id_user, "new is", newLeaderId);
		globals.timers.set(id_user, setTimeout(() => 
		{//@ts-ignore
			findMatch(this, {id_user: newLeaderId, points: node.eloRange.avg});
		}, 5000));
	}
	/**
	 * @param {number} fromId 
	 * @param {number} toId 
	 */
	MergeNode(fromId, toId)
	{
		let	toNode;
		let	fromNode;
		let fromRange;

		fromNode = this.get(fromId);
		toNode = this.get(toId);
		if (!toNode || !fromNode)
			throw (`Queue, MergeNode: toNode ${toNode} or fromNode ${fromNode} does not exist`);
		fromRange = fromNode.eloRange;
		for (const id of toNode.userSet)
		{
			this.set(toId, fromNode);
			fromNode.userSet.add(id);
		}
		fromNode.EloAverage(fromRange.avg);
	}
	/** @param {dbUser} user */
	Find(user)
	{
		let userNode;
		let	foundBool = false;

		userNode = this.get(user.id_user);
		if (!userNode)
			throw (`Queue, Find: get of id_user ${user.id_user} does not exist`);
		for (let [key, otherNode] of this)
		{
			if (key == user.id_user)//se stesso
				continue ;
			if (userNode.matchType != otherNode.matchType)//tipo di match diverso
				continue ;
			if (otherNode.userSet.size == otherNode.minPlayers)//match gia pieno
				continue ;
			if (userNode.userSet.size + otherNode.userSet.size > userNode.minPlayers)//troppi giocatori
				continue ;
			if (globals.clientMap.get(key)?.reconnectBool == true)//avversario con problemi di connessione
				continue ;
			if (this.roomType == enumConnection.RANKED)//stesso range di elo
			{
				if ((userNode.eloRange.avg < otherNode.eloRange.min) && (userNode.eloRange.avg > otherNode.eloRange.max))
					continue ;
			}
			foundBool = true;
			globals.ClearTimer(key);
			globals.ClearTimer(user.id_user);
			this.MergeNode(key, user.id_user);
			if (this.get(user.id_user)?.IsFull())
				break ;
		}
		return (foundBool);
	}
}

export class QueueNode
{
	/**
	 *  @param {import("../Chess/player.js").dbUser} user
	 *  @param {matchMakingOpt} options
	*/
	constructor(user, options)
	{
		let	elo;

		elo = user.points;
		/** @type {Set<number>} */ 					this.userSet = new Set();
		/** @type {EloRange} */						this.eloRange = {min: elo, max: elo, avg: elo};
		/** @type {MatchSettings | null}*/			this.matchOptions = options.matchSettings ? options.matchSettings:null;
		/** @type {string} */						this.matchType = options.matchType;
		/** @type {number} */						this.minPlayers = 2;

		if (isOneOf(this.matchType, fourPresets))
			this.minPlayers = 4;
	}
	IsFull()
	{
		return (this.userSet.size == this.minPlayers);
	}
	/**
	 * 
	 * @param {number} max 
	 * @param {number} min 
	 */
	increaseDelta(max, min)
	{
		if ((max - min) == 400)
			return ;
		this.eloRange.max = max;
		this.eloRange.min = min;
		this.eloRange.avg = (max + min) / 2;
	}
	/** 
	 * 
	 * @param {number} otherElo
	 */
	EloAverage(otherElo)
	{
		let tot;

		this.eloRange.min = this.eloRange.min < otherElo? this.eloRange.min : otherElo;
		this.eloRange.max = this.eloRange.max > otherElo? this.eloRange.max : otherElo;
		tot = (this.eloRange.max + this.eloRange.min) / 2;
		this.eloRange.avg = tot;
	}
}