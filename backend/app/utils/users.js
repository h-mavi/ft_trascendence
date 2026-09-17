
import path from "path";
import sharp from 'sharp';
import fs from 'fs/promises';
import { prisma } from '../lib/prisma.js';

const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const userRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,18}[a-zA-Z0-9]$/;

export const checkEmail = (email) => {
	return (emailRegex.test(email));
}

export const checkPassword = (password) => {
	/** @type {{ password: string }} */
	const minLen = password.length >= 8;
	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasNumber = /[0-9]/.test(password);
	const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	return (minLen && hasUpper && hasLower && hasNumber && hasSpecial);
}

export const checkUsername = (username) => {
	return (userRegex.test(username));
}

export const checkInputs = (username, email, password) => {
	if (username && !checkUsername(username))
		return ("Username too short");
	if (email && !checkEmail(email))
		return ("Invalid email format");
	if (password && !checkPassword(password))
		return ("Invalid password format");
	return ("OK");
}

export async function deleteOldAvatar(id_user) {
	const u = await prisma.users.findUnique({
		where: { id_user: Number(id_user) },
		select: { image: true }
	});
	if (u?.image && !u?.image.includes('presetIcon'))
		await fs.unlink(path.join('.', u.image)).catch(() => {});
}

export async function uploadAvatar(req) {
	const filename = `img_${req.user.id_user}_${Date.now()}.webp`;
	const outputPath = path.join('media', 'usersAvatar', filename);
	try {
		await sharp(req.file.buffer).resize(300, 300, { fit: 'outside' }).webp({ quality: 80 }).toFile(outputPath);
	} catch (error) {
		throw new Error('Invalid image file');
	}
	await deleteOldAvatar(req.user.id_user);
	return (`/media/usersAvatar/${filename}`);
}
