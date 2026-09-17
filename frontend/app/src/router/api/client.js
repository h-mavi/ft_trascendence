import { useAuthStore } from "../../stores/auth.st";

const	BASE_URL = '';

async function request(endpoint, options = {}) {
	const res = await fetch(`${BASE_URL}${endpoint}`, {
		headers: { 'Content-Type': 'application/json' },
		cache: 'no-store',
		credentials: 'include',
		...options
	});

	return (checkResp(res, request, endpoint, options));
}

async function request_m(endpoint, options = {}) {
	const isFormData = options.body instanceof FormData;

	const res = await fetch(`${BASE_URL}${endpoint}`, {
		credentials: 'include',
		...options,
		headers: {
			...(!isFormData && { 'Content-Type': 'application/json' }),
			...options.headers
		}
	});

	return(checkResp(res, request_m, endpoint, options));
}

async function checkResp(res, fun, endpoint, options)
{
	const	Jres = await res.json().catch(() => ({})),
			auth = useAuthStore();

	if (res.status === 401 && auth.user != null)
	{
		if (Jres.message === "Token expired")
		{
			const refreshed = await tryRefresh(auth);
			if (refreshed.ok)
				return fun(endpoint, options);
			return await forceLogout(auth);
		}
		if (Jres.message === "Token not found")
			return await forceLogout(auth);
	}

	if (!res.ok ) { throw new ApiError(Jres.message ?? 'Errore sconosciuto', res.status); }
	if (res.status == 204) { return null; }

	return Jres;
}

async function forceLogout(auth)
{
	await auth.logout(true);
	throw new AuthError('Sessione scaduta');
}

async function tryRefresh(auth) {
	try
	{
		const res = await fetch(`${BASE_URL}/auth/refresh`, {
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ user: auth.user })
		});
		return res;
	}
	catch(err) { return err; }
}

// Errori tipizzati così nello store puoi distinguerli
export class ApiError extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	};
}

export class AuthError extends Error {}

export const api = {
		get:	(endpoint)			=> request  (endpoint),
		post:	(endpoint, body)	=> request  (endpoint, { method: 'POST',   body: JSON.stringify(body) }),
		put:	(endpoint, body)	=> request  (endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
		patch:  (endpoint, body)	=> request  (endpoint, { method: 'PATCH',  body: JSON.stringify(body) }),
		delete:	(endpoint, body)	=> request  (endpoint, { method: 'DELETE', body: JSON.stringify(body) }),
		patch_m:(endpoint, body)	=> request_m(endpoint, { method: 'PATCH',  body: body })
}