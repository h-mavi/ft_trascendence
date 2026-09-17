#!/bin/sh
set -e

ENV_FILE=".env"
EXAMPLE_FILE="env.example"

if [ ! -f "$ENV_FILE" ]; then
	echo "Errore: $ENV_FILE not found.\nTerminating the process." >&2
	sleep 2
	exit 1
fi

if [ ! -f "$EXAMPLE_FILE" ]; then
	echo "Errore: $EXAMPLE_FILE not found.\nTerminating the process." >&2
	sleep 2
	exit 1
fi

while IFS= read -r line; do
	case "$line" in
		''|\#*) continue ;;
	esac
	key=$(printf '%s' "$line" | cut -d '=' -f1)

	# riga commentata (anche con spazi prima del #) o vuota nel .env -> non valida
	entry=$(grep -n "^[[:space:]]*${key}[[:space:]]*=" "$ENV_FILE" | grep -v "^\s*[0-9]*:\s*#" | head -n1)

	if [ -z "$entry" ]; then
		echo "Variable $key is missing. Fill it and run again 'make'"
		exit 1
	fi

	raw_line=$(printf '%s' "$entry" | cut -d: -f2-)

	case "$raw_line" in
		"${key}="*) : ;;
		*)
			echo "Variable $key has space near '='. Fix it and run again 'make'"
			exit 1
	esac

	value=$(printf '%s' "$raw_line" | cut -d '=' -f2-)
	value=$(printf '%s' "$value" | tr -d '"'"'"'')

	if [ -z "$value" ] || [ "$value" = "null" ]; then
		echo "Variable $key is missing. Fill it and run again 'make'"
		exit 1
	fi
done < "$EXAMPLE_FILE"

while IFS='=' read -r key _; do
	case "$key" in
		''|\#*) continue ;;
	esac
	value=$(grep -m1 "^${key}=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"'"'"'')
	if [ -z "$value" ] || [ "$value" = "null" ]; then
		echo "Variable $key is missing. Fill it and run again 'make'"
		exit 1
	fi
done < "$EXAMPLE_FILE"

echo "File .env is correct.\nStarting container building ..."
sleep 2