import { api }				from '../router/api/client';
import { debug } 			from '../scripts/Data/Variables';
import { authApi }			from '../router/api/auth.api';
import { defineStore }		from 'pinia';
import { useMsgStore }      from './msg.st';
import { useSockStore }     from './sock.st';
import router from "../router/index.js"

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null,	// { id_user, name, surname, username, email, image, nationality, points, title, preferences, mfa }
		isLoading: false,
		error: null,
		sessionChecked: false
	}),

	getters: 
	{
		isAuthenticated: (state) => !!state.user,
		username: (state) => state.user?.username ?? 'Guest'
	},

	actions: 
	{
		async 	login(credentials)
		{
			this.isLoading = true;
			this.error = null;
			try {
				const resp = await authApi.login(credentials);
				if (resp.data.user)
				{
					this.user = resp.data.user;
					await useSockStore().connect();
					await useMsgStore().getMsg();
					this.sessionChecked = true;
				}
				else if (resp.data.message === "OTP sent by email")
					this.error = resp;
			}
			catch (err) { this.error = err.message; }
			finally		{ this.isLoading = false; }
			return (this.error);
		},

		async	mfa(credentials)
		{
			this.isLoading = true;
			this.error = null;
			try {
				this.user = await authApi.mfa(credentials);
				if (this.user)
				{
					useSockStore().connect();
					useMsgStore().getMsg();
					this.sessionChecked = true;
				}
			}
			catch (err) { this.error = err.message; }
			finally		{ this.isLoading = false; }
			return (this.error);
		},

		async register(credentials)
		{
			this.isLoading = true;
			this.error = null;
			try {
				this.user = await authApi.register(credentials);
				useSockStore().connect();
				this.sessionChecked = true;
			}
			catch (err) { this.error = err.message; }
			finally		{ this.isLoading = false; }
			return (this.error);
		},

		async logout(force = false) 
		{
			try {
				if (force)
					await api.post('/auth/forceLogout', { id_user: this.user.id_user })
				else
					await authApi.logout({ id_user: this.user.id_user });
				await router.push('/login');
				useMsgStore().clear();
				useSockStore().socket.emit("logout");
				useSockStore().disconnect();
				this.user = null;
			}
			catch(err) { debug("[logout]: Errore nel logout!\n" + err) }
		},

		async update(credentials)
		{
			this.isLoading = true;
			this.error = null;
			try {
				this.user = await authApi.update(credentials);
			}
			catch (err) { this.error = err.message; }
			finally		{ this.isLoading = false; }
			return (this.error);
		},

		async changePwd(credentials)
		{
			this.isLoading = true;
			this.error = null;
			try { this.user = await authApi.changePwd(credentials); }
			catch (err) { this.error = err.message; }
			finally		{ this.isLoading = false; }
			return (this.error);
		},

		async fetchMe(force = false) 
		{
			if (this.sessionChecked && !force) { return; }
			// Ora con questa guardia su has_session nel localstorage non fa più la fetch se
			// andrebbe male e restituirebbe 404 
			if (!localStorage.getItem('has_session')) { this.sessionChecked = true; return; }
			try {
				this.user = await authApi.me();
				if (this.user) { useSockStore().connect(); useMsgStore().getMsg(); }
			}
			catch	{ this.user = null; }
			finally	{ this.sessionChecked = true; }
		},
	}
})
