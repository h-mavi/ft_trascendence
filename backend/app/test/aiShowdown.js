//@ts-check

import { AI } from "../Classes/Chess/AI.js";
import { Match } from "../Classes/Chess/match.js";
import { globals } from "../Classes/Globals/globals.js";
import { AIexecuteTurn } from "../GameLogic/aiTurn.js";
import { init } from "../handlers/game/init.js";
import { AIprofiles } from "../Macro/enums.js";
import { colors } from "./colorsOld.js";
import { render } from "./render.js";
import fs from "fs";

/**
 * 
 * @param {number} argc 
 * @param {Array<string>} argv 
 * @returns 
 */
function main(argc, argv)
{
	let	match;
	let	AIone;
	let	AItwo;
	let	time;
	let	totTime;

	console.time();
	console.profile();
	globals.matches.set("0", new Match());
	match = globals.getDebugMatch();
	if (!match)
		throw ("To use aiShowdown.js, you need to set the DEBUG macro true");
	if (argv[2])
		AIone = argv[2].toUpperCase();
	if (argv[3])
		AItwo = argv[3].toUpperCase();
	console.log(argv);
	AIone = promptName(AIone, "first");
	AItwo = promptName(AItwo, "second");
	init(match, "1v1");
	match.currentPlayer.ai = new AI(AIone);
	match.NextPlayer().ai = new AI(AItwo);
	match.aiBool = true;
	render(match);
	console.log = ()=>{};
	let i = 0;
	totTime = BigInt(0);
	try
	{
		while (!match.victory)
		{
			console.debug(`move ${i++}`);
			match.cursor.square = "";
			render(match, [], "", false, console.debug);
			time = process.hrtime.bigint();
			AIexecuteTurn(match);
			console.debug(`time to move: ${(process.hrtime.bigint() - time) / 1000000n} milliseconds`);
			totTime += (process.hrtime.bigint() - time) / 1000000n;
		}
		console.debug(`${colors.red}${match.victory} has won.${colors.reset}`);
		console.debug(`total time: ${colors.yellow}${totTime} milliseconds.${colors.reset}`);
		render(match, [], "", true, console.debug);
		getline("Press enter to finish..");
	}
	catch(err)
	{
		console.error("GAME CRASHED.");
		console.error(err);
		console.profileEnd();
	}
	process.exit();
}

main(process.argv.length, process.argv);

/**
 * 
 *  @param {string | undefined} name 
 *  @param {string} counter 
*/
function promptName(name, counter)
{//@ts-ignore
	if (AIprofiles[name])//@ts-ignore
		return (AIprofiles[name]);//@ts-ignore
	if (name && !AIprofiles[name.at(0)?.toUpperCase() + name.toLowerCase().slice(1)])//@ts-ignore
		return (AIprofiles[name.at(0)?.toUpperCase() + name.toLowerCase().slice(1)]);
	name = getline(`Insert the name of the ${counter} AI. empty for random.`).toUpperCase();//@ts-ignore
	while (name && !AIprofiles[name] && !AIprofiles[name.at(0)?.toUpperCase() + name.toLowerCase().slice(1)])
	{
		console.log(name + " does not exist.");
		name = getline(`Insert the name of the ${counter} AI. empty for random.`).toUpperCase();
	}
	if (!name)
		return ("");//@ts-ignore
	if (AIprofiles[name])//@ts-ignore
		return (AIprofiles[name]);
	else//@ts-ignore
		return (AIprofiles[name.at(0)?.toUpperCase() + name.toLowerCase().slice(1)]);
}

/**
 * 
 * @param {string} prompt 
 */
function getline(prompt)
{
	const 	buffer = Buffer.alloc(50);
	let		bRead;
	let		input;

	console.debug(prompt);
	process.stdin.setRawMode(false);
	bRead = fs.readSync(1, buffer);
	process.stdin.setRawMode(true);
	if (!bRead)
		return ("");
	input = buffer.toString('utf8', 0, bRead).trim();
	return (input);
}
