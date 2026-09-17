
import { logfd } from "../lib/lib.js";
import { colors, tag } from "./colors.js";

const textColor = {
	info: colors.blue,
	ok:   colors.green.bold,
	db:   colors.magenta,
  server: colors.cyan,
	warn: colors.yellow,
	err:  colors.red.bold
};

async function printLog(message, type = 'info') {
	const now = new Date().toLocaleString('sv-SE');
	console.log(`${colors.dim(`[ ${now} ]`)} ${tag[type] ?? tag.info}  ${(textColor[type] ?? colors.white)(message)}`);
	// await logfd.write(`[ ${now} ] [${type.toUpperCase()}] ${message}\n`);
}

export const log = {
  info:  (msg) => printLog(msg, 'info'),
  ok:    (msg) => printLog(msg, 'ok'),
  db:    (msg) => printLog(msg, 'db'),
  server: (msg, port) => printLog(msg + " " + colors.bold(port) + "...", 'server'),
  warn:  (msg) => printLog(msg, 'warn'),
  err:   (msg) => printLog(msg, 'err'),

  banner: (port) => {
    console.log("\n" + colors.green(colors.bold('  ✓  Server in ascolto')));
    console.log(colors.dim(`     http://localhost:${port}`) + '\n');
  },

  header: (name, version) => {
    const sep = colors.dim('─'.repeat(60));
    console.log(`\n${sep}`);
    console.log(colors.dim(`  ${name}  v${version}  •  NODE_ENV=${process.env.NODE_ENV || 'production'}`));
    console.log(`${sep}\n`);
  },
};
