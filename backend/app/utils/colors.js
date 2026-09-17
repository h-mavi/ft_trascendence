import chalk from 'chalk';

// Colori base — usa questi dove prima usavi colors.xxx
export const colors = {
	// Testo
	black:         chalk.black,
	red:           chalk.red,
	green:         chalk.green,
	yellow:        chalk.yellow,
	blue:          chalk.blue,
	magenta:       chalk.magenta,
	cyan:          chalk.cyan,
	white:         chalk.white,

	// Testo bright
	brightRed:     chalk.redBright,
	brightGreen:   chalk.greenBright,
	brightYellow:  chalk.yellowBright,
	brightBlue:    chalk.blueBright,
	brightMagenta: chalk.magentaBright,
	brightCyan:    chalk.cyanBright,
	brightWhite:   chalk.whiteBright,

	bgCyan: chalk.bgCyan,

	// Stile
	bold:      chalk.bold,
	dim:       chalk.dim,
	underline: chalk.underline,
	reset:     chalk.reset,
};

// Tag pronti per il terminale
export const tag = {
  info: chalk.bgBlue.white.bold(' INFO '),
  ok:   chalk.bgGreen.black.bold('  OK  '),
  db:   chalk.bgMagenta.white.bold('  DB  '),
  server: chalk.bgCyan.white.bold(' SERV '),
  warn: chalk.bgYellow.black.bold(' WARN '),
  err:  chalk.bgRed.white.bold(' ERRO '),
};