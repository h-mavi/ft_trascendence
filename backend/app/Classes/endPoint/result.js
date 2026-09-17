//@ts-check
import { enumSpecialMoves as move } from "../../Macro/enums.js";
import {copyBoard} from "../Chess/chessBoard.js";

/** @typedef {import('../Chess/chessBoard.js').Square} Square */
/** @typedef {import('../Chess/match.js').Match} Match */
/** @typedef {Map<String, Square>} Board */

//SECTION - contents
//	class Result
//	Board manipulation
//	game error management utils

class bitMaskMoves
{
	constructor()
	{
		this._mask = 0;
	}
	SetCastling(){this._mask |= move.CASTLING};
	CheckCastling(){return (this._mask & move.CASTLING)};
	SetTransfiguration(){this._mask |= move.TRANSFIGURATION};
	CheckTransfiguration(){return (this._mask & move.TRANSFIGURATION)};
	SetEndGame(){this._mask |= move.ENDGAME};
	CheckEndGame(){return (this._mask & move.ENDGAME)};
	SetKingDanger(){this._mask |= move.CHECK};
	CheckKingDanger(){return (this._mask & move.CHECK)};
	SetCheckMate(){this._mask |= (move.CHECKMATE | move.ENDGAME)};
	CheckKingCheck(){return (this._mask & move.CHECKMATE)};
	SetSniperMove(){this._mask |= (move.SNIPER)};
	CheckSniperMove(){return (this._mask & move.SNIPER)};
	SetBastardMove(){return (this._mask |= move.ISBASTARD)};
	CheckBastardMove(){return (this._mask & move.ISBASTARD)};
	SetEatenBastard(){return (this._mask |= move.EATENBASTARD)};
	CheckEatenBastard(){return (this._mask & move.EATENBASTARD)};
	SetChampionBoostUsed(){return (this._mask |= move.CHAMPIONBOOST)};
	CheckChampionBoostUsed(){return (this._mask & move.CHAMPIONBOOST)};
	SetDraw(){return (this._mask |= move.DRAW)};
	CheckDraw(){return (this._mask & move.DRAW)};
	SetAllyGuardian(){return (this._mask |= move.ALLYGUARDIAN)};
	CheckAllyGuardian(){return (this._mask & move.ALLYGUARDIAN)};
	SetBoostUsed(){return (this._mask |= move.USEDBOOST)};
	CheckBoostUsed(){return (this._mask & move.USEDBOOST)};
}

//SECTION - class Result

class Result
{
	/**
	 * 
	 * @param {Result | null} other
	 */
	constructor (other=null, type="")
	{
		/** @type {Number | null} */		this.status = 200;
		/** @type {string | null} */		this.msg = "OK";
											this.log = {status: this.status, msg: this.msg}; 
		/** @type {Board | null} */			this.board = null;
	/** @type {boolean | string} */			this.usedBoost = false;
											this.victory = "";
											this.specialMoves = new bitMaskMoves();
/** @type {string | undefined} */			this.team = undefined;
		/** @type {Match | null} */			this.match = null;
		/** @type {boolean | undefined} */	this.draw = undefined;
		/** @type {string | undefined} */	this.type = type ? type : undefined;

		//@ts-ignore
		this.board = {};
		if (!other)
			return ;
		this.status = other.status;
		this.msg = other.msg;
		if (other.match)
			this.match = other.match;
		if (other.board)
			this.board = copyBoard(other.board, this.board, this.match);
	}
	Success(msg="OK", type="")
	{
		this.status = 200;
		this.msg = msg;
		this.log = {status: this.status, msg: this.msg};
		if (type)
			this.type = type;
		return (this);
	}
	Error(msg="Backend failed for unknown reasons", status=500, printBool=false)
	{
		this.status = status;
		this.msg = msg;
		this.log = {status: this.status, msg: this.msg};
		if (printBool)
			console.log(`Error ${status}: ${msg}`);
		return (this);
	}
	/** @param {object} obj */
	Format(obj)
	{
		let	iterable;

		iterable = Object.entries(obj);
		for (const [key, val] of iterable)
		{//@ts-ignore
			this[key] = val;
		}
		return (this);
	}
}

export {Result};