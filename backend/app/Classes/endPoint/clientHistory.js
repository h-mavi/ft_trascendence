//@ts-check

import { eEvents } from "../../Macro/enums.js";

/** @typedef {import("../Chess/history.js").HistoryEvent} HistoryEvent */

/**
 * @typedef {object} Actions
 * @property {string} type
 * @property {number} counter
 * @property {string} piece - tipo del pezzo
 * @property {string} from - coordinata partenza
 * @property {string} to - coordinata arrivo
 * @property {string} transformed_into
 * @property {string} captured_piece - tipo pezzo catturato / ""
 */

class historyClientEvents
{
	/** 
	 * 
	 * @param {Array<HistoryEvent>} events 
	 * @param {number} index
	*/
	constructor(events, index)
	{
		this.turn = index;//numero del turno
		this.team = events[0].team;//colore
		this.time = events[0].time;//tempo che è durato il turno
		/** @type {Array<Actions>} */
		this.actions = [];
		this.#PopulateActions(events);
	}
	/**  @param {Array<HistoryEvent>} events */
	#PopulateActions(events)
	{
		let	i;
		let	transformEvent;

		i = 0;
		for (const event of events)
		{
			if (event.type == eEvents.Transform)
			{
				transformEvent = event;
				continue ;
			}
			this.actions[i++] =
			{
				from: event.from,
				to: event.to,
				captured_piece: event.pieceEaten? event.pieceEaten.type : "",
				counter: event.counter,
				piece: event.movedPiece,
				transformed_into: "",
				type: event.type
			};
		}
		if (transformEvent)
		{
			if (this.actions[1]?.type == eEvents.MoveBoost)
				i = 1;
			else
				i = 0;
			this.actions[i].transformed_into = transformEvent.to;
		}
	}
}

export {historyClientEvents};