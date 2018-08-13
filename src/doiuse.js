const caniuse = require('caniuse-lite');
const broswerslist = require('browserslist');
const walk = require('babylon-walk');
const babylon = require('babylon');
const t = require('babel-types');
const fs = require('fs');
const chalk = require('chalk');
const promisify = require('./util/promisify');
const readFile = promisify(fs.readFile);

const supportedFeatures = require('../data/features');

function getBrowsersByQuery(query) {
	return broswerslist(query).map((browser) => {
		const [name, version] = browser.split(' ');
		return {
			name,
			version,
		};
	});
}

function getMissingFeatures(query) {
	const browsers = getBrowsersByQuery(query);
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
	return missingFeatures;
}

async function scanFile(query, filename, printLog) {
	const unsupportedFeatures = {};
	const missingFeatures = getMissingFeatures(query);

	function saveUnsupportedFeature(feature, featureName) {
		if (missingFeatures[feature]) {
			unsupportedFeatures[featureName] = missingFeatures[feature];
		}
	}

	function printUnsupportedFeatures() {
		for (let featureName in unsupportedFeatures) {
			console.log(`${chalk.red(featureName)} is not supported in ${chalk.yellow(unsupportedFeatures[featureName].join(','))}`);
		}
	}
	
	return readFile(filename)
		.then(data => {
			const src = data.toString();
			const ast = babylon.parse(src, {
				sourceType: "module",
				plugins: ['dynamicImport'],
			});
			walk.simple(ast, {
				ArrowFunctionExpression(node) {
					saveUnsupportedFeature('arrow-functions', 'arrow function');
				},
				TemplateLiteral(node) {
					saveUnsupportedFeature('template-literals', 'template literal');
				},
				ClassMethod(node) {
					saveUnsupportedFeature('es6-class', 'class');
				},
				FunctionDeclaration(node) {
					saveUnsupportedFeature('es6-generators', 'generator');
				},
				Import(node) {
					saveUnsupportedFeature('es6-module-dynamic-import', 'dynamic import');
				},
				ImportDeclaration(node) {
					saveUnsupportedFeature('es6-module', 'import');
				},
				ExportNamedDeclaration(node) {
					saveUnsupportedFeature('es6-module', 'export');
				},
				ExportDefaultDeclaration(node) {
					saveUnsupportedFeature('es6-module', 'export default');
				},
				VariableDeclaration(node) {
					saveUnsupportedFeature('const', 'const');
				}
			});

			if (printLog) {
				printUnsupportedFeatures();
			}
			return unsupportedFeatures;
		});
}

async function doiuse(query, files, printLog=false) {
	if (!files || files.length === 0) {
		return Promise.reject(new Error('No scanned files found!'));
	}

	return Promise.all(files.map(file => {
		return scanFile(query, file, printLog).then((unsupportedFeatures) => {
			return {
				file,
				unsupported_features: unsupportedFeatures,
			}
		});
	}));
}

module.exports = doiuse;
