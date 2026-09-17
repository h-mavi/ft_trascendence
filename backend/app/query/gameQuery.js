
import { prisma } from "../lib/prisma.js";

/** @typedef {import("../Classes/Chess/match.js").Match} Match*/

/**
 * @param {Match | null} match 
 */
export async function openMatch(match=null) {
	const m = await prisma.matches.create({
		data: {
			start_date: match ? match.start_date : new Date().toISOString(),
			id_tournament: match ? match.tournament_id : null,
			round: match ? match.tournament_round : null
		}
	});
	if (match != null)
		match.id = m.id_match;
	return (m.id_match);
}

/**
 * @param {Match} match 
 */
export async function closeMatch(match) {
	const m = await prisma.matches.update({
		data: {
			end_date: new Date().toISOString(),
			history: match.Log()
		},
		where: { id_match: Number(match.id)}
	});
}

/**
 * @param {Match} match 
 */
export async function createUsersMatch(match) {
	if (!match.users)
		return (console.log("Array of object match.user doesn't exist"));
	console.log(match.users);
	for (const u of match.users) {
		await prisma.users_matches.create({
			data: {
				id_match: Number(match.id),
				id_user: u.id_user,
				outcome: u.outcome,
				...(u.startTeam != null && { team: u.startTeam })
			}
		});
	};
}