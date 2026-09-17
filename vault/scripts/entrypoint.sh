#!/bin/sh

set -e

# Il volume condiviso sopravvive ai restart: il flag va azzerato subito, altrimenti
# quello del run precedente fa passare l'attesa di backend e postgres mentre Vault
# e' ancora sealed.
rm -f /vault/shared/secrets-ready

chown -R 100:100 /vault/data /vault/logs 2>/dev/null || true

vault server -config=/vault/config/config.hcl & VAULT_PID=$!

export VAULT_ADDR="http://127.0.0.1:8200"
KEYFILE="/vault/keys/vault-keys.json"

echo "Waiting for Vault response ..."
until vault status >/dev/null 2>&1 || [ $? -eq 2 ]; do
	sleep 1
done

INITIALIZED=$(vault status -format=json | jq -r '.initialized')

if [ "$INITIALIZED" = "false" ]; then
	echo "Initializing Vault keys (first time) ..."
	vault operator init -key-shares=5 -key-threshold=3 -format=json > "$KEYFILE"
	chmod 600 "$KEYFILE"
	echo "Vault unlocked ..."
fi

SEALED=$(vault status -format=json | jq -r '.sealed')
if [ "$SEALED" = "true" ] && [ -f "$KEYFILE" ]; then
	echo "Unlocking vault ..."
	for i in 0 1 2; do
		KEY=$(jq -r ".unseal_keys_b64[$i]" "$KEYFILE")
		vault operator unseal "$KEY"
	done
	echo "Vault unlocked ..."
fi

export VAULT_TOKEN=$(jq -r '.root_token' "$KEYFILE")

if ! vault secrets list -format=json | jq -e '.["secret/"]' > /dev/null 2>&1; then
	vault secrets enable -path=secret kv-v2
	echo "kv-v2 version enabled ..."
else
	echo "secret/ already enabled, skipping ..."
fi

vault policy write backend-policy /vault/policies/backend-policy.hcl
echo "backend-policy uploaded and written ..."

if ! vault auth list -format=json | jq -e '.["approle/"]' > /dev/null 2>&1; then
	vault auth enable approle
	echo "AppRole enabled ..."
else
	echo "approle/ already enabled, skipping ..."
fi

vault write auth/approle/role/backend-role token_policies="backend-policy" token_ttl=1h token_max_ttl=4h
echo "AppRole connected to backend-policy ..."

ROLE_ID_FILE="/vault/shared/role-id"
ROLE_ID=$(vault read -format=json auth/approle/role/backend-role/role-id | jq -r '.data.role_id')
echo "$ROLE_ID" > "$ROLE_ID_FILE"
echo "RoleID generated ..."

SECRET_ID_FILE="/vault/shared/secret-id"
if [ ! -f "$SECRET_ID_FILE" ]; then
	echo "First run: generating new SecretID ..."
	SECRET_ID=$(vault write -format=json -f auth/approle/role/backend-role/secret-id | jq -r '.data.secret_id')
	echo "$SECRET_ID" > "$SECRET_ID_FILE"
	echo "SecretID generated ..."
else
	echo "SecretID already exists, skipping generation ..."
fi

# --- sincronizza secret/backend dal .env ---
ENV_FILE="/vault/.env"
if [ -f "$ENV_FILE" ]; then
	ENV_JSON="{}"
	set --
	while IFS='=' read -r key value; do
		case "$key" in
			""|\#*) continue ;;
		esac
		value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
		set -- "$@" "$key=$value"
		ENV_JSON=$(echo "$ENV_JSON" | jq --arg k "$key" --arg v "$value" '. + {($k): $v}')
	done < "$ENV_FILE"

	CURRENT_JSON=$(vault kv get -format=json secret/backend 2>/dev/null | jq -c '.data.data')

	if [ -n "$CURRENT_JSON" ] && [ "$CURRENT_JSON" != "null" ] \
		&& [ "$(echo "$CURRENT_JSON" | jq -S .)" = "$(echo "$ENV_JSON" | jq -S .)" ]; then
		echo "Secrets invariati, nessun aggiornamento necessario ..."
	else
		echo "Secrets modificati, aggiorno Vault ..."
		vault kv put secret/backend "$@"
	fi
else
	echo "File $ENV_FILE non trovato, salto la sincronizzazione secrets" >&2
fi

touch /vault/shared/secrets-ready

echo "Vault is ready!"
wait $VAULT_PID