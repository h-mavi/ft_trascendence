#!/bin/sh

set -e

i=0
while [ ! -f /vault/shared/role-id ] || [ ! -f /vault/shared/secret-id ] || [ ! -f /vault/shared/secrets-ready ]; do
	i=$((i + 1))
	if [ "$i" -gt 60 ]; then
		echo "postgres: Vault non ha fornito le credenziali entro 60s" >&2
		exit 1
	fi
	sleep 1
done

ROLE_ID=$(cat /vault/shared/role-id)
SECRET_ID=$(cat /vault/shared/secret-id)

TOKEN=$(curl -s --request POST --data "{\"role_id\":\"$ROLE_ID\",\"secret_id\":\"$SECRET_ID\"}" \
		"$VAULT_ADDR/v1/auth/approle/login" | jq -r '.auth.client_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
	echo "postgres: impossibile autenticarsi su Vault" >&2
	exit 1
fi

SECRET=$(curl -s --header "X-Vault-Token: $TOKEN" "$VAULT_ADDR/v1/secret/data/backend")

export POSTGRES_USER=$(echo "$SECRET" | jq -r '.data.data.POSTGRES_USER')
export POSTGRES_PASSWORD=$(echo "$SECRET" | jq -r '.data.data.POSTGRES_PASSWORD')
export POSTGRES_DB=$(echo "$SECRET" | jq -r '.data.data.POSTGRES_DB')

for var_name in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB; do
	eval "val=\$$var_name"
	if [ -z "$val" ] || [ "$val" = "null" ]; then
		echo "postgres: $var_name non valido o mancante da Vault (secret/backend)" >&2
		exit 1
	fi
done

echo "postgres: credenziali prese da Vault"

exec docker-entrypoint.sh postgres