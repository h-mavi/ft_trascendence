
import { PrismaClient }			from "../generated/prisma/index.js";
import { PrismaPg }				from "@prisma/adapter-pg";
import { log }					from "../utils/log.js";
import * as lib					from "./lib.js";
import dotenv					from "dotenv";
import { loadSecretsFromVault } from './vault.js';
import { IS_CHILD_PROCESS }		from "../Macro/macro.js";

dotenv.config();

await loadSecretsFromVault();

if (!IS_CHILD_PROCESS)
{
	log.header('ft_transcendence', '1.0.0');
	log.db("Setting up Prisma client...");
}

/** @type { PrismaClient } */
const prisma = global.prisma ?? new PrismaClient(
  {adapter: new PrismaPg( { connectionString: process.env.DATABASE_URL } )}
);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

if (!IS_CHILD_PROCESS)
	log.ok("Prisma client has been set up");

export { prisma };
