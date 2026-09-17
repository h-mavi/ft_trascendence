//@ts-check

import fs from "fs";
import { AIprofilesArray, arrayInitNames, arrayInitTeam, arrayNames, eEvents } from "../Macro/enums.js";
import {getRandomValues} from "crypto";
import { AI_PROFILE_PATH } from "../Macro/macro.js";
import { jsonSafeParse } from "./response.js";

/** @typedef {import("../Classes/Globals/globals.js").globals} Globals*/
/** @typedef {import("../Classes/Chess/match.js").Match} Match*/
/** @typedef {import("../Classes/Chess/chessBoard.js").Square} Square*/
/** @typedef {import("../Classes/Chess/history.js").HistoryEvent} HistoryEvent*/
/** @typedef {import("../Classes/Chess/Pieces/pieces.js").Piece} Piece*/

const COMBINATIONS = arrayNames.length * 2;//tipo pezzo	+ colori team
const METADATA = 2;//0: non boostato; 1: boostato
const SQUARE_COMBINATION = COMBINATIONS * METADATA;
//NOTE - si puo ridurre a 5^2 combinazioni: 
// ha senso segnare se i giocatori hanno almeno:	0, 1, 3, 5, 10 punti
const POINT_MILESTONE = [1, 3, 5, 10];//oltre 16 non ha senso separare
const POINT_COMBINATION = Math.pow(POINT_MILESTONE.length + 1, 2);//oltre 16 non ha senso separare
const TABLE_SIZE = BigInt((2 << 20) - 1);
let zobristTable = 
{
	/** @type {Array<BigInt>} */
	board: [],
	/** @type {Array<BigInt>} */
	points: [],
}

/**
 * 
 */
function zobristGenerateTable()
{
	let	array64 = new BigUint64Array(1);

	if (fs.existsSync(`${AI_PROFILE_PATH}/trainingChambersKeys.json`))
		return zobristRetrieveTable();
	//				tipo pezzo			colori team
	for (let x = 0; x != 64 * SQUARE_COMBINATION; x += SQUARE_COMBINATION)
	{
		for (let y = 0; y != SQUARE_COMBINATION; y += METADATA)
		{
			for (let z = 0; z != METADATA; z += 1)
			{
				getRandomValues(array64);
				zobristTable.board[x + y + z] = array64[0];
				console.log(array64[0]);
			}
		}
	}
	for (let x = 0; x != (POINT_COMBINATION) + 1; x += 1)
	{
		getRandomValues(array64);
		zobristTable.points[x] = array64[0];
	}
	fs.openSync(`${AI_PROFILE_PATH}/trainingChambersKeys.json`, "a+");
	fs.writeFileSync(`${AI_PROFILE_PATH}/trainingChambersKeys.json`, JSON.stringify(zobristTable, jsonSafeParse, 0));
	for (let profile of AIprofilesArray)
	{
		if (fs.existsSync(`${AI_PROFILE_PATH}/${profile}/cache.json`))
		{
			fs.openSync(`${AI_PROFILE_PATH}/${profile}/cacheBackup.json`, "a+");
			fs.copyFileSync(`${AI_PROFILE_PATH}/${profile}/cache.json`, `${AI_PROFILE_PATH}/${profile}/cacheBackup.json`);
			fs.rmSync(`${AI_PROFILE_PATH}/${profile}/cache.json`);
		}
	}
}

/**
 * initialize the hash
 * @param {Match} match 
 */
function zobristInitHash(match)
{
	let	i;
	let	hash = BigInt(0);

	i = 0;
	for (const [coord, square] of match.board)
	{
		hash ^= zobristPieceHash(i, square.piece);
		i += 1;
	}
	hash ^= zobristPointsHash(match.white.nPoints, match.black.nPoints);
	match._zobristHash = hash;
	match.zobristIndex = Number(hash & TABLE_SIZE);
}

let	I = 0;
let	arr = [];

/**
 * 
 * @param {Match} match 
 * @param {HistoryEvent} event 
 */
function zobristUpdateHash(match, event)
{
	/** @type {Square} */
	let	fromSquare;
	/** @type {Square | undefined} */
	let	toSquare;
	let	prevBoostSquare;
	let	fromHash;
	let	toHash;
	let	historyFromHash;
	let	historyToHash;

	if (!event.from || match.settings.players.number != 2)
		return ;
	historyFromHash = event.fromHash;
	historyToHash = event.toHash;
	fromSquare = match.board.get(event.from);
	if (event.to && event.type != eEvents.Transform)
		toSquare = match.board.get(event.to);
	fromHash = zobristPieceHash(fromSquare.index, fromSquare.piece);
	toHash = zobristPieceHash(toSquare?.index, toSquare?.piece);
// 	arr[I] = `zeb${I}: ${match._zobristHash}
// `;
// 	arr[I] += `from${I}: ${fromHash}
// `;
// 	arr[I] += `to${I}: ${toHash}
// `;
// 	arr[I] += `prevFrom${I}: ${historyFromHash}
// `;
// 	arr[I] += `prevTo${I}: ${historyToHash}
// `;
	if (historyFromHash != fromHash)
	{
		match._zobristHash ^= historyFromHash;
		match._zobristHash ^= fromHash;
	}
	if (toSquare && historyToHash != toHash)
	{
		match._zobristHash ^= historyToHash;
		match._zobristHash ^= toHash;
	}
	if (event.points.WHITE != match.white.nPoints || event.points.BLACK != match.black.nPoints)
	{
		match._zobristHash ^= zobristPointsHash(event.points.WHITE, event.points.BLACK);
		match._zobristHash ^= zobristPointsHash(match.white.nPoints, match.black.nPoints);
	}
	match.zobristIndex = Number(match._zobristHash & TABLE_SIZE);
// 	arr[I] += `newZeb${I}: ${match._zobristHash}
// `;
// 	console.debug(arr);
// 	I++;
}

//SECTION - utils 7426276207182823518

//zeb0:		7112883808504317778n
//from0:	0n
//to0:		3601157839445666124n
//oldFrom0:	13120451337166340020n
//oldTo0:	10329356723668511865n

/**
 * get the random number associated with the unique combination of:
 *  *type*, *team*, *boostedBool*, *coord*
 * @param {number | undefined} boardCount 
 * @param {Piece | undefined | null} piece 
 */
function zobristPieceHash(boardCount, piece)
{
	let	i;

	if (!piece || boardCount == undefined)
		return (BigInt(0));
	i = boardCount * SQUARE_COMBINATION;
	i += arrayInitNames.indexOf(piece.type[0]);
	i += arrayInitTeam.indexOf(piece.team[0]) * arrayInitNames.length;
	i += piece.isBoostedBool? 1 : 0;
	return (zobristTable.board[i]);
}

/**
 * get the random number associated with the unique combination of:
 *  *black_points*, *white_points*
 * @param {number} pWhite
 * @param {number} pBLack
 */
function zobristPointsHash(pWhite, pBLack)
{
	let	iW;
	let	iB;

	iW = -0;
	iB = -0;
	for (const x of POINT_MILESTONE)
	{
		if (pWhite > x)
			iW += 1;
		if (pBLack > x)
			iB += 1;
	}
	return (zobristTable.points[iW] ^ zobristTable.points[iW + POINT_MILESTONE.length + 1]);
}

function zobristRetrieveTable()
{
	let data;

	data = JSON.parse(fs.readFileSync(`${AI_PROFILE_PATH}/trainingChambersKeys.json`, "utf-8"));
	zobristTable = data;
	for (let i = 0; i != zobristTable.board.length; i++)
	{
		zobristTable.board[i] = BigInt(zobristTable.board[i]);
	}
	for (let i = 0; i != zobristTable.points.length; i++)
	{
		zobristTable.points[i] = BigInt(zobristTable.points[i]);
	}
}

export {zobristGenerateTable, zobristInitHash, zobristUpdateHash, zobristPieceHash};