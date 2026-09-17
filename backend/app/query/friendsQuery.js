
import { prisma } from "../lib/prisma.js";

// NOTE: ritorna tutte le amicizie di un utente cercando id utente tra id_user1/id_user2 e ritorna un oggetto contenente solo le info dell'utente amico
export async function getAllUserFriendships(id_user) {
	const friendList = await prisma.friendships.findMany({
		select: {
			id_friendship: true,
			users_friendships_id_user1Tousers: {
				select: {
					id_user: true,
					name: true,
					surname: true,
					username: true,
					nationality: true,
					image: true,
					points: true,
					title: true
				}
			},
			users_friendships_id_user2Tousers: {
				select: {
					id_user: true,
					name: true,
					surname: true,
					username: true,
					nationality: true,
					image: true,
					points: true,
					title: true
				}
			},
			users_friendships_senderTousers: {
				select: {
					id_user: true,
					username: true
				}
			},
			friend_status: true
		},
		where: {
			OR: [
				{ id_user1: Number(id_user) },
				{ id_user2: Number(id_user) }
			]
		}
	});
	return friendList.map(f => ({
		id_friendship: f.id_friendship,
		friend: f.users_friendships_id_user1Tousers.id_user === Number(id_user)
		? f.users_friendships_id_user2Tousers
		: f.users_friendships_id_user1Tousers,
		friend_status: f.friend_status,
		sender: f.users_friendships_senderTousers
	}));
}

export async function getUserFriendsById(id_user) {
	const friendList = await prisma.friendships.findMany({
		select: {
			id_friendship: true,
			users_friendships_id_user1Tousers: {
				select: {
					id_user: true,
					name: true,
					surname: true,
					username: true,
					nationality: true,
					image: true,
					points: true,
					title: true
				}
			},
			users_friendships_id_user2Tousers: {
				select: {
					id_user: true,
					name: true,
					surname: true,
					username: true,
					nationality: true,
					image: true,
					points: true,
					title: true
				}
			},
			users_friendships_senderTousers: {
				select: {
					id_user: true,
					username: true
				}
			},
			friend_status: true
		},
		where: {
			OR: [
				{ id_user1: Number(id_user) },
				{ id_user2: Number(id_user) }
			]
		}
	});
	return friendList.map(f => ({
		id_friendship: f.id_friendship,
		friend: f.users_friendships_id_user1Tousers.id_user == id_user
		? f.users_friendships_id_user2Tousers
		: f.users_friendships_id_user1Tousers,
		friend_status: f.friend_status,
		sender: f.users_friendships_senderTousers
	}));
}

// NOTE: ritorna la nuova amicizia di un utente cercando come un oggetto contenente solo le info dell'utente a cui e stata inviata la richiesta
export async function sendFriendship(id_user, id_friend) {
	const data = { friend_status: "pending", id_user1: id_user, id_user2: id_friend, sender: id_user };
	if (id_user > id_friend)
		data.id_user1 = id_friend, data.id_user2 = id_user;
	const newFriend = await prisma.friendships.createManyAndReturn({
		data: data,
		select: {
			id_friendship: true,
			users_friendships_id_user1Tousers: {
				select: {
					id_user: true,
					name: true,
					surname: true,
					username: true,
					nationality: true,
					image: true,
					points: true,
					title: true
				}
			},
			users_friendships_id_user2Tousers: {
				select: {
					id_user: true,
					name: true,
					surname: true,
					username: true,
					nationality: true,
					image: true,
					points: true,
					title: true
				}
			},
			users_friendships_senderTousers: {
				select: {
					id_user: true,
					username: true
				}
			},
			friend_status: true
		}
	});
	return newFriend.map(f => ({
		id_friendship: f.id_friendship,
		friend: f.users_friendships_id_user1Tousers.id_user === id_user
		? f.users_friendships_id_user2Tousers
		: f.users_friendships_id_user1Tousers,
		friend_status: f.friend_status,
		sender: f.users_friendships_senderTousers
	}));
}

export async function removeFriendship(id_user, id_friend) {
	const [user1, user2] = id_user < id_friend ? [id_user, id_friend] : [id_friend, id_user]; 
	const filter = { id_user1_id_user2: { id_user1: user1, id_user2: user2 } };
	return prisma.friendships.delete({
		where: filter
	});
}

// NOTE: aggiorna amicizia da 'pending' a 'accepted'
export async function updateFriendship(id_user, id_friend) {
	const [user1, user2] = id_user < id_friend ? [id_user, id_friend] : [id_friend, id_user]; 
	const filter = { id_user1_id_user2: { id_user1: user1, id_user2: user2 }, friend_status: 'pending' };
	return await prisma.friendships.update({
		data: {
			friend_status: 'accepted'
		},
		where: filter
	});
}
