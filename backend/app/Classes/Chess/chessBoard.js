// @ts-check
/** @typedef {pieces.Piece} Piece */
/** @typedef {Map<string, Set<string>>} InfluenceMap */

//SECTION import
import {CHESSBOARD_H, CHESSBOARD_W} from "../../Macro/macro.js";
import { Cursor, coordNormify } from "./cursor.js";
import { Match } from "./match.js";
import * as pieces from "./Pieces/pieces.js";

//ANCHOR - Definition 

class Square
{
	/**
	 * 
	 * @param {Square | null} other 
	 * @param {function | null} normifier 
	 * @returns 
	 */
	constructor(other=null, normifier=null)
	{
        /** @type {string | undefined} */		this.color = undefined;
		this.index = 0;
		/** @type {boolean} */					this.wallBool = false;
        /** @type {Piece | null | undefined} */ this.piece = null;
		/** @type {Set<string>} */				this.targetZones = new Set();
		/** @type {Map<string, Set<string>>} */	this.boostedTargetZones = new Map();
		/** @type {Set<string>} */				this.dangerZones = new Set();
		/** @type {Set<string>} */				this.influenceZones = new Set();

		if (other == null)
			return ;
		this.index = other.index;
		this.color = other.color;
		this.wallBool = other.wallBool;
		if (other.piece != null)
			this.piece = pieces.copyPiece(other.piece);
		else
			this.piece = null;
		this.targetZones = other.targetZones;
		for (const [key, value] of other.boostedTargetZones)
		{
			let	normKey = normifier ? normifier(key) : key;
			this.boostedTargetZones.set(normKey, value);
		}
		if (normifier)
		{
			this.NormifyZones(normifier);
			return ;
		}
		this.dangerZones = other.dangerZones;
		this.influenceZones = other.influenceZones;
	}
	//calls .clear on target, boostedTarget, danger zones 
	ClearZones()
	{
		this.boostedTargetZones.clear();
		this.dangerZones.clear();
		this.targetZones.clear();
		this.influenceZones.clear();
	}
	/** @param {function} normifier */
	NormifyZones(normifier)
	{
		let	tmp;

		// @ts-ignore
		this.targetZones = new Set([...this.targetZones].map(normifier));
		tmp = new Map();
		for (let [k, v] of this.boostedTargetZones)
		{
			// @ts-ignore
			v = new Set([...v].map(normifier));
			this.boostedTargetZones.set(k, v);
		}
	}
	Copy()
	{
		let	other;

		other = new Square();
		other.color = this.color;
		if (this.piece)
			other.piece = this.piece.Copy();
		other.index = this.index;
		other.targetZones = structuredClone(this.targetZones);
		other.dangerZones = structuredClone(this.dangerZones);
		other.influenceZones = structuredClone(this.influenceZones);
		other.boostedTargetZones = structuredClone(this.boostedTargetZones);
		return (other);
	}
}

//ANCHOR - Methods

//SECTION - chessBoard Map 
//ANCHOR - Definition 

class ChessBoard
{
	/**
	 * shield to use the Map data structure safely
	 * @param {number} w 
	 * @param {number} h 
	 */
	constructor(w, h)
	{
		if (w != h)
			throw ("chessBoard: not implemented ;( => w != h");
		if (w % 2 || h % 2)
			throw ("chessBoard: not implemented ;( => w/h not even");
		this._data = initBoard(w, h);
		this.updates = new Set();
		this.updates.clear();
		this.width = w;
		this.heigth = h;
		this.influenceMap = initInfluenceBoard(this._data);

	}
	//SECTION - custom function
	//clear the map
	clear(){this._data.clear();}
	/** delete a key @param {string} key */
	delete(key){return (this._data.delete(key));}
	entries(){return (this._data.entries());}
	/**
	 * iterate a function in all the ChessBoard
	 * @param {(value: Square, key: string, map: Map<string, Square>) => void} f
	 * @param {*} args 
	 */
	forEach(f, args=null){this._data.forEach(f, args);}
	/** return the value. Throw if failed @param {string} key*/
	get(key)
	{
		let	val;

		val = this._data.get(key);
		if (!val)
		{
			console.trace();
			throw (`ChessBoard: invalid position ${key}`);
		}
		return (val);
	}
	/**
	 * Add a value to the ChessBoard. Update it if it don't exist
	 * @param {string} key 
	 * @param {Square} val 
	 */
	set(key, val){this._data.set(key, val);}
	/** @param {string} key*/
	has(key){return (this._data.has(key));}
	keys(){return (this._data.keys());}
	values(){return (this._data.values());}
	[Symbol.iterator](){return (this._data[Symbol.iterator]());}
	//SECTION - custom function
	/** @param {string} coord */
	ResetInfluence(coord)
	{
		let	pieceSquare;
		let	set;

		pieceSquare = this.get(coord);
		for (const menaceCoord of pieceSquare.influenceZones)
		{
			set = this.influenceMap.get(menaceCoord);
			if (!set)
				throw (`ResetInfluence in ${coord} for ${menaceCoord}`);
			set.delete(coord);
		}
		pieceSquare.influenceZones.clear();
	}
	/**
	 * 
	 * @param {string} targetCoord piece
	 * @param {string} influencedCoord influenced square
	 */
	AddInfluence(targetCoord, influencedCoord)
	{
		let SquareTarget;

		SquareTarget = this.get(targetCoord);
		SquareTarget.influenceZones.add(influencedCoord);
		this.influenceMap.get(influencedCoord)?.add(targetCoord);
	}
	PrintInfluence()
	{
		console.log("influenceMap: => \n", this.influenceMap);
		console.log("influenceSet: => \n");
		this.forEach((v, k) => {console.log(k + ":", v.influenceZones);});
		console.log("---------------------STOP\n\n");
	}
	/** @param {string} coord */
	ResetTargets(coord)
	{
		let	square;

		square = this.get(coord);
		for (const [key, value] of square.boostedTargetZones)
		{
			for (const target of value)
				this.get(target).dangerZones.delete(coord);
		}
		for (const target of square.influenceZones)
			this.get(target).dangerZones.delete(coord);
		square.targetZones.clear();
		this.ResetInfluence(coord);
		square.boostedTargetZones.clear();
	}
};

//ANCHOR - utils

/**
 * 
 * @param {number} maxWidth 
 * @param {number} maxHeigth 
 * @param {Cursor | null} cursor
 * @returns 
 */
function initBoard(maxWidth=CHESSBOARD_W, maxHeigth=CHESSBOARD_H, cursor=null)
{
	/** @type {string} */				let	squareId;
	/** @type {Map<string, Square>} */	let	board;
	let	square;
	let	i;

	i = 0;
	if (!cursor)
		cursor = new Cursor(maxWidth, maxHeigth);
	board = new Map();
	cursor.Save();
	cursor.set("a1");
	do
	{
		cursor.setCol(1);
		do
		{
			squareId = cursor.square;
			square = new Square();
			board.set(squareId, square);
			square.index = i++;
		}
		while (cursor.moveCol(1))
	}
	while (cursor.moveRow(1))
	cursor.Restore();
	return (board);
}

/**
 * 
 * @param {Map<string, Square>} board
 * @returns 
 */
function initInfluenceBoard(board)
{
	/** @type {InfluenceMap} */	let	influenceBoard;

	influenceBoard = new Map();
	for (const [key, value] of board)
	{
		influenceBoard.set(key, new Set());
	}
	return (influenceBoard);
}

/**
 * 
 * @param {Map<string, Square>} src 
 * @param {Map<string, Square> | null} dest optional: if passed, is cleared
 * @param {Match | null} match
 * @returns {Map<string, Square>} a deep copy of src
 */
function copyBoard(src, dest=null, match=null)
{
	if (!dest)
		dest = new Map();
	dest.clear();
	for (const [key, val] of src)
	{
		let	squareCopy;

		squareCopy = new Square(val, coordNormify);
		dest.set(coordNormify(key), squareCopy);
	}
	return (dest);
}

/**
 * 
 * @param {Map<string, Set<string>>} src 
 * @param {Map<string, Set<string>> | null} dest optional: if passed, is cleared
 * @returns {Map<string, Set<string>>} a deep copy of src
 */
function copyBoostedTargetZones(src, dest=null)
{
	let	zones;

	if (!dest)
		dest = new Map();
	dest.clear();
	zones = new Set();
	for (const [pos, targets] of src)
	{
		zones.clear();
		for (const bonusPos of targets)
		{
			zones.add(bonusPos);
		}
		dest.set(pos, new Set(zones));
	}
	return (dest);
}

export {ChessBoard, Square, initBoard, initInfluenceBoard, copyBoard, copyBoostedTargetZones};