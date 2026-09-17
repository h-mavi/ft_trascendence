//@ts-check
import { prisma } from "../lib/prisma.js";

export async function getAllUserTournaments(id_user) {
	const userTournaments = await prisma.tournament_players.findMany({
		where: {
			id_user: Number(id_user)
		},
		select: {
			tournaments: {
				select: {
					id_tournament: true,
					name: true,
					status: true,
					created_at: true,
					users: {
						select: {
							id_user: true,
							username: true
						}
					},
					tournament_players: {
						select: {
							users: {
								select: {
									id_user: true,
									username: true
								}
							}
						}
					}
				}
			}
		}
	});
	return userTournaments.map(t => ({
		id_tournament: t.tournaments.id_tournament,
		name: t.tournaments.name,
		status: t.tournaments.status,
		created_at: t.tournaments.created_at.toISOString().split('T')[0],
		created_by: { id_user: t.tournaments.users.id_user, username: t.tournaments.users.username },
		players: t.tournaments.tournament_players.map(tp => tp.users)
	}));
}

export async function getAllTournaments(status="")
{
	let	conditions;

	conditions = {};
	if (status == "ongoing")
		conditions = {status: {equals: "ongoing"}};
	else if (status == "open")
		conditions = {status: {equals: "open"}};
	const tournaments = await prisma.tournaments.findMany({
		where: conditions
	});
	return (tournaments);
}

export async function getTournamentById(id_tournament) {
	const tournament = await prisma.tournaments.findUnique({
		select: {
			id_tournament: true,
			name: true,
			status: true,
			created_at: true,
			users: {
				select: {
					id_user: true,
					username: true
				}
			},
			tournament_players: {
				select: {
					users: {
						select: {
							id_user: true,
							username: true,
							image: true,
							points: true,
							title: true
						}
					}
				}
			}
		},
		where: { id_tournament: Number(id_tournament) }
	});
	if (!tournament)
		return (null);
	return ({
		id_tournament: tournament.id_tournament,
		name: tournament.name,
		status: tournament.status,
		created_at: tournament.created_at.toISOString().split('T')[0],
		created_by: { id_user: tournament.users.id_user, username: tournament.users.username },
		players: tournament.tournament_players.map(tp => tp.users)
	});
}

/** @param {string} name*/
export async function checkTournamentName(name) {
	const tournament = await prisma.tournaments.findUnique({
		select: {
			id_tournament: true
		},
		where: { name: String(name) }
	});
	if (!tournament)
		return (false);
	return (true);
}

// NOTE: creazione nuovo torneo
export async function createTournament(name, id_creator) {
	const tournament = await prisma.tournaments.create({
		data: {
			name: name,
			created_at: new Date().toISOString(),
			status: 'open',
			created_by: id_creator
		},
		select: {
			id_tournament: true,
			status: true,
			created_at: true,
			name: true,
			users: {
				select: {
					id_user: true,
					username: true
				}
			}
		}
	});
	return ({
		id_tournament: tournament.id_tournament,
		name: tournament.name,
		status: tournament.status,
		created_at: tournament.created_at.toISOString().split('T')[0],
		created_by: { id_user: tournament.users.id_user, username: tournament.users.username }
	});
}

// NOTE: 
export async function updateTournamentStatus(id_tournament, status) {
	const validStatus = ['open', 'ongoing', 'closed'];
	if (!validStatus.includes(status))
		return null;
	const updated = await prisma.tournaments.update({
		where: {
			id_tournament: Number(id_tournament),
			status: { not: status }
		},
		data: { status: status },
		select: {
			id_tournament: true,
			status: true,
			created_at: true,
			name: true,
			users: {
				select: {
					id_user: true,
					username: true
				}
			}
		}
	});
	return ({
		id_tournament: updated.id_tournament,
		name: updated.name,
		status: updated.status,
		created_at: updated.created_at.toISOString().split('T')[0],
		created_by: { id_user: updated.users.id_user, username: updated.users.username }
	});
}

/**
 * 
 * @param {Number} id_tournament 
 * @param {Array<Number>} id_users
 * @returns number of records created
 * NOTE: aggiunge al torneo con id passato gli utenti che hanno id in id_users. Ritorna il numero di record creati
 * NOTE: da richiamare dentro try/catch
 */
export async function addPlayersToTournament(id_tournament, id_users) {
	if (!Array.isArray(id_users) || id_users.length === 0)
		throw new Error("User array is empty or not an array");
	const currentPlayers = await prisma.tournament_players.count({ where: { id_tournament: Number(id_tournament) } });
	if (currentPlayers + id_users.length > 8)
		throw new Error (`Players joined: ${currentPlayers}. Can't add other ${id_users.length} players to tournament. There are only ${8 - currentPlayers} free slots`);
	return await prisma.tournament_players.createMany({
		data: id_users.map(id => ({
			id_tournament: id_tournament,
			id_user: id
		}))
	});
}

export async function getTournamentResults(id_tournament) {
	const matches = await prisma.matches.findMany({
		where: { id_tournament: Number(id_tournament) },
		include: {
			users_matches: {
				include: {
					users: {
						select: {
							id_user: true,
							username: true,
							image: true,
							points: true,
							title: true
						}
					}
				}
			}
		},
		orderBy: [
			{ round: 'asc' },
			{ id_match: 'asc' }
		]
	});
	const final = matches.find(m => m.round === 'F');
	const semifinals = matches.filter(m => m.round === 'SF');
	const first = final?.users_matches.find(um => um.outcome === 'Win')?.users.username;
	const second = final?.users_matches.find(um => um.outcome === 'Lose')?.users.username;
	const third = semifinals.map(sf => sf.users_matches.find(um => um.outcome === 'Lose')?.users.username).filter(Boolean); // .filter(Boolean) serve per eliminare valori falsy

	return {
		"winner": first,
		"second": second,
		"third": third,
		"matches": matches
	}
}

export async function retrieveTournamentMatches(id_tournament) {
	const tournamentMatches = await prisma.matches.findMany({
		where: {id_tournament: {not: null}},
		select: {
			users_matches: {
				select: {
					id_match: true,
					users: {
						select: {
							id_user: true,
							username: true
						}
					},
					outcome: true
				}
			},
			start_date: true,
			end_date: true,
			round: true
		}
	});
	return tournamentMatches.map(um => ({
		id_match: um.users_matches[0].id_match,
		status: um.end_date === null ? "ongoing" : "finished",
		victory: um.users_matches[0].outcome === "Win" ? "p1" : "p2",
		p1: um.users_matches[0].users,
		p2: um.users_matches[1].users,
		round: um.round
	}));
}
		
export async function deleteUserInTournament(id_tournament, id_user)
{
	try
	{
		const tournament = await prisma.tournament_players.delete({
			where: {
				id_tournament: id_tournament,
				id_user: id_user
			}
		});
	}
	catch(err)
	{
		console.log(`deleteUserInTournament: ${err}`);
		if (error.code === 'P2025')
			return res.status(404).json(jsonResponse.ResponseError("Tournament or player not found"));
		return res.status(500).json(jsonResponse.ResponseError("Server error deleting user from tournament"));
	}
}