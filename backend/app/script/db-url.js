
//Stampa la sola DATABASE_URL presa da Vault, cosi' l'entrypoint puo' esportarla
//nell'ambiente della shell: `prisma migrate deploy` e' un processo separato da
//main.js e legge prisma.config.ts, che si aspetta di trovarla gia' in process.env.

import { loadSecretsFromVault } from '../lib/vault.js';

await loadSecretsFromVault();

if (!process.env.DATABASE_URL) {
	console.error('backend: DATABASE_URL mancante da Vault (secret/backend)');
	process.exit(1);
}

process.stdout.write(process.env.DATABASE_URL);
