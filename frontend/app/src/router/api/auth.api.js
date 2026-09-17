import { api } from './client'

export const authApi = {
	login:		async (credentials) => {
		const resp = await api.post('/auth/login', credentials); // { username, password }
		return (resp);
	},
	mfa:	async(credentials) => {
		const resp = await api.post('/auth/verifyOtp', credentials); // { OTP code }
		return (resp.data.user);
	},
	register:	async (userData) => {
		const resp = await api.post('/auth/register', userData); // { name, surname, username, email, password, nationality }
		return (resp.data.user);
	},
	me:			async () => {
		const resp = await api.get('/api/users/me'); // ripristino sessione al mount
		return (resp.data.user);
	},
	update:		async (userData) => {
		const resp = await api.patch_m('/api/users', userData); // aggiornamento delle info dello user
		return (resp.data.user);
	},
	changePwd:	async (userData) => {
		const resp = await api.patch('/api/users/loggedUpdatePassword', userData); // aggiornamento della password
		return (resp.data.user);
	},
	logout:		async(userData) => api.post('/auth/logout', userData)
}