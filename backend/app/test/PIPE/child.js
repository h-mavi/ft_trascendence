//@ts-check


if (process.send)
	process.send(process.argv);
process.on("message", (data) =>
{
	console.log(`finalmente, ecco papone con gli alimenti!`);
	console.log(data);
});
