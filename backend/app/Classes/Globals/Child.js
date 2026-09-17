//@ts-check

import { eChildEvents, eEvents }				from "../../Macro/enums.js";
import { isOneOf } 					from "../../utils/string.js";
import { clientResetData, clientSetState, gameMessage, roomMessage } from "../../websocket/utils.js";
import { fork } 					from "child_process";
import { Result } 					from "../endPoint/result.js";

/**
 * @typedef {{
 *	ChildId: number,
 *	MatchId: number | undefined,
 *	Event: string,
 *	userId?: number | undefined,
 *	Data: *,
 * }} ChildData
 */

class Child
{
	/** @param {number} index */
	constructor(index)
	{
		/** @type {Set<number>} */
		this.matchSet = new Set;
		this.id = index;
		/** @type {Map<number | undefined, number>} */
		this.userIdMap = new Map();
		this.child = fork("handlers/child/child.js");
		if (!this.child)
			throw (`Child: fork has failed`);

		this.#SetListeners();
	}
	/**
	 * send data to the child
	 * @param {string} event 
	 * @param {*} data 
	 * @param {number | undefined} matchId 
	 * @param {number | undefined} userId
	 */
	Send(event, data, matchId=undefined, userId=undefined)
	{
		/** @type {ChildData} */
		let	childData;

		if (matchId && userId)
			this.userIdMap.set(matchId, userId);
		childData = {ChildId: this.id, MatchId: matchId, Event: event, userId: userId, Data: data};
		this.child.send(childData);
	}
	//SECTION - private methods
	/** 
	 * get child data
	*/
	#SetListeners()
	{
		this.child.on("spawn", () => 
		{
			this.Send(eChildEvents.Init, null);
		});
		this.child.on("close", () => 
		{
			console.log(`figlio con id ${this.id} ha chiuso i ponti col padre`);
			this.#Reset();
		});
		this.child.on("disconnect", () => 
		{
			console.log(`figlio con id ${this.id} e morto in guerra`);
		});
		this.child.on("message", (/** @type {ChildData} */data) => 
		{
			if (isOneOf(data.Event, eChildEvents.Game, eChildEvents.CreateMatch, eChildEvents.GameMsg))
			{
				console.log(`message from ${data.MatchId}, event ${data.Event}, data: ${data.Data}`);
				if (data.Event == eChildEvents.Game && !data.Data.type)
					data.Data.type = eEvents.Move;
				roomMessage(`match_${data.MatchId}`, data.Event, data.Data);
				if (data.Data.victory)
					this.#EndGame(data.MatchId, this.userIdMap.get(data.MatchId));
			}
			else if (data.Event == eChildEvents.Error)
			{
				console.log(`child ${this.id} error`);
				console.log(JSON.stringify(data, null, 2));
				roomMessage(`match_${data.MatchId}`, "error", new Result().Error((data.Data), 500));
			}
			else if (data.Event == eChildEvents.Log)
			{
				console.log(`child log: ${data.Data}`);
			}
			else
				throw (`Not correct child event type`);
		});
	}
	/**
	 * 
	 * @param {number | undefined} matchId 
	 * @param {number | undefined} userId 
	 */
	#EndGame(matchId, userId)
	{
		clientResetData(userId);
		this.userIdMap.delete(matchId);
	}
	#Reset()
	{
		for (let id of this.matchSet)
		{
			roomMessage(`match_${id}`, "error", new Result().Error("crash", 500));
			this.#EndGame(id, this.userIdMap.get(id));
		}
		this.child = fork("handlers/child/child.js");
		this.matchSet.clear();
		this.#SetListeners();
	}
}

export {Child};