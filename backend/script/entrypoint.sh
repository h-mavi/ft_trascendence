#!/bin/sh

set -e

redis-server --daemonize yes

# I segreti arrivano da Vault, non dal .env: aspetta che il container vault abbia
# scritto le credenziali AppRole sul volume condiviso, altrimenti la readFileSync
# in lib/vault.js fallisce.
i=0
while [ ! -f /vault/shared/role-id ] || [ ! -f /vault/shared/secret-id ] || [ ! -f /vault/shared/secrets-ready ]; do
	i=$((i + 1))
	if [ "$i" -gt 60 ]; then
		echo "backend: Vault non ha fornito le credenziali entro 60s" >&2
		exit 1
	fi
	sleep 1
done

# migrate deploy e' un processo a se' e legge prisma.config.ts, quindi DATABASE_URL
# va messa nell'ambiente della shell prima di invocarlo. L'export la fa ereditare
# anche al node main.js finale.
DATABASE_URL=$(node ./script/db-url.js)
export DATABASE_URL

npx prisma generate

i=1
until npx prisma migrate deploy; do
	if [ "$i" -ge 30 ]; then
		echo "backend: migrate deploy fallito dopo $i tentativi" >&2
		exit 1
	fi
	echo "backend: database non pronto, ritento ($i/30) ..."
	i=$((i + 1))
	sleep 2
done

exec node main.js
