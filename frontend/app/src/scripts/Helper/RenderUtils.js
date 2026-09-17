import { localBoard, localPlayers, localInfo, FILES_TWO, FILES_FOUR }	from "@/scripts/Data/Variables.js";

//Funzione helper per convertire la mappa in un array 8x8
export function boardConverter()
{
    const DBoard = [];
	let maxRank, file;

    if (!localBoard || localBoard.size === 0) {
        console.warn("[boardConverter]: localBoard è vuoto o null");
        return [];
    }

	if (localPlayers.get('p3')){
		maxRank = 14; file = FILES_FOUR;
	}
	else 
	{ 
		maxRank = 8; 
		file = FILES_TWO; 
	}

	const orientation = localInfo.myTeam === "white" ? "white" : "black";
	const ranks = [];

	for (let r = maxRank; r >= 1; r -= 1)
		ranks.push(r);
	if (orientation === "black")
		ranks.reverse();

	const files = orientation === "black" ? [...file].reverse() : file;

	for (const rank of ranks)
	{
		const row = [];
		for (const f of files)
			row.push(localBoard.get(`${f}${rank}`));
		DBoard.push(row);
	}
	return DBoard;
}

/**
 * @param {Number} p 
 */
export function getLocalPlayers(p) {
	if (p === 1)		{ return (localPlayers.get("p1")); }
	else if (p === 2)	{ return (localPlayers.get("p2")); }
	else if (p === 3)	{ return (localPlayers.get("p3")); }
	else if (p === 4)	{ return (localPlayers.get("p4")); }

	return (null);
}

//Funzione helper per determinare il colore dello square durante la cotruzione della scacchiera
export function getSquareColor(squareId) 
{
	const col = squareId.charCodeAt(0) - 97;
	const row = parseInt(squareId.substring(1));
	return (row + col) % 2 === 0 ? "white" : "black";
}