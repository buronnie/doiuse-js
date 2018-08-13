const program = require('commander');
const version = require('./package.json').version;
const doiuse = require('./src/doiuse');

program.version(version);
program
	.usage('[options] <file ...>')
	.option('-b, --browserslist <query>', 'set browserslist query')
	.parse(process.argv)

doiuse(program.browserslist, program.args, true);
