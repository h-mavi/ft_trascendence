/**
 * @typedef { "move"|"boost"|"trans"|"giveup"|"draw"|"lost" } ActionType
 */

/**
 * @typedef		{Object}		ActionVM
 * @property	{ActionType}	type
 * @property	{number|null}	counter
 * @property	{string}		piece
 * @property	{string}		from
 * @property	{string}		to
 * @property	{string|null}	transformed_into		
 * @property	{string|null}	captured_piece
 */

/**
 * @typedef		{Object}			TurnVM
 * @property 	{number}			turn
 * @property 	{string}			team
 * @property 	{number}			time
 * @property 	{Array<ActionVM>}	actions
 */

const eActionType = Object.freeze({
	MOVE:	"move",
	BOOST:	"boost",
	TRANS:	"trans",
	GIVEUP:	"giveup",
	DRAW:	"draw",
	LOST:	"lost",
});

const PIECE_LETTER = Object.freeze({
	King: "K", Champion: "C", Valkirya: "V", Jester: "J", Minotaurus: "M", Bastards: "",
})

const TIME_IN_MS = true;

const TEAM_DOT = Object.freeze({
	white: "#ededed", black: "#181715", yellow: "#d8b430",
	blue: "#3b6fd4", red: "#b23b30", green: "#3f9c53",
})

/**@param {string} piece */
function pieceLetter(piece)
{
	return (PIECE_LETTER[piece] ?? "");
}

/**@param {string} team */
export function teamDot(team)
{
	return (TEAM_DOT[team] ?? "#6b6b6b");
}

/**
 * @param {ActionVM} action
 */
function actionLabel(action)
{
	if (!action)
		return ("");
	switch (action.type)
	{
		case eActionType.BOOST:		return(`${pieceLetter(action.piece)}${action.from} ⚡`);
		case eActionType.TRANS:		return(`${action.from}=${pieceLetter(action.transformed_into)}`);
		case eActionType.GIVEUP:	return(`gave up`);
		case eActionType.DRAW:		return(`draw`);
		case eActionType.LOST:		return(`lost`);
		default:					return(`${pieceLetter(action.piece)}${action.captured_piece ? "x" : ""}${action.to}`);
	}
}

 /**
  * @param {TurnVM} turn
  */
export function turnLabel(turn)
{
	return ((turn?.actions ?? []).map(actionLabel).filter(Boolean).join(" · "));
}

 /**@param {number} time */
export function turnDuration(time)
{
	const sec = Math.round(TIME_IN_MS ? time / 1000 : time);

	if (sec < 60)
		return (`${sec}s`);
	return (`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`);
}

 /**@param {TurnVM} turn */
export function mainAction(turn)
{
	return (turn.actions.find(a => a.type === eActionType.MOVE) ?? turn.actions[0] ?? null);
}
