// @ts-check
import {eTeam} from "../../Macro/enums.js";


import {CHESSBOARD_H, CHESSBOARD_W} from "../../Macro/macro.js";

/**
 * 
 * @this {Cursor}
 */
function getRow()
{
	return(this.square.charCodeAt(0) - "a".charCodeAt(0) + 1);
}

/**
 * 
 * @this {Cursor}
 */
function getCol()
{
	return(this.square.charCodeAt(1) - "0".charCodeAt(0));
}

/**
 * 
 * @this {Cursor}
 * @param {number} newRow 
 */
function setRow(newRow) 
{
	let col;
	let newSquare;

	col = this.getRow();
	newSquare = String.fromCharCode(newRow + "a".charCodeAt(0) - 1);
	newSquare += String.fromCharCode(col + "0".charCodeAt(0));
	this.square = newSquare;
}

/**
 * 
 * @this {Cursor}
 * @param {number} newCol 
 */
function setCol(newCol) 
{
	let newSquare;

	newSquare = String.fromCharCode(this.getCol() + "a".charCodeAt(0) - 1);
	newSquare += String.fromCharCode(newCol + "0".charCodeAt(0));
	this.square = newSquare;
}

/**
 * 
 * @this {Cursor}
 * @param {Number} dy 
 */
function moveRow(dy)
{
	let tmp = this.getCol();

	if ((tmp + dy) < this._h + 1 && (tmp + dy) > 0)
		this.setCol(this.getCol() + dy);
	else
		return (false);
	return (true);
}

/**
 * 
 * @this {Cursor}
 * @param {Number} dx 
 */
function moveCol(dx)
{
	let tmp = this.getRow();

	if ((tmp + dx) < this._w + 1 && tmp + dx > 0)
		this.setRow(tmp + dx);
	else
		return (false);
	return (true);
}

/**
 * 
 * @this {Cursor}
 * @param {number} newCol 
 * @param {number} newRow 
 */
function setCursor(newCol, newRow)
{
	let newSquare;

	if (typeof newRow === "string" && newCol === undefined)
	{
		this.square = newRow;
		return ;
	}
	if (typeof newRow === "number" && typeof newCol === "number")
	{
		newSquare = String.fromCharCode(newRow + "a".charCodeAt(0) - 1);
		newSquare += String.fromCharCode(Number(newCol) + "0".charCodeAt(0));
		this.square = newSquare;
		return ;
	}
	throw new Error("setCursor accetta una square string o due numeri");
}

/**
 * 
 * @this {Cursor}
 * @param {String} pos
 */
function set(pos)
{
	let	square;

	square = pos.at(0);
	if (!square)
		return ;
	this.square = square;
	this.square += pos.slice(1, pos.length);
}

/** @param {string} coord */
function coordNormify(coord)
{
	let col;
	let	row;
	let newSquare;

	row = coord.charCodeAt(1) - "0".charCodeAt(0);
	col = coord.charCodeAt(0) - "a".charCodeAt(0) + 1;
	if (coord.length > 2)
	{
		coord = coord.slice(1, coord.length);
		col = String.fromCharCode(col + "a".charCodeAt(0) - 1);
		newSquare = col + String.fromCharCode(Number(coord) + "0".charCodeAt(0));
	}
	else
	{
		col = String.fromCharCode(col + "a".charCodeAt(0) - 1);
		newSquare = col + String(row);
	}
	return (newSquare);
}

class Cursor
{
	/**
	 * 
	 * @param {number} w width 
	 * @param {number} h heigth
	 */
	constructor(w=CHESSBOARD_W, h=CHESSBOARD_H)
	{
		/** @type {string} */ this.square = "a1"; // the string position: a1, b2, c3...
		this._save_pos = "a1";
		this._w = w;
		this._h = h;
		this.getRow = getCol.bind(this);
		this.getCol = getRow.bind(this);
		this.setRow = setCol.bind(this);
		this.setCol = setRow.bind(this);
		//moves cursor to n row. Returns false if failed, true if succeed
		this.moveRow = moveCol.bind(this);
		//moves cursor to n col. Returns false if failed, true if succeed
		this.moveCol = moveRow.bind(this);
		this.set = set.bind(this);
		this.setCursor = setCursor.bind(this);
	}
	/** saves the current cursor square */
	Save()
	{
		this._save_pos = this.square;
	}
	/** restore the cursor square saved by cursor::Save */
	Restore()
	{
		this.square = this._save_pos;
	}
	/** @param {string} team */
	EdgeCheck(team="", coord="")
	{
		let	tmp;
		let	edgeBool;

		tmp = this.square;
		if (!coord)
			coord = this.square;
		this.square = coord;
		switch (team)
		{
			case (eTeam.Black): case (eTeam.Red):
			{
				edgeBool = (this.getRow() == 1);
				break ;
			}
			case (eTeam.White): case (eTeam.Yellow):
			{
				edgeBool = (this.getRow() == this._h);
				break ;
			}
			case (eTeam.Green):
			{
				edgeBool = (this.getCol() == 1);
				break ;
			}
			case (eTeam.Blue):
			{
				edgeBool = (this.getCol() == this._w);
				break ;
			}
			case (""):
			{
				let col = this.getCol();
				let row = this.getRow();
				edgeBool = (col == 1 || row == this._h || col == 1 || col == this._w);
				break ;
			}
			default:
				throw (`EdgeCheck: invalid team ${team}`);
		}
		this.square = tmp;
		return (edgeBool);
	}
	/**
	 * 
	 * @param {boolean} isTop 
	 * @param {boolean} isRight 
	 */
	GetCorner(isTop, isRight)
	{
		let	tmp;
		let	cornerCoord;

		tmp = this.square;
		this.setRow(isTop? this._h: 1);
		this.setCol(isRight? this._w: 1);
		cornerCoord = this.square;
		this.square = tmp;
		return (cornerCoord);
	}
	/**
	 * 
	 * @param {number} colAlign -1 = left, +1 = right
	 * @param {number} rowAlign -1 = bottom, +1 = top
	 */
	GetCenter(colAlign=0, rowAlign=0)
	{
		let	tmp;
		let	cornerCoord;

		tmp = this.square;
		this.setRow(this._h / 2);
		this.setCol(this._w / 2);
		if (rowAlign != 0)
			this.setRow(rowAlign > 0? this._h: 1);
		if (colAlign != 0)
			this.setCol(colAlign > 0? this._w: 1);
		cornerCoord = this.square;
		this.square = tmp;
		return (cornerCoord);
	}
	/** @param {string} coord */
	Normify(coord=this.square)
	{
		return (coordNormify(coord));
	}
	/** @param {string} coord1 */
	Diff(coord1, coord2=this.square)
	{
		let	cols;
		let	rows;
		let	tmp;

		tmp = this.square;
		cols = [0, 0];
		rows = [0, 0];
		coord1 = this.Normify(coord1);
		coord2 = this.Normify(coord2);
		this.set(coord1);
		cols[0] = this.getCol();
		rows[0] = this.getRow();
		this.set(coord2);
		cols[1] = this.getCol();
		rows[1] = this.getRow();
		this.square = tmp;
		return ({col: cols[0] - cols[1], row: rows[0] - rows[1]});
	}
	/** @param {string} coord1 */
	IsOblique(coord1, coord2=this.square)
	{
		let	diff;

		diff = this.Diff(coord1, coord2);
		if (diff.col && diff.row)//both exists (oblique)
			return (true);
		return (false);//one of them is zero (vertical/horyzontal)
	}
}

export {Cursor, coordNormify};
