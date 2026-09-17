//@ts-check

import { DEBUG } from "../../Macro/macro.js";

/** @typedef {import("../Chess/match.js").MatchSettings} MatchSettings*/

export class matchMakingOpt
{
	/**
	 * //FIXME - controllare parametri di cosa ci viene dato
	 * @param {matchMakingOpt} options 
	 */
	constructor(options)
	{
		/** @type {string} */ 				this.matchType = "1v1";
		/** @type {string} */ 				this.roomType = "friendly";
		/** @type {MatchSettings | null} */	this.matchSettings = null;
		if (!options)
			return ;
		this.matchType = options.matchType;
		this.roomType = options.roomType;
		this.matchSettings = options.matchSettings;
	}
}