//@ts-check

import { Player } from "../Chess/player.js";
import { Room } from "./room.js";
import { enumSocketState } from "../../Macro/enums.js";

/** @typedef {{id: number, me: {id: number, index: number}, opponent: {id: number, index: number}, matchId: string, ready: boolean}} tournamentData*/

export class SocketInfo
{
	/**
	 * 
	 * @param {import("socket.io").Socket} socket 
	 */
	constructor(socket)
	{
		this.socket = socket;
		this.allowedBool = true;
		this.reconnectBool = false;
		this.state = enumSocketState.NAVIGATING;
		/** @type {Player | null} */
		this.matchData = null;
		/** @type {{matchId: number, ChildId: number} | null} */
		this.aiMatchData = null;
		/** @type {number | null} */
		this.spectateData = null;
		/** @type {Room | null} */
		this.roomData = null;
		/** @type {tournamentData | null} */
		this.tournamentData = null;
		/** @type {Array<number>} */
		this.friendsId = [];
	}
	GetmatchId()
	{
		let id = this.matchData ? this.matchData.matchId : this.aiMatchData?.matchId;

		if (!id && this.spectateData)
			id = this.spectateData;
		if (!id)
			return undefined;
		return (`${id}`);
	}
}
