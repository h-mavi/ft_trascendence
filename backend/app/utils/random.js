// @ts-check

import {SEED} from "../Macro/macro.js";
import seedrandom from "seedrandom";

/**
 * @param {number | null} seed
 */
function initRng(seed=null)
{
	if (seed == null)
		seed = Math.floor(Math.random() * (1 << 30));
	const	rngBase = seedrandom(seed.toString());
	const	rng = (mod = (1 << 30)) =>
	{
		let x;
		
		x = rngBase() * mod;
		return (Math.floor(x));
	}
	return (rng);
}

const rng = initRng(SEED);

/**
 * select a random index from a pair of number, basing on their highness.
 * @param {number} x first number
 * @param {number} y second number
 * @returns {0 | 1} index 0 or index 1
 */
function rngProportional(x, y)
{
	let	n;
	let	low;
	let	sum;

	if (x == y)
		return (rng(2) == 0 ? 0 : 1);
	else if (y < 0 && x > 0)
		return (rng(2) == 0 ? 0 : 1);
	else if (x < 0 && y > 0)
		return (rng(2) == 0 ? 0 : 1);
	x = Math.abs(x);
	y = Math.abs(y);
	x < y? low = x : low = y;
	sum = x + y;
	n = rng(sum);
	return (n < low? 0 : 1);
}

export {initRng, rng, rngProportional};