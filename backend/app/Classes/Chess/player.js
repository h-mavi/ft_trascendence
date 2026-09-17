//@ts-check

import {MATCHTIMER} from "../../Macro/macro.js";
import {eTeam, eEvents} from "../../Macro/enums.js";
import { AI } from "./AI.js";

/** @typedef {import("./match.js").MatchSettings} MatchSettings*/
/**
 *  @typedef {{
 * id_user: number; name: string; surname: string; username: string; email: string; nationality: string; image: Uint8Array<ArrayBuffer> | null; points: number; title: string; preferences: *}
 * } dbUser
 * 
*/

class Player
{
	/** 
	 * 
	 * @param {string} color 
	 * @param {MatchSettings} settings 
	 * @param {string | null} ai
	*/
	constructor(color, settings, ai=null)
	{
		//SECTION - preset data
		//@ts-ignore
		let	data = preset[color];
		if (!data)
			throw (`cannot find player ${color}`);
		//SECTION - user data
		/** @type {dbUser} *///@ts-ignore
		this.dbTable = null;
		this.matchId = "0";
		this.id = 0;
		/** @type {number | undefined} */
		this.tournament_index = undefined;
		/** @type {number | null} */
		this.expectedElo = null;
		//SECTION - gameData
		this.nPoints = settings.players.startPoints;
		this.bonusPointCounter = 0;
		this.useBoostBool = false;
		this.nPieces = 16;
		//FIXME - statico per 8x8 2 giocatori (usato solo qui)
		this.pieceValue = 44;
		this.King = "";
		this.boostedPiece = "";
		/** @type {Set<{coord: string, target: string}>} */
		this.guardianPieces = new Set;
		/** @type {Set<string>} */
		this.castlingArray = new Set();
		this.time = MATCHTIMER;
		this.team = data.team;
		this.next = data.next;
		this.prev = data.prev;
		this.ally = data.ally;
		this.allieGuardianCoord = "";
		this.drawAcceptedBool = false;
		/** @type {AI<null> | null} */
		this.ai = null;
		if (ai)
			this.ai = new AI(ai);
		else if (settings.ai?.team == this.team)
			this.ai = new AI(settings.ai.profile);
	}
}

const preset = 
{
	white: 
	{
		team: eTeam.White,
		next: eTeam.Black,
		prev: eTeam.Black,
		ally: eTeam.White,
	},
	black: 
	{
		team: eTeam.Black,
		next: eTeam.White,
		prev: eTeam.White,
		ally: eTeam.Black,
	},
	red: 
	{
		team: eTeam.Red,
		next: eTeam.Green,
		prev: eTeam.Blue,
		ally: eTeam.Yellow,
	},
	blue: 
	{
		team: eTeam.Blue,
		next: eTeam.Red,
		prev: eTeam.Yellow,
		ally: eTeam.Green,
	},
	green: 
	{
		team: eTeam.Green,
		next: eTeam.Yellow,
		prev: eTeam.Red,
		ally: eTeam.Blue,
	},
	yellow: 
	{
		team: eTeam.Yellow,
		next: eTeam.Blue,
		prev: eTeam.Green,
		ally: eTeam.Red,
	},
}

export {Player};