//@ts-check

import {Cursor} from "../Classes/Chess/cursor.js";
import { colors } from "./colorsOld.js";
let cur = new Cursor;

/*
       060   48    30    0
       061   49    31    1
       062   50    32    2
       063   51    33    3
       064   52    34    4
       065   53    35    5
       066   54    36    6
       067   55    37    7
       070   56    38    8
       071   57    39    9
       072   58    3A    :
       073   59    3B    ;
       074   60    3C    < 
       075   61    3D    =
       076   62    3E    >
       077   63    3F    ?
	   100   64    40    @
*/
//SECTION - norm
//ANCHOR - normal tests
norm("a1", "a1");
norm("a2", "a2");
norm("a5", "a5");
norm("a8", "a8");
norm("b1", "b1");
norm("b2", "b2");
norm("b5", "b5");
norm("h8", "h8");
norm("h1", "h1");
//ANCHOR -  backend => frontend
norm("a:", "a10");
norm("a;", "a11");
norm("a<", "a12");
norm("a=", "a13");
norm("b>", "b14");
norm("b?", "b15");
norm("b@", "b16");
norm("hA", "h17");
norm("hB", "h18");
//ANCHOR -  frontend => backend
norm("a10", "a:");
norm("a11", "a;");
norm("a12", "a<");
norm("a13", "a=");
norm("a14", "a>");
norm("a15", "a?");
norm("b16", "b@");
norm("h17", "hA");
norm("h18", "hB");
console.log(`${colors.green}TEST PASSED! CONGRATULATION!${colors.reset}`);


/**
 * 
 * @param {string} square
 * @param {string} expected
 */
function norm(square, expected)
{
	cur.Save();
	let necur = cur.Normify(square);
	if (necur != expected)
		throw (`test Normify ${necur}: ${square} failed: expected => ${expected}\n`);
	console.log(`Success Normify: ${square} => ${expected}`);
	cur.Restore();
}
