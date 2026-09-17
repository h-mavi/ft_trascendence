//@ts-check

import proc from "node:child_process";

let	n = 3;

console.log(`father, process.argv: ${process.argv}`);
TEST();

function TEST()
{
	const	child = proc.fork("test/PIPE/child.js"
	);

	child.on("spawn", () =>
	{
		console.log("WELCOME TO THIS CRAZY WORLD..");
	});

	child.on("disconnect", () =>
	{
		console.log("rap has died");
	});

	child.on("exit", (code, sig) =>
	{
		console.log(`child exit with code ${code} and sig ${sig}`);
	});

	child.on("close", (code, sig) => 
	{
		console.log(`CLOSE connection with code ${code} and sig ${sig}`);
	});

	child.on("message", (msg, handler) => 
	{
		console.log(`child message: ${msg}`);
		child.send(`Ciao figlio, ho ricevuto il tuo msg "${msg}". Non mandero gli alimenti a te e a mamma, le puttane non si pagano da sole.`);
	});

	child.on("error", (err) =>
	{
		console.log(err);
	});

	child.on("test", (test) => 
	{
		console.log("test " + test);
	});

	child.send(`Gazzetta dello sport`);
	setTimeout(() => {child.kill()}, 3000);
}
