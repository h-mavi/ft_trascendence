//@ts-check

//SECTION - createChessBoard function
/*
	list of exports:
	-	initSavedBoard:	 	init a board saved in string form (B|C|...\n|B|...)
	-	initClassicBoard:	init the 8x8/14x14 classic board
	-	initRandomBoard:	init a random board, given a generation seed (int)
*/

import { Piece } from "../Classes/Chess/Pieces/pieces.js";
import {eTeam, enumNames, enumInitNames, getTeamByInitial} from "../Macro/enums.js";
import {dangerUpdateAll} from "../utils/dangerUpdate.js";
import {Match} from "../Classes/Chess/match.js";
import { isLowerCase } from "../utils/string.js";
import { render } from "../test/render.js";

/**
 * 
 * @param {Match} match 
 */
function initSavedBoard(match)
{
	let	rows;
	let	i;
	let	indexSep;//|C|B... |= sep >> indexSep = 2
	let	curr;
	let	boardStr;

	boardStr = match.settings.board.start;
	match.cursor.Save();
	rows = boardStr.split("\n");
	rows.pop();
	match.cursor.set(`a${rows.length}`);
	i = 0;
	do
	{
		match.cursor.setCol(1);
		do
		{// |C|B|...
			if (rows[i]?.at(0) == "|") // @ts-ignore
				rows[i] = rows[i]?.slice(1);// C|B|...
			indexSep = rows[i]?.indexOf("|");
			if (indexSep != undefined && indexSep != -1)
			{
				curr = rows[i]?.slice(0, indexSep);// curr = C
				//@ts-ignore
				rows[i] = rows[i]?.slice(indexSep + 1);// next = B|...
				assignPieceByType(match, curr);
			}
		}
		while (match.cursor.moveCol(1))
		++i;
	}
	while (match.cursor.moveRow(-1))
	render(match);
	dangerUpdateAll(match);
	match.cursor.Restore();
}

/**
 * 
 * @param {Match} match 
 */
function initClassicBoard(match)
{
	let	row;
	let	col;
	let	color;

	color = true;
	if (match.settings.players.number == 4)
		return initBoard4v4(match);
	for (let [key, data] of match.board)
	{
		data.piece = null;
		color = !color;
		match.cursor.set(key);
		col = match.cursor.getCol()
		row = match.cursor.getRow();
		if (row == 2 || row == 7)
			data.piece = new Piece(enumNames.BASTARDS, key);
		else if (row == 1 || row == 8)
		{
			switch (col) 
			{
				case 1: case 8:
					data.piece = new Piece(enumNames.MINOTAURUS, key);
					break;
				case 2: case 7:
					data.piece = new Piece(enumNames.JESTER, key);
					break ;
				case 3: case 6:
					data.piece = new Piece(enumNames.VALKIRYA, key);
					break ;
				case 4:
					data.piece = new Piece(enumNames.CHAMPION, key);
					break ;
				case 5:
					data.piece = new Piece(enumNames.KING, key);
					break;
				default :
					console.log("bischero");
			}
		}
		if (data.piece)
		{
			if (row == 1 || row == 2)
				data.piece.team = eTeam.White;
			else if (row == 7 || row == 8)
				data.piece.team = eTeam.Black;
		}
		if (color == true)
			data.color == eTeam.White;
		else
			data.color == eTeam.Black;
	}
	match.black.King = "e8";
	match.white.King = "e1";
	dangerUpdateAll(match);
}

/**
 * 
 * @param {Match} match
 * @param {function} rng 
 */
function initRandomBoard(match, rng)
{
	let	rand;
	let	blackPos;

	for (let [key, data] of match.board)
	{
		rand = rng(16);
		data.boostedTargetZones.clear();
		data.dangerZones.clear();
		data.targetZones.clear();
		if (rand <= 10)
			continue ;
		else if (rand == 11)
			data.piece = new Piece(enumNames.BASTARDS, key);
		else if (rand == 12)
		{
			data.piece = new Piece(enumNames.CHAMPION, key);
		}
		else if (rand == 13)
		{
			data.piece = new Piece(enumNames.JESTER, key);
		}
		else if (rand == 14)
		{
			data.piece = new Piece(enumNames.MINOTAURUS, key);
		}
		else
		{
			data.piece = new Piece(enumNames.VALKIRYA, key);
		}
		data.piece.team = match.currentPlayer.team;
		match.endTurn();
	}
	setRandomKings(match);
	dangerUpdateAll(match);
}

//SECTION - utils

/**
 * 
 * @param {Match} match 
 */
function initBoard4v4(match)
{
	let	row;
	let	col;
	let	color;
	let team;
	let diff;
	let	wallBool;

	if (match.board.width < 14 || match.board.heigth < 14)
		throw ("createChessboard: minimum is 14x14");
	wallBool = false;
	if (match.settings.board.corners == true)
		wallBool = true;
	color = true;
	diff = (match.board.heigth - 8) / 2;
	for (let [key, data] of match.board)
	{
		data.piece = null;
		color = !color;
		match.cursor.set(key);
		col = match.cursor.getCol();
		row = match.cursor.getRow();
		team = getTeamByCoord(match);
		if (wallBool && (row <= diff || row > 8 + diff) && (col <= diff || col > 8 + diff))
			data.wallBool = true;
		else if ((row == 2 || row == match.board.heigth - 1) && (col > diff && col < match.board.width - diff + 1))
			data.piece = new Piece(enumNames.BASTARDS, key, team);
		else if (row == 1 || row == match.board.heigth)
		{
			switch (col)
			{
				case 1 + diff: case 8 + diff:
					data.piece = new Piece(enumNames.MINOTAURUS, key, team);
					break;
				case 2 + diff: case 7 + diff:
					data.piece = new Piece(enumNames.JESTER, key, team);
					break ;
				case 3 + diff: case 6 + diff:
					data.piece = new Piece(enumNames.VALKIRYA, key, team);
					break ;
				case 4 + diff:
					data.piece = new Piece(enumNames.CHAMPION, key, team);
					break ;
				case 5 + diff:
					data.piece = new Piece(enumNames.KING, key, team);//@ts-ignore
					match[team].King = match.cursor.square;
					break;
				default :
					continue ;
			}
		}
		else if ((col == 2 || col == match.board.width - 1) && (row > diff && row < match.board.heigth - diff + 1))
			data.piece = new Piece(enumNames.BASTARDS, key, team);
		else if (col == 1 || col == match.board.width)
		{
			switch (row)
			{
				case 1 + diff: case 8 + diff:
					data.piece = new Piece(enumNames.MINOTAURUS, key, team);
					break;
				case 2 + diff: case 7 + diff:
					data.piece = new Piece(enumNames.JESTER, key, team);
					break ;
				case 3 + diff: case 6 + diff:
					data.piece = new Piece(enumNames.VALKIRYA, key, team);
					break ;
				case 4 + diff:
					data.piece = new Piece(enumNames.CHAMPION, key, team);
					break ;
				case 5 + diff:
					data.piece = new Piece(enumNames.KING, key, team);//@ts-ignore
					match[team].King = match.cursor.square;
					break;
				default :
					continue ;
			}
		}
	}
	match.forceYellowTurn();
	dangerUpdateAll(match);
}

/**
 * 
 * @param {Match} match 
 * @param {string} curr 
 */
function assignPieceByType(match, curr)
{
	let	pos;
	let	team;
	let	square;
	let	isBoostedBool = false;
	let	nPlayer;

	nPlayer = match.settings.players.number;
	if (!curr || curr == " ")
		return ;
	if (curr.at(0) == "+")
	{
		isBoostedBool = true;
		curr = curr.slice(1);
	}
	pos = match.cursor.square;
	if (isLowerCase(curr) == true)
	{
		team = getTeamByInitial(curr.charAt(0), nPlayer);
		curr = curr.slice(1);
	}
	else
		team = getTeamByCoord(match);
	square = match.board.get(pos);
	if (!square)
		throw ("init: invalid coord");
	switch (curr)
	{
		case (enumInitNames.BASTARDS) :
			square.piece = new Piece(enumNames.BASTARDS, pos, team);
			break ;
		case (enumInitNames.CHAMPION) :
			square.piece = new Piece(enumNames.CHAMPION, pos, team);
			break ;
		case (enumInitNames.GHOUL) :
			square.piece = new Piece(enumNames.GHOUL, pos, team);
			break ;
		case (enumInitNames.JESTER) :
			square.piece = new Piece(enumNames.JESTER, pos, team);
			break ;
		case (enumInitNames.KING) :
			square.piece = new Piece(enumNames.KING, pos, team);
			//@ts-ignore
			match[team].King = pos;
			break ;
		case (enumInitNames.MAGE) :
			square.piece = new Piece(enumNames.MAGE, pos, team);
			break ;
		case (enumInitNames.MINOTAURUS) :
			square.piece = new Piece(enumNames.MINOTAURUS, pos, team);
			break ;
		case (enumInitNames.VALKIRYA) :
			square.piece = new Piece(enumNames.VALKIRYA, pos, team);
			break ;
		default:
			throw ("init: unrecognized piece");
	}
	square.piece.isBoostedBool = isBoostedBool;
	if (isBoostedBool)
	{//@ts-ignore
		match[team].boostedPiece = pos;
	}
}

/**
 * 
 * @param {Match} match
 */
function getTeamByCoord(match)
{
	let	upper;
	let	left;
	let	right;

	upper = (match.board.heigth / 2);
	left = (match.board.width / 4);
	right = match.board.width - left + 1;
	if (match.playerNum == 2)
	{
		if (match.cursor.getRow() <= upper)
			return (eTeam.White);
		return (eTeam.Black);
	}
	if (match.playerNum == 4)
	{
		if (match.cursor.getCol() < left)
			return (eTeam.Blue);
		else if (match.cursor.getCol() > right)
			return (eTeam.Green);
		else if (match.cursor.getRow() <= upper)
			return (eTeam.Yellow);
		else
			return (eTeam.Red);
	}
	else
		throw (`init: invalid number of player: ${match.playerNum}`);
}

/**
 * 
 * @param {Match} match
 */
function setRandomKings(match)
{
	if (match.playerNum == 2)
	{
		match.white.King = match.cursor.GetCenter(0, -1);
		match.board.get(match.white.King).piece = new Piece(enumNames.KING, match.white.King, eTeam.White);
		match.black.King = match.cursor.GetCenter(0, +1);
		match.board.get(match.black.King).piece = new Piece(enumNames.KING, match.black.King, eTeam.Black);
		match.forceWhiteTurn();
	}
	else if (match.playerNum == 4)
	{
		match.yellow.King = match.cursor.GetCenter(0, -1);
		match.board.get(match.yellow.King).piece = new Piece(enumNames.KING, match.yellow.King, eTeam.Yellow);
		match.red.King = match.cursor.GetCenter(0, +1);
		match.board.get(match.red.King).piece = new Piece(enumNames.KING, match.red.King, eTeam.Red);
		match.green.King = match.cursor.GetCenter(-1, 0);
		match.board.get(match.green.King).piece = new Piece(enumNames.KING, match.green.King, eTeam.Green);
		match.blue.King = match.cursor.GetCenter(+1, 0);
		match.board.get(match.blue.King).piece = new Piece(enumNames.KING, match.blue.King, eTeam.Blue);
		match.forceYellowTurn();
	}
	else// NOTE - gestione in controllo matchSettings
		throw ("init: match can be of 2 or 4 players. Not implemented.");
}

export {initSavedBoard, initRandomBoard, initClassicBoard};