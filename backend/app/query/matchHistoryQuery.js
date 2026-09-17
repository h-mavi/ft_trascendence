
import { prisma } from "../lib/prisma.js";

//TODO - vedere errore
export async function getAllUserMatches(id_user) {
	const userMatches = await prisma.users_matches.findMany({
		select: {
			id_usermatch: true,
			outcome: true,
			team: true,
			matches: {
				select: {
					users_matches: {
						where: {
							id_user: { not: Number(id_user)}
						},
						select: {
							users: {
								select: {
									username: true
								}
							}
						}
					},
					end_date: true,
					round: true,
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
							}
						}
					}
				}
			},
			users: {
				select: {
					username: true
				}
			}
		},
		where: {
			id_user: Number(id_user)
		},
		orderBy: {
			matches: {
				id_match: 'asc'
			}
		}
	});
	const matches = userMatches.map(um => ({
		id_usermatch: um.id_usermatch,
		player: um.users.username,
		opponent: um.matches.users_matches[0]?.users.username || null,
		result: um.outcome,
		date: um.matches.end_date ? um.matches.end_date.toISOString().split('T')[0] : null,
		// team: um.team,
		tournament: um.matches.tournaments ? { 
			id_tournament: um.matches.tournaments.id_tournament,
			name: um.matches.tournaments.name,
			status: um.matches.tournaments.status,
			round: um.matches.round,
			created_at: um.matches.tournaments.created_at.toISOString().split('T')[0],
			creator: { "id_user": um.matches.tournaments.users.id_user, "username": um.matches.tournaments.users.username }
		} : null
	}));
	const stats = matches.reduce((counter, m) => {
		counter.total++;
		switch (m.result) {
			case 'Win':
				counter.w++;
				break ;
			case 'Draw':
				counter.d++;
				break ;
			case 'Lose':
				counter.l++;
				break ;
		}
		return counter;
	}, { w: 0, d: 0, l: 0, total: 0});
	return ({ matches, stats });
}

export async function getUserStats(ids_users) {
	const stats = await prisma.users_matches.groupBy({
		by: ['id_user', 'outcome'],
		where: {
			id_user: {
				in: ids_users.map(Number)
			}
		},
		_count: {
			_all: true
		},
		orderBy: [
			{ id_user: 'asc' }
		]
	});
	const users = await prisma.users.findMany({
		where: {
			id_user: {
				in: ids_users.map(Number)
			}
		},
		select: {
			id_user: true,
			username: true
		}
	});
	const result = users.map(user => {
		const userStats = {
			id_user: user.id_user,
			username: user.username,
			w: 0,
			d: 0,
			l: 0,
			total: 0
		};

		stats.filter(s => s.id_user === user.id_user).forEach(s => {
			switch (s.outcome) {
				case 'Win':
					userStats.w = s._count._all;
					break;
				case 'Draw':
					userStats.d = s._count._all;
					break;
				case 'Lose':
					userStats.l = s._count._all;
					break;
			}

			userStats.total += s._count._all;
		});
		return userStats;
	});

	return result;
}