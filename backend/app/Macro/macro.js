// @ts-check
import { abort } from "node:process";//@ts-ignore
import aiSpeech from '../Classes/Chess/AIprofiles/speech.json' with { type: 'json' };

//SECTION debug
const DEBUG = true;
//@ts-ignore
/** @type {boolean} */const DEBUG_WEBSOCKETS = process.env.DEBUG_WEBSOCKETS == "true" ? true : false;
//@ts-ignore
/** @type {boolean} */const DEBUG_CURL = process.env.DEBUG_CURL == "true" ? true : false;
//@ts-ignore
/** @type {string} */const DEBUG_HISTORY_PATH = process.env.DEBUG_HISTORY_PATH ? process.env.DEBUG_HISTORY_PATH : "./";
//@ts-ignore
/** @type {string} */const DEBUG_AI_PROFILE_PATH = process.env.DEBUG_AI_PROFILE_PATH ? process.env.DEBUG_AI_PROFILE_PATH : "./Classes/Chess/AIprofiles/";
//@ts-ignore
/** @type {string} */const DEBUG_AI_TRAINING = process.env.DEBUG_AI_TRAINING == "true" ? true : false;

//SECTION - child

const CHILD_NUM = 5;
let		IS_CHILD_PROCESS = process.argv[1]?.includes(`child`);

//SECTION - history
const HISTORY_PATH = `${DEBUG_HISTORY_PATH}/`;
const HISTORY_FILE = "HISTORY.json";
const HISTORY_DEFAULT = `${HISTORY_PATH}${HISTORY_FILE}`;

//SECTION - AI
const AI_PROFILE_PATH = DEBUG_AI_PROFILE_PATH;

/** @typedef {keyof typeof aiSpeech} EventType */

/**
 * Enum for AI events based on speech.json
 * Object =>	{[k, v]}
 * @type {{ [K in EventType]: K }}
 */
// @ts-ignore
export const AI_EVENTS = Object.fromEntries(
  Object.keys(aiSpeech).map((key) => [key, key])
);

//SECTION - timers
const MATCHTIMER = 15 * 60 * 1000;//15 minutes
const SOCKET_RECONNECT_TIMER = 3 * 1 * 1000;//3 seconds
const MATCH_RECONNECT_TIMER = 60 * 1 * 1000;//60 seconds
const TOURNAMENT_WAIT_TIMER = 60 * 5 * 1000;//5 minutes

const HASH_SALT = process.env.HASH_SALT? Number(process.env.HASH_SALT) : 10;

const MAX_MOVES_REWARD_AND_PENALITY = 30;// numero massimo che si aggiunge o sottrae ad una mossa ai a fine partita
const CUTOFF = 0.1;
const AI_MAX_DATA = 10000;

/*
	seed interessanti
	0:	classic mode
	1:	trono di spade
	1057: scacco matto ciao ciao
	63: scacco matto prevenibile
*/
const SEED = 0;

//ANCHOR - chess

//sent to frontend for server messages
const SRV_NAME = "server";
const MAX_CHESSBOARD_SIZE = 25;
let CHESSBOARD_H = 8;
let CHESSBOARD_W = 8;
let MOVEMENT_MAX = 2;
let MOVEMENT_MIN = 1;
let BOOSTED_MAX = 1;
let MOVEMENT_BONUS_POINT = 4;

//SECTION - utils

function macroReset()
{
	CHESSBOARD_H = 8;
	CHESSBOARD_W = 8;
	MOVEMENT_MAX = 2;
	MOVEMENT_MIN = 1;
	BOOSTED_MAX = 1;
	MOVEMENT_BONUS_POINT = 4;
}

//SECTION checks

if ((CHESSBOARD_H >= MAX_CHESSBOARD_SIZE || CHESSBOARD_W >= MAX_CHESSBOARD_SIZE) || 
	(CHESSBOARD_H <= 0 || CHESSBOARD_W <= 0))
{
	error("illegal chessboard size");
}

/**
 * 
 * @param {string} text 
 */
function error(text)
{
	console.error(text);
	abort();
}

export { macroReset, DEBUG, DEBUG_WEBSOCKETS, DEBUG_CURL, DEBUG_AI_TRAINING, CUTOFF, AI_MAX_DATA, HISTORY_FILE, HISTORY_DEFAULT, HISTORY_PATH, AI_PROFILE_PATH, MAX_MOVES_REWARD_AND_PENALITY, SRV_NAME, CHILD_NUM, IS_CHILD_PROCESS, CHESSBOARD_H, CHESSBOARD_W, MOVEMENT_MIN, MOVEMENT_MAX, MOVEMENT_BONUS_POINT, BOOSTED_MAX, HASH_SALT, SEED, MATCHTIMER, SOCKET_RECONNECT_TIMER, MATCH_RECONNECT_TIMER, TOURNAMENT_WAIT_TIMER};