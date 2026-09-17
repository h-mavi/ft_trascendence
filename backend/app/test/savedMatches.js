import { dangerUpdateAll } from "../utils/moveUtils.js";
import { init } from "../handlers/game/init.js";
import { eTeam } from "../Macro/enums.js";

export function edoChampionBug(match)
{
	init(match, 0, "|M|J| |C|K|V| |M|\n|B|B|B|V|B| | | |\n| | | | | | | |B|\n| |V|C| | | | | |\n| | | |B| |B| | |\n| | | | |B| |B| |\n|B|B|B| | | | |B|\n|M|J|V| |K| | |M|\n");
	match.board.get("b5").piece.team = eTeam.White;
	match.board.get("c5").piece.team = eTeam.White;
	match.board.get("c5").piece.isBoostedBool = true;
	match.currentPlayer = match.white;
	match.black.nPoints = 7;
	dangerUpdateAll(match);
}
