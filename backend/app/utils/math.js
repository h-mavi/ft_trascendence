//@ts-check

/**
 * finds the lowest/maximum number in a Array, ignoring null/undefined values
 * @param {Array<number | null | undefined>} numArray 
 * @param {*} lowBool 
 */
export function getBestNumber(numArray, lowBool=false)
{
	let	best;

	best = lowBool? +Infinity : -Infinity;
	for (const  x of numArray)
	{
		if (!x && x != 0)
			continue ;
		if (lowBool && x < best)
			best = x;
		else if (!lowBool && x > best)
			best = x;
	}
	return (best);
}
