const caniuse = require('caniuse-lite');
const broswerslist = require('browserslist');
const walk = require('babylon-walk');
const babylon = require('babylon');
const t = require('babel-types');
const fs = require('fs');

const supportedFeatures = require('./data/features');

const query = 'ie 10';
const browsers = broswerslist(query).map((browser) => {
	const [name, version] = browser.split(' ');
	return {
		name,
		version,
	};
});

const missingFeatures = {};

supportedFeatures.forEach((feature) => {
	const { title, stats } = caniuse.feature(caniuse.features[feature]);
	browsers.forEach(({ name, version }) => {
		if (!(stats[name] && stats[name][version] === 'y')) {
			const browserName = `${name} ${version}`;
			if (!(feature in missingFeatures)) {
				missingFeatures[feature] = [browserName];
			} else {
				missingFeatures[feature].push(browserName);
			}
		}
	});
});

fs.readFile('./test.js', (err, data) => {
	if (err) throw err;
	const src = data.toString();
	const ast = babylon.parse(src, {
		sourceType: "module",
		plugins: ['dynamicImport'],
	});
	walk.simple(ast, {
		ArrowFunctionExpression(node) {
			if (missingFeatures['arrow-functions']) {
				console.log(`arrow function is not supported in ${missingFeatures['arrow-functions'].join(',')}`);
			}
		},
		TemplateLiteral(node) {
			if (missingFeatures['template-literals']) {
				console.log(`template literal is not supported in ${missingFeatures['template-literals'].join(',')}`);
			}
		},
		ClassMethod(node) {
			if (missingFeatures['es6-class']) {
				console.log(`es6 class is not supported in ${missingFeatures['es6-class'].join(',')}`);
			}
		},
		FunctionDeclaration(node) {
			if (missingFeatures['es6-generators'] && node.generator) {
				console.log(`es6 generator is not supported in ${missingFeatures['es6-generators'].join(',')}`);
			}
		},
		Import(node) {
			if (missingFeatures['es6-module-dynamic-import']) {
				console.log(`es6 dynamic import is not supported in ${missingFeatures['es6-module-dynamic-import'].join(',')}`);
			}
		},
		ImportDeclaration(node) {
			if (missingFeatures['es6-module']) {
				console.log(`es6 import is not supported in ${missingFeatures['es6-module'].join(',')}`);
			}
		},
		ExportNamedDeclaration(node) {
			if (missingFeatures['es6-module']) {
				console.log(`es6 export is not supported in ${missingFeatures['es6-module'].join(',')}`);
			}
		},
		ExportDefaultDeclaration(node) {
			if (missingFeatures['es6-module']) {
				console.log(`es6 export default is not supported in ${missingFeatures['es6-module'].join(',')}`);
			}
		},
		VariableDeclaration(node) {
			if (missingFeatures['const'] && node.kind === 'const') {
				console.log(`const is not supported in ${missingFeatures['const'].join(',')}`);
			}
		}
	});
});