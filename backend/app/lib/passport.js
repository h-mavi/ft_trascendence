
import { query } from './query.js';
import passport  from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as usersQuery from "../query/usersQuery.js";

/**
 * @typedef {import('passport-google-oauth20').Profile} profile
 * @typedef {import('passport').DoneCallback} done
 */
passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: '/auth/google_login/callback' // callback nostra interna su backend
	},
	async function (_accessToken, _refreshToken, profile, done) {
		let user = await usersQuery.getUserByGoogleId(profile.id);

		if (user)
			return done(null, user);
		user = await usersQuery.getUserByEmail(profile.emails[0].value);
		if (user)
		{
			user = await usersQuery.updateUserFieldsById(user.id_user, {google_id: profile.id});
			return done (null, user);
		}
		let username = "user" + Math.trunc(Math.random() * 100000000);
		user = await usersQuery.getUserByUsername(username);
		if (user)
		{
			while (await usersQuery.getUserByUsername(username))
				username = "user" + Math.trunc(Math.random() * 1000000000);
		}
		user = await usersQuery.createUser(profile.name.givenName, profile.name.familyName, username, null, profile.emails[0].value, 'N/D');
		delete(user.password);
		return done (null, user);
}));

export default passport;