// @ts-check
import fs from "fs";

import {Cursor} from "./cursor.js";
import {eTeam, eMatchPresets, getEloTitle} from "../../Macro/enums.js";
import {Square, initBoard, copyBoard, copyBoostedTargetZones, ChessBoard} from "./chessBoard.js";
import {HISTORY_PATH, CHESSBOARD_W, CHESSBOARD_H, AI_EVENTS} from "../../Macro/macro.js";
import {Result} from "../endPoint/result.js";
import {Player} from "./player.js";
import { isDangerous } from "../../utils/checkDanger.js";
import { DangerUpdate } from "../../utils/dangerUpdate.js";
import { History } from "./history.js";
import { MATCHTIMER } from "../../Macro/macro.js"; 
import { globals } from "../Globals/globals.js";//@ts-ignore
import EloRank from "elo-rank";
import { query } from "../../lib/query.js";
import { render } from "../../test/render.js";
import { aiSpeech } from "./AIprofiles/speech.js";
import { zobristGenerateTable, zobristInitHash } from "../../utils/zobrist.js";
import { rng } from "../../utils/random.js";
import { clientSetState, gameMessage } from "../../websocket/utils.js";
import { includesOneOf, isOneOf } from "../../utils/string.js";
import { notify } from "../../utils/notification.js";

/** @typedef {import("../Globals/Queue.js").QueueNode} QueueNode*/
/** @typedef {import("./Pieces/pieces.js").Piece} Piece*/

class Match
{

	/** @param {MatchSettings | string | null} preset*/
	constructor(preset=null)
	{
		let	w;
		let	h;
	
		if (!preset)
			this.settings = new MatchSettings(matchPresets.twoPlayer);
		else
			this.settings = new MatchSettings(preset);
		this.white = new Player(eTeam.White, this.settings);
		this.black = new Player(eTeam.Black, this.settings);
		this.red = new Player(eTeam.Red, this.settings);
		this.blue = new Player(eTeam.Blue, this.settings);
		this.green = new Player(eTeam.Green, this.settings);
		this.yellow = new Player(eTeam.Yellow, this.settings);
		/** @type {Array<{id_user: number, outcome: string, startTeam: string | null, team: string, tour_index?: number}>} */
		this.users = [];
		w = this.settings.board.width;
		h = this.settings.board.heigth;
		this.board = new ChessBoard(w, h);
		this.cursor = new Cursor(w, h);
		this.moves = 0;
		this.boost = 0;
		this.history = new History(this.settings);
		this.historyCreateBool = false;
		this.currentPlayer = this.white;
		this.lastMenace = {from: "", mid: "", to: ""};
		this.boostPriority = new Set;
		this.playerNum = this.settings.players.number;
		this.loserSet = new Set();
		this.victory = "";
		this.drawPendingBool = false;
		/** @type {Timer | null} */ this.timer = null;
		if (this.settings.players.number == 4)
			this.currentPlayer = this.yellow;
		this.start_date = new Date().toISOString();
		this.id = "0";
		/** @type {Number|null}*/this.tournament_id = null;
		/** @type {String|null}*/this.tournament_round = null;
		this.spareCountDown = 0;
		/** @type {Map<string, number>}*/ this.boardStateMap = new Map();
		this.cursor.square = this.currentPlayer.King;
		this.elo = new EloRank();
		if (!this.elo)
			throw (`Match: eloRank library error during initialization`);
		this.socketBool = false;
		/** @type {number | null} */
		this.tournament = null;
		//is AI simulating a move?
		this.aiSimulation = false;
		//when AI finishes simulating and makes the real turn
		this.aiMove = false;
		//if any of the players is an AI
		this.aiBool = false;
		this.zobristIndex = 0;
		/** @type {Array<number>} */
		this.zobristTable = [];
		/** @type {Map<number, number>} */
		this.simulationMap = new Map();
	}
	/** @param {MatchSettings | string | null} preset*/
	Reset(preset=null)
	{
		let	w;
		let	h;
	
		if (!preset && !this.settings)
			this.settings = new MatchSettings(matchPresets.twoPlayer);
		else
			this.settings = new MatchSettings(preset);
		this.white = new Player(eTeam.White, this.settings);
		this.black = new Player(eTeam.Black, this.settings);
		this.red = new Player(eTeam.Red, this.settings);
		this.blue = new Player(eTeam.Blue, this.settings);
		this.green = new Player(eTeam.Green, this.settings);
		this.yellow = new Player(eTeam.Yellow, this.settings);
		this.users = [];
		w = this.settings.board.width;
		h = this.settings.board.heigth;
		this.board = new ChessBoard(w, h);
		this.cursor = new Cursor(w, h);
		this.moves = 0;
		this.boost = 0;
		this.history = new History(this.settings);
		this.historyCreateBool = false;
		this.currentPlayer = this.white;
		this.lastMenace = {from: "", mid: "", to: ""};
		this.boostPriority = new Set;
		this.playerNum = this.settings.players.number;
		this.loserSet = new Set();
		this.victory = "";
		/** @type {Timer | null} */ this.timer = null;
		if (this.settings.players.number == 4)
			this.currentPlayer = this.yellow;
		this.start_date = new Date().toISOString();
		this.id = "0";
		this.tournament_id = null;
		this.tournament_round = null;
		this.spareCountDown = 0;
		this.boardStateMap = new Map();
		this.elo = new EloRank();
		if (!this.elo)
			throw (`Match: eloRank library error during initialization`);
		this.socketBool = false;
		this.cursor.square = this.currentPlayer.King;
		this.tournament = null;
		this.aiSimulation = false;
		this.aiMove = false;
		this.aiBool = this.settings.ai != undefined && this.settings.ai.profile != "";
		zobristInitHash(this);
	}
	endTurn()
	{
		/** @type {String} */ let	next = this.currentPlayer.next;

		// @ts-ignore
		if (!this.currentPlayer || !next || !this[next])
		{
			throw ("currentPlayer BUG");
		}
		// @ts-ignore
		this.currentPlayer = this[next];
	}
	forceWhiteTurn()
	{
		this.currentPlayer = this.white;
	}
	forceYellowTurn()
	{
		this.currentPlayer = this.yellow;
	}
	NextPlayer()
	{
		/** @type {Player} */
		let	player;

		//@ts-ignore
		player = this[this.currentPlayer.next];
		return (player);
	}
	PrevPlayer()
	{
		/** @type {Player} */
		let	player;

		//@ts-ignore
		player = this[this.currentPlayer.prev];
		return (player);
	}
	/** 
	 * @param {string} team 
	 * @returns {Player}
	 * */
	GetPlayer(team)
	{//@ts-ignore
		return (this[team]);
	}
	/** @param {string} team */
	GetThreats(team)
	{
		let ret = new Array();//@ts-ignore
		let kingSquare = this.board.get(this[team].King)

		for (let zone of kingSquare.dangerZones)
		{
			if (this.board.get(zone).piece && this.board.get(zone).piece?.team != team)
				ret.push(zone);
		}
		return ret;
	}
	CheckOtherKingsDanger()
	{
		/** @type {Player} */let	player;
		/** @type {Square} */let	kingSquare;

		//@ts-ignore
		player = this[this.currentPlayer.next];
		while (player.team != this.currentPlayer.team)
		{
			kingSquare = this.board.get(player.King);
			if (isDangerous(this, kingSquare.dangerZones, player.team) == true)
				return (true);
			//@ts-ignore
			player = this[player.next];
		}
		return (false);
	}
	/** @return {Array<Piece>} */
	GetBoostedPieceTypes()
	{
		/** @type {Player} */			let	player;
		/** @type {Square | undefined} */let	pieceSquare;
		/** @type {Array<*>} */let	arr = [];
		/** @type {Array<string>} */let	arrPriority;

		//@ts-ignore
		player = this[this.currentPlayer.next];
		while (player.team != this.currentPlayer.team)
		{
			pieceSquare = this.board._data.get(player.boostedPiece);
			if (!pieceSquare?.piece?.type)
			{
				//@ts-ignore
				player = this[player.next];
				continue ;
			}
			arr.push(this.board.get(player.boostedPiece).piece?.type);//@ts-ignore
			player = this[player.next];
		}
		if (this.currentPlayer.boostedPiece)
			arr.push(this.board.get(player.boostedPiece).piece?.type);//@ts-ignore
		return (arr);
	}
	GetBoostedPieceCoords(considerCurrentPlayerBool=false, sortByPriorityBool=false)
	{
		/** @type {Player} */			let	player;
		/** @type {Square | undefined} */let	pieceSquare;
		/** @type {Array<string>} */let	arr = [];
		/** @type {Array<string>} */let	arrPriority;

		//@ts-ignore
		player = this[this.currentPlayer.next];
		while (player.team != this.currentPlayer.team)
		{
			pieceSquare = this.board._data.get(player.boostedPiece);
			if (!pieceSquare?.piece?.type)
			{
				//@ts-ignore
				player = this[player.next];
				continue ;
			}
			arr.push(player.boostedPiece);
			//@ts-ignore
			player = this[player.next];
		}
		if (considerCurrentPlayerBool && this.currentPlayer.boostedPiece)
			arr.push(this.currentPlayer.boostedPiece);
		if (arr.length == 0)
			return (null);
		if (sortByPriorityBool == false || arr.length == 1)
			return (arr);
		arrPriority = Array.from(this.boostPriority);
		arr.sort((coord1, coord2) =>
		{
			let piece1;
			let piece2;

			piece1 = this.board.get(coord1).piece;
			piece2 = this.board.get(coord2).piece;
			if (!piece1)
				return (-1);
			if (!piece2)
				return (1);
			//closure is used to remember the priority
			return (arrPriority.indexOf(piece1.team) - arrPriority.indexOf(piece2.team));			
		});
		return (arr);
	}
	/** 
	 * 
	 * @param {Result | null} result 
	 * */
	CheckMate(result=null)
	{
		console.log("haaaaaiiiiii viiiiiiintoooooooooo!!!!!!!");
		if (this.aiSimulation == true)
			return (new Result());
		this.victory = this.currentPlayer.team;
		this.history.victory = this.victory;
		clientSetState(this.currentPlayer.dbTable?.id_user);
		this.UpdateElo(this.currentPlayer, true);
		for (const user of this.users)
		{
			if (this.FindPlayer(user.team) == true)
				user.outcome = "Win";
		}
		if (this.timer)//@ts-ignore
			clearTimeout(this.timer.timeout);
		if (this.id != "0")
			globals.matches.delete(this.id);
		globals.lastMatchId = "0";
		if (!result)
			result = new Result();
		result.Success(`${this.currentPlayer.team} won!`);
		result.victory = this.victory;
		result.specialMoves.SetCheckMate();
		return (result);
	}
	/**
	 * 
	 * @param {Result | null} result 
	 * @param {Player} player 
	 */
	PlayerLost(result, player=this.currentPlayer)
	{
		if (this.aiSimulation == true)
		{
			this.victory = player.next;
			return (new Result());
		}
		console.log(player.team, ":haaaaaiiiiii persoooooooooooooooooo!!!!!!!");
		render(this);
		aiSpeech(this, AI_EVENTS.checkMateOppo, player.team != this.currentPlayer.team);
		this.history.Last().loserSet.add(player.id);
		this.UpdateElo(player, false);
		this.DeletePlayer(player);
		this.history.Last().lastLost = player.team;
		if (!result)
			result = new Result();
		result.Success(`${player.team} has lost`);
		if (result != null)
		{
			result.msg = "you lost!!!";
			result.status = 200;
			result.specialMoves.SetCheckMate();
		}
		else
			return (new Result());
		return (result);	
	}
	/**
	 * 
	 * @param {Result | null} result
	 * @param {string} reason 
	 */
	DrawMatch(result, reason)
	{
		let player;
		let tmp;

		if (this.aiSimulation == true)
		{
			this.victory = "draw";
			return (new Result());
		}
		console.log("ed e' un pareggioooooooo!!!!");
		render(this);
		this.victory = "draw";
		console.debug(reason);
		tmp = this.currentPlayer;
		player = tmp.next;
		for (let x of this.users)
		{
			if (this.FindPlayer(x.team))
				x.outcome = "Draw";
		}
		//@ts-ignore
		while (this[player].team != tmp.team)
		{
			this.DeletePlayer(tmp);
			//@ts-ignore
			tmp = this[player];
			player = tmp.next;
		}
		if (this.timer)//@ts-ignore
			clearTimeout(this.timer.timeout);
		this.DeletePlayer(tmp);
		//@ts-ignore
		tmp = this[player];
		player = tmp.next;
		this.currentPlayer.next = this.currentPlayer.team;
		this.currentPlayer.prev = this.currentPlayer.team;
		if (this.id != "0")
			globals.matches.delete(this.id);
		globals.lastMatchId = "0";
		if (result == null)
			result = new Result();
		result.Success("it's a spare!!!");
		result.victory = this.victory;
		result.specialMoves.SetDraw();
		return (result);
	}
	/** @param {string} team */
	FindPlayer(team)
	{
		let	currTeam = this.currentPlayer.team;
		let	foundBool = false;

		do
		{
			if (team == this.currentPlayer.team)
				foundBool = true;
			this.endTurn();
		}
		while(this.currentPlayer.team != currTeam)
		return (foundBool);
	}
	ExpectedElo()
	{
		let	currTeam;
		let average;

		if (this.settings.room.isRanked == false)
			return ;
		currTeam = this.currentPlayer.team;
		do
		{
			average = getOtherAverage(this);
			this.currentPlayer.expectedElo = this.elo.getExpected(this.currentPlayer.dbTable.points, average);
			this.endTurn();
		}
		while (this.currentPlayer.team != currTeam)
	}
	/** @param {string} name */
	Log(name="")
	{
		return (this.history.Log(this, name));
	}
	/** @param {Player} player */
	DeletePlayer(player=this.currentPlayer)
	{
		let	boostedSquare;

		if (!player)
			throw (`Delete player: invalid player`);
		//@ts-ignore
		if (!this[player.team])
			throw (`Delete player: invalid player data`);
		this.loserSet.add(player.id);
		clientSetState(player.dbTable?.id_user);
		this.playerNum--;
		if (!player.prev)
			return ;
		//@ts-ignore
		this[player.prev].next = player.next;
		//@ts-ignore
		this[player.next].prev = player.prev;
		if (!player.boostedPiece)
			return ;
		this.boostPriority.delete(player.team);
		boostedSquare = this.board.get(player.boostedPiece);
		if (!boostedSquare.piece)
			throw (`DeletePlayer: invalid boosted piece in ${player.boostedPiece}`);
		boostedSquare.piece.isBoostedBool = false;
		DangerUpdate(this, player.boostedPiece);
	}
	/**
	 * 
	 * @param {function} func 
	 */
	ForEachTeam(func)
	{
		let	current;

		current = this.currentPlayer.team;
		do
		{
			func(arguments);
			this.currentPlayer = this.currentPlayer.next;
		}
		while (this.currentPlayer.team != current)
	}
	PlayerKingSquare()
	{
		return (this.board.get(this.currentPlayer.King));
	}
	/** @param {Set<number>} userSet */
	CreateId(userSet)
	{
		this.id = createMatchId(userSet);
		return (this.id);
	}
	getPieceNumber()
	{
		let total;
		let p;

		total = this.currentPlayer.nPieces;
		//@ts-ignore
		p = this[this.currentPlayer.next];
		while (p.team != this.currentPlayer.team)
		{
			total += p.nPieces;
			//@ts-ignore
			p = this[p.next];
		}
		return total;
	}
	/**
	 * 
	 * @param {Player} player
	 * @param {boolean} winBool
	 */
	UpdateElo(player, winBool)
	{
		let	newElo;
		let	title;

		if (this.settings.room.isRanked != true)
			return ;
		if (!player.expectedElo)
			throw (`UpdateElo: elo not initializated`);
		newElo = this.elo.updateRating(player.expectedElo, winBool? 1: 0, player.dbTable.points);
		if (player.dbTable.points == newElo)
			newElo += winBool ? 1 : -1;
		gameMessage(this, `UpdateElo: user ${player.dbTable.username} old elo is ${player.dbTable.points}, new is ${newElo}`);
		player.dbTable.points = newElo;
		title = getEloTitle(newElo);
		query.usersQuery.updateUserELO(player, title);
		if (title != player.dbTable.title)
		{
			notify("N", " ", player.dbTable, null);
			console.log(`titolo e cambiato`);
		}
	}
}

/**
 * 
 * @param {Set<number>} userSet 
 * @returns 
 */
function createMatchId(userSet)
{
	let userNames = "";
	let date;
	let id;
	for (let x of userSet)
		userNames += x;
	date = Date.now().toString();
	id = date + userNames;
	return (id);
}

/** @param {Match} match */
function getOtherAverage(match)
{
	let	currTeam;
	let	eloAverage;
	let	i;

	currTeam = match.currentPlayer.team;
	eloAverage = 0;
	match.endTurn();
	if (match.playerNum == 2)
	{
		eloAverage = match.currentPlayer.dbTable.points;
		match.endTurn(); 
		return (eloAverage);
	}
	i = 0;
	while (match.currentPlayer.team != currTeam)
	{
		++i;
		eloAverage += match.currentPlayer.dbTable.points;
		match.endTurn();
	}
	if (i == 0)
		throw (`getOtherAverage: no players`);
	return (eloAverage / i);
}

/**
 * timeout = puntatore alla funzione setTimeout
 * start = tempo in cui inizia il countdown
 * time = tempo limite del coutdown
 */
class Timer
{
	/** @param {number} time */
	/** @param {number} start */
	/** @param {NodeJS.Timeout | null} timeout */
	constructor(time=0, start=0, timeout= null)
	{
		this.timeout = timeout;
		this.start = start;
		this.time = time;
	}
}

class MatchSettings
{
	/** @param {MatchSettings | string | null} other */
	constructor(other=null)
	{
		if (other == "0")
			other = null;
		if (typeof(other) == "string")
		{
			this.preset = other;
			other = this.GetPresetByType(other);
		}
		else //@ts-ignore
			this.preset = other == null ? other : other.preset;
		this.timer = MATCHTIMER;
		this.board =
		{
			width: CHESSBOARD_W,
			heigth: CHESSBOARD_H,
			seed: 0,
			start: "",
			corners: false
		};
		this.players =
		{
			number: 2,
			startPoints: 0,
			allies: false,
			teams:
			{
				white: "",
				black: "",
				yellow: "",
				red: "",
				blue: "",
				green: ""
			}
		};
		this.ai = {
			profile : "",
			team : ""
		}
		this.room =
		{
			isRanked: false
		};
		/** @type {string | null} */
		this.presetType = null;
		if (!other)
			return ;
		this.CopyConstructor(other);
	}
	/** @param {MatchSettings} other */
	CopyConstructor(other)
	{
		if (other.board)
			this.board = structuredClone(other.board);
		if (other.players)
			this.players = structuredClone(other.players);
		this.presetType = other.presetType;
		this.timer = other.timer;
		if (other.ai)
			this.ai = structuredClone(other.ai);
	}
	/** @param {string} matchPresetType */
	GetPresetByType(matchPresetType)
	{
		switch (matchPresetType)
		{
			case (eMatchPresets.ClassicTwoPlayers):
				return (new MatchSettings(matchPresets.twoPlayer));
			case (eMatchPresets.ClassicFreeForAll):
				return (new MatchSettings(matchPresets.fourPlayer));
			case (eMatchPresets.ClassicFourPlayers):
				return (new MatchSettings(matchPresets.fourPlayerAllies));
			case (eMatchPresets.NoCornersFourPlayers):
				return (new MatchSettings(matchPresets.fourPlayerNoCorners));
			default:
				throw (`MatchSettings: invalid preset name "${matchPresetType}"`);
		}
	}
	/** 
	 * @param {string} profile 
	 * @param {string | null} team 
	 */
	SetAiProfile(profile, team)
	{
		this.ai.profile = profile;
		if (team && isOneOf(team, eTeam.White, eTeam.Black))
			team == eTeam.White ? this.ai.team = eTeam.Black : this.ai.team = eTeam.White;
		else
			rng(2) == 0 ? this.ai.team = eTeam.White : this.ai.team = eTeam.Black;
	}
}

const matchPresets =
{
	twoPlayer: new MatchSettings(),
	fourPlayerNoCorners: new MatchSettings(),
	fourPlayer: new MatchSettings(),
	fourPlayerAllies: new MatchSettings()
}
matchPresets.twoPlayer.presetType = eMatchPresets.ClassicTwoPlayers;
matchPresets.fourPlayerNoCorners.presetType = eMatchPresets.ClassicFourPlayers;
matchPresets.fourPlayerNoCorners.board.width = 14;
matchPresets.fourPlayerNoCorners.board.heigth = 14;
matchPresets.fourPlayerNoCorners.players.number = 4;
matchPresets.fourPlayer = structuredClone(matchPresets.fourPlayerNoCorners);
matchPresets.fourPlayer.board.corners = true;
matchPresets.fourPlayer.presetType = eMatchPresets.NoCornersFourPlayers;
matchPresets.fourPlayerAllies = structuredClone(matchPresets.fourPlayer);
matchPresets.fourPlayerAllies.players.allies = true;
matchPresets.fourPlayerAllies.presetType = eMatchPresets.ClassicFourPlayers;

export {Match, Timer, MatchSettings, matchPresets, createMatchId};
