//@ts-check

import fs from "fs";

import {eTeam, eEvents, eMatchPresets} from "../../Macro/enums.js";
import {copyBoostedTargetZones} from "./chessBoard.js";
import {HISTORY_PATH, CHESSBOARD_W, CHESSBOARD_H, MATCHTIMER} from "../../Macro/macro.js";
import {boardStringify} from "../../test/render.js";
import { Result } from "../endPoint/result.js";
import { zobristPieceHash } from "../../utils/zobrist.js";
import { jsonSafeParse } from "../../utils/response.js";
import { historyClientEvents } from "../endPoint/clientHistory.js";

/**@typedef {import("./match.js").Match} Match*/
/**@typedef {import("./match.js").MatchSettings} MatchSettings*/
/**@typedef {import("./chessBoard.js").Square} Square*/
/**@typedef {import("./Pieces/pieces.js").Piece} Piece*/
/**@typedef {import("./player.js").Player} Player*/
/**@typedef {import("../endPoint/clientHistory.js").historyClientEvents} HistoryClientEvents*/

export class History
{
	/** @param {MatchSettings | null} matchSettings*/
	constructor(matchSettings=null)
	{
		this.moves = 0;
		this.turnCounter = 0;
		this.victory = "";
		this.finalBoard = "";
		this.UpdateMoves = updateMoves;
		this.UpdateBoost = updateBoost;
		this.UpdateEndTurn = updateEndTurn;
		this.UpdateTransform = updateTransform;
		this.UpdateGiveUp = updateGiveUp;
		if (!matchSettings)
			this.matchSettings = null;
		else if (matchSettings && matchSettings.presetType)
			this.matchSettings = matchSettings.presetType;
		else
			this.matchSettings = matchSettings;
		/** @type {Array<HistoryEvent>} */
		this.events = new Array();
		/** @type {Array<HistoryClientEvents>} */
		this.clientEvents = new Array();
	}
	Last()
	{
		let	i;

		i = 0;
		while (this.events.length != i)
		{
			if (this.events[this.events.length - 1 - i].error != true)
				return (this.events[this.events.length - 1 - i]);
			++i;
		}
		return (new HistoryEvent(0, "Empty", "Empty"));
	}
	LastTurn()
	{
		/** @type {Array<HistoryEvent>} */
		let	turns;
		let	i;

		turns = [];
		i = this.events.length - 2;
		while (this.events[i] && this.events[i]?.type != eEvents.EndTurn)
		{
			turns.push(this.events[i]);
			i--;
		}
		turns = turns.reverse();
		return (turns);
	}
	AddClientTurn()
	{
		let	clientEvent;

		clientEvent = new historyClientEvents(this.LastTurn(), this.clientEvents.length);
		this.clientEvents.push(clientEvent);
	}
	/** @param {string} team */
	TurnCount(team)
	{
		let	i;

		i = 0;
		for (const event of this.events)
			i += (event.error != true && event.team == team && event.type == eEvents.EndTurn? 1 : 0);
		return (i);
	}
	/** 
	 * 
	 * @param {Match} match 
	 * @param {string} name 
	 * */
	Log(match, name="")
	{
		let	history;

		if (fs.existsSync(HISTORY_PATH) == false)
			fs.mkdirSync(HISTORY_PATH);
		if (name && fs.existsSync(name) == true)
			fs.rmSync(name);
		for (const event of this.events)
		{
			// @ts-ignore
			delete event.pieceBoosterTargetZones;
			//@ts-ignore
			delete event.isBoostedBool;
			if (event.lastLost == null)//@ts-ignore
				delete event.lastLost;//@ts-ignore
			delete event.pieceEaten;//@ts-ignore
			delete event.loserSet;//@ts-ignore
			delete event.fromHash;//@ts-ignore
			delete event.toHash;//@ts-ignore
		}
		if (name)
		{
			name = HISTORY_PATH + name;
			if (name.indexOf(".json") == -1)
				name = name + ".json";
		}//@ts-ignore
		delete this.clientEvents;
		match.history.finalBoard = boardStringify(match);
		if (match.settings.presetType)
			match.history.matchSettings = match.settings.presetType;
		history = JSON.stringify(this, jsonSafeParse, 2);
		if (!name)
			return (history);
		else
			fs.writeFileSync(name, history);
	}
};

export class HistoryEvent
{
	/**
	 * 
	 * @param {number} counter
	 * @param {string} eventType
	 * @param {string} team
	 * @param {Set<string>} updates
	 * @param {string} pieceType
	 * @param {string} from
	 * @param {string} to
	 * @param {Map<string, Set<string>> | null} pieceBoosterZones
	*/
	constructor(counter, eventType="", team="", updates=new Set, pieceType="", from="", to="", pieceBoosterZones=null, isBoosted=false)
	{
		if (!eventType)
			throw ("History Event: invalid event type");
		if (!team)
			team = "???";
		this.from = from;
		this.to = to;
		this.movedPiece = pieceType;
		this.team = team;
		this.points =
		{
			WHITE: 0,
			BLACK: 0,
			YELLOW: 0,
			BLUE: 0,
			RED: 0,
			GREEN: 0
		};
		this.pieceValue =
		{
			WHITE: 0,
			BLACK: 0,
			YELLOW: 0,
			BLUE: 0,
			RED: 0,
			GREEN: 0
		};
		this.type = eventType;
		this.pieceBoosterTargetZones = null;
		this.specialMoves = 0;
		this.isBoostedBool = isBoosted;
		this.useBoostBool = false;
		this.counter = counter;
		this.turnCounter = 0;
		this.updates = updates;
		this.turnMoves = 0;
		this.error = false;
		/** @type {string | null} */ 
		this.lastLost = null;
		/** @type {Set<number>} */
		this.loserSet = new Set();
		/** @type {Piece | null | undefined} */
		this.pieceEaten = undefined;
		this.time = MATCHTIMER;
		this.prevBoost = "";
		if (pieceBoosterZones)
			this.pieceBoosterTargetZones = copyBoostedTargetZones(pieceBoosterZones);
		this.aiSimulation = false;
		this.score = 0;
		this.fromHash = BigInt(0);
		this.toHash = BigInt(0);
		this.zobristHash = BigInt(0);
		this.zobristIndex = 0;
		this.currMenace = "";
	}
}

/**
 * 
 * @this {History}
 * @param {Match} match
 * @param {Square} square 
 * @param {Array<string>} coords 
 * @param {Result} result
 * @param {boolean} boostBool
 */
function updateMoves(match, square, coords, result, boostBool=false)
{
	let	record;
	let	eName;
	let	to;

	if (!this)
		throw ("updateMoves must be called inside of History class");
	if (!coords[0] || !coords[1])
		throw (`History: invalid move coords [${coords[0]}, ${coords[1]}]`);
	if (!square)
		throw (`History: invalid square`);
	to = match.board.get(coords[1]);
	eName = eEvents.Move;
	if (result.usedBoost || boostBool == true)
		eName = eEvents.MoveBoost;
	record = new HistoryEvent(this.moves, eName, square.piece?.team, match.board.updates, square.piece?.type, coords[0], coords[1], square.boostedTargetZones, square.piece?.isBoostedBool);
	record.pieceEaten = match.board._data.get(coords[1])?.piece;
	if (record.pieceEaten)
		record.pieceEaten = record.pieceEaten.Copy();
	record.specialMoves = result.specialMoves._mask;
	record.updates = structuredClone(match.board.updates);
	record.time = match.currentPlayer.time;
	record.prevBoost = match.currentPlayer.boostedPiece;
	record.points.WHITE = match.white.nPoints;
	record.points.BLACK = match.white.nPoints;
	record.pieceValue.WHITE = match.white.pieceValue;
	record.pieceValue.BLACK = match.black.pieceValue;
	record.fromHash = zobristPieceHash(square.index, square.piece);
	record.toHash = zobristPieceHash(to.index, to.piece);
	record.zobristHash = match._zobristHash;
	record.zobristIndex = match.zobristIndex;
	record.aiSimulation = match.aiSimulation;
	record.turnCounter = this.turnCounter;
	this.events.push(record);
	this.moves += 1;
}

/**
 * 
 * @this {History}
 * @param {Match} match
 * @param {Square} square 
 * @param {string} from 
 */
function updateBoost(match, square, from)
{
	let	record;

	if (!this)
		throw ("updateMoves must be called inside of History class");
	if (!from)
		throw (`History: invalid from coord`);
	if (!square)
		throw (`History: invalid square`);
	record = new HistoryEvent(this.moves, eEvents.Boost, square.piece?.team, match.board.updates, square.piece?.type, from);
	record.updates = structuredClone(match.board.updates);
	record.time = match.currentPlayer.time;
	record.prevBoost = match.currentPlayer.boostedPiece;
	record.fromHash = zobristPieceHash(square.index, square.piece);
	record.zobristHash = match._zobristHash;
	record.zobristIndex = match.zobristIndex;
	record.aiSimulation = match.aiSimulation;
	record.turnCounter = this.turnCounter;
	this.events.push(record);
	this.moves += 1;
}

/**
 * 
 * @this {History}
 * @param {Match} match
 * @param {Square} square 
 * @param {string} from 
 * @param {string} newType
 */
function updateTransform(match, square, from, newType)
{
	let	record;

	if (!this)
		throw ("updateMoves must be called inside of History class");
	if (!from)
		throw (`History: invalid from coord`);
	if (!square)
		throw (`History: invalid square`);
	record = new HistoryEvent(this.moves, eEvents.Transform, square.piece?.team, match.board.updates, newType, from);
	record.to = newType;
	record.updates = structuredClone(match.board.updates);
	record.time = match.currentPlayer.time;
	record.fromHash = zobristPieceHash(square.index, square.piece);
	record.zobristHash = match._zobristHash;
	record.zobristIndex = match.zobristIndex;
	record.aiSimulation = match.aiSimulation;
	record.turnCounter = this.turnCounter;
	this.events.push(record);
	this.moves += 1;}

/**
 * 
 * @this {History}
 * @param {Match} match 
 */
function updateEndTurn(match)
{
	let	record;

	if (!this)
		throw ("updateMoves must be called inside of History class");
	if (!match)
		throw (`History: invalid match`);
	if (!match.currentPlayer)
		throw (`History: invalid currentPlayer`);
	if (!match.currentPlayer.team)
		throw (`History: invalid currentPlayer team`);
	record = new HistoryEvent(this.moves, eEvents.EndTurn, match.currentPlayer.team, match.board.updates);
	record.aiSimulation = match.aiSimulation;
	record.turnMoves = match.moves;
	record.turnCounter = this.turnCounter;
	this.events.push(record);
	if (!record.aiSimulation)
		this.turnCounter += 1;
	this.moves += 1;
}

/**
 * 
 * @this {History}
 * @param {Match} match 
 * @param {string} team
 */
function updateGiveUp(match, team=match.currentPlayer.team)
{
	let	record;

	if (!this)
		throw ("updateMoves must be called inside of History class");
	if (!match)
		throw (`History: invalid match`);//@ts-ignore
	if (!match[team])
		throw (`History: invalid team ${team}`);
	record = new HistoryEvent(this.moves, eEvents.GiveUp, team);
	record.turnCounter = this.turnCounter;
	this.events.push(record);
	this.moves += 1;
}
