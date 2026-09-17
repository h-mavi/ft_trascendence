
import fs from 'fs';

const VAULT_ADDR = 'http://vault:8200'
const PATH_ROLE_ID = '/vault/shared/role-id';
const PATH_SECRET_ID = '/vault/shared/secret-id';

function retrieveCredentials() {
	const roleId = fs.readFileSync(PATH_ROLE_ID, 'utf-8').trim();
	const secretId = fs.readFileSync(PATH_SECRET_ID, 'utf-8').trim();
	return { roleId, secretId };
}

async function appRoleLogin(roleId, secretId) {
	const res = await fetch(`${VAULT_ADDR}/v1/auth/approle/login`, {
		method: 'POST',
		body: JSON.stringify({ role_id: roleId, secret_id: secretId })
	});
	if (!res.ok)
		throw new Error(`Vault login failed: ${res.status} ${await res.text()}`);
	const val = await res.json();
	return val.auth.client_token;
}

async function getSecrets(token, path) {
	const res = await fetch(`${VAULT_ADDR}/v1/secret/data/${path}`, {
		headers: { 'X-Vault-Token': token }
	});
	if (!res.ok)
		throw new Error(`Failed to read secret ${path}: ${res.status}`);
	const vals = await res.json();
	return vals.data.data;
}

export async function loadSecretsFromVault() {
	const { roleId, secretId } = retrieveCredentials();
	const token = await appRoleLogin(roleId, secretId);
	const secrets = await getSecrets(token, 'backend');
	Object.assign(process.env, secrets);
}
