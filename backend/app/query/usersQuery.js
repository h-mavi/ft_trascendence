
import { prisma } from "../lib/prisma.js";
import { getUserStats } from "./matchHistoryQuery.js";

/** @typedef {import("../Classes/Chess/player.js").Player} Player*/

export async function getAllUsers() {
	return await prisma.users.findMany({
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			}
		},
		orderBy: {
			id_user: 'asc'
		}
	});
}

export async function getMe(id) {
	const u = await prisma.users.findUnique({
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			password: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			},
			mfa: true
		},
		where: {
			id_user: Number(id)
		}
	});
	return ({
		id_user: u.id_user,
		name: u.name,
		surname: u.surname,
		username: u.username,
		setpwd: u.password !== null, 
		email: u.email,
		image: u.image,
		nationality: u.nationality,
		points: u.points,
		title: u.title,
		preferences: u.preferences,
		mfa: u.mfa
	});
}

export async function getUserByGoogleId(google_id) {
	return await prisma.users.findUnique({
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			},
			mfa: true
		},
		where: { google_id: String(google_id) }
	});
}

export async function getUserById(id) {
	return await prisma.users.findUnique({
		select: {
			id_user: true,
			name: true,
			surname: true,
			password: true,
			username: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			},
			mfa: true
		},
		where: {
			id_user: Number(id)
		}
	});
}

// NOTE: cerca un utente che contiene come username lo username passato
// e possibile passare anche solo una parte dello username -> passando 'Mario' trovera 'Mariorossi' 'supermario' oppure 'robomarione'
export async function findUserByUsername(username) {
	return await prisma.users.findMany({
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			}
		},
		where: {
			username: {
				contains: String(username),
				mode: 'insensitive'
			}
		},
		orderBy: {
			id_user: 'asc'
		}
	});
}

export async function getUserByUsername (username) {
	return await prisma.users.findUnique({
			select: {
				id_user: true,
				name: true,
				surname: true,
				username: true,
				email: true,
				image: true,
				nationality: true,
				points: true,
				title: true,
				preferences: {
					select: {
						id_preference: true,
						name: true
					}
				}
			},
			where: {
				username: String(username)
			}
		});
}

export async function getUserWithPwd (user) {
	const u = await prisma.users.findFirst({
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			password: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			},
			mfa: true
		},
		where: {
			OR: [
				{ username: String(user) },
				{ email: String(user) }
			]
		}
	});
	if (!u)
		return null;
	return ({
		id_user: u.id_user,
		name: u.name,
		surname: u.surname,
		username: u.username,
		password: u.password,
		setpwd: u.password !== null, 
		email: u.email,
		image: u.image,
		nationality: u.nationality,
		points: u.points,
		title: u.title,
		preferences: u.preferences,
		mfa: u.mfa
	});
}

export async function getUserByEmail(email) {
	return await prisma.users.findUnique({
			select: {
				id_user: true,
				name: true,
				surname: true,
				username: true,
				email: true,
				image: true,
				nationality: true,
				points: true,
				title: true,
				preferences: {
					select: {
						name: true,
						id_preference: true
					}
				}
			},
			where: {
				email: String(email)
			}
		});
}

export async function getLeaderboard() {
	const leaderboard = await prisma.users.findMany({
		select: {
				id_user: true,
				username: true,
				image: true,
				nationality: true,
				points: true,
				title: true
			},
		orderBy: [
			{ points: 'desc' }, 
			{ name: 'asc' }
		],
		take: 10
	});
	const stats = await getUserStats(leaderboard.map(u => u.id_user));
	const statsMap = new Map(stats.map(s => [s.id_user, s]));
	const result = leaderboard.map(user => {
		const stat = statsMap.get(user.id_user);
		return {
			...user,
			stats: {
				w: stat?.w ?? 0,
				d: stat?.d ?? 0,
				l: stat?.l ?? 0,
				total: stat?.total ?? 0
			}
		};
	});
	return result;
}

/**
 * @description Asyncronous function for creating users with Prisma client
 * @param {String} name 
 * @param {String} surname 
 * @param {String} username 
 * @param {String} password
 * @param {String} email
 * @param {String} nationality 
 */
export async function createUser(name, surname, username, password, email, nationality) {
	return await prisma.users.create({
		data: {
			name: name,
			surname: surname,
			username: username,
			email: email,
			password: password,
			nationality: nationality
		},
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			password: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			},
			mfa: true
		}
	});
}

export async function deleteUserById(id) {
	return await prisma.users.delete({
		where: { id_user: Number(id) }
	});
}

/** 
 * 
 * @param {Player} player 
 * @param {string} title 
*/
export async function updateUserELO(player, title) {
	return await prisma.users.update({
		where: { id_user: player.id },
		data: { points: player.dbTable.points, title: title }
	});
}

export async function updateUserFieldsById(id, data) {
	const fields = ['name', 'surname', 'username', 'nationality', 'image', 'preferences', 'mfa', 'google_id'];
	const updates = {};
	for (const f of fields)
	{
		if (data[f] !== undefined)
		{
			if (data.preferences && f === 'preferences')
				updates.preferences = { connect: { id_preference: Number(data[f]) }};
			else if (data.mfa && f === 'mfa')
				updates.mfa = data[f] === 'true';
			else
				updates[f] = data[f];
		}
	}
	return await prisma.users.update({
		where: { id_user: Number(id) },
		data: updates,
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			},
			mfa: true
		}
	});
}

export async function updateUserPasswordByUsername(username, password) {
	return await prisma.users.update({
		where: { username: username },
		data: { password: password },
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			}
		}
	});
}

export async function updateUserPasswordById(id_user, password) {
	const u = await prisma.users.update({
		where: {id_user: id_user},
		data: { password: password },
		select: {
			id_user: true,
			name: true,
			surname: true,
			username: true,
			email: true,
			image: true,
			nationality: true,
			points: true,
			title: true,
			preferences: {
				select: {
					id_preference: true,
					name: true
				}
			},
			mfa: true
		}
	});
	return ({
		id_user: u.id_user,
		name: u.name,
		surname: u.surname,
		username: u.username,
		setpwd: u.password !== null, 
		email: u.email,
		image: u.image,
		nationality: u.nationality,
		points: u.points,
		title: u.title,
		preferences: u.preferences,
		mfa: u.mfa
	});
}
