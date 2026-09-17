
import { prisma } from "../lib/prisma.js";

export async function getAllPieces() {
	return await prisma.pieces.findMany({
		select: {
			id_piece: true,
			name: true,
			cost: true,
			info: true,
			lore: true,
			abilities: {
				select: {
					id_ability: true,
					name: true,
					description: true
				}
			}
		},
		orderBy: {
			id_piece: 'asc'
		}
	});
}

export async function findPieceByName(name) {
	return await prisma.pieces.findMany({
		select: {
			id_piece: true,
			name: true,
			cost: true,
			info: true,
			lore: true,
			abilities: {
				select: {
					id_ability: true,
					name: true,
					description: true
				}
			}
		},
		where: {
			name: {
				contains: String(name),
				mode: 'insensitive'
			}
		},
		orderBy: {
			id_piece: 'asc'
		}
	});
}

export async function getPieceById(id) {
	return await prisma.pieces.findUnique({
		where: {
			id_piece: Number(id)
		}, 
		select: {
			id_piece: true,
			name: true,
			cost: true,
			info: true,
			lore: true,
			abilities: {
				select: {
					id_ability: true,
					name: true,
					description: true
				}
			}
		}
	});
}
