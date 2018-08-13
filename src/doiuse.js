const walk = require('babylon-walk');
const babylon = require('babylon');
const t = require('babel-types');
const fs = require('fs');
const chalk = require('chalk');
const promisify = require('./util/promisify');
const readFile = promisify(fs.readFile);
const { getMissingFeatures } = require('./browser');
const createVisitor = require('./visitor');

async function scanFile(missingFeatures, filename, printLog) {
	const unsupportedFeatures = {};

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
	
	const data = await readFile(filename);
	const src = data.toString();
	const ast = babylon.parse(src, {
		sourceType: "module",
		plugins: ['dynamicImport'],
	});
	walk.simple(ast, createVisitor(saveUnsupportedFeature));

	if (printLog) {
		printUnsupportedFeatures();
	}
	return unsupportedFeatures;
}

async function doiuse(query, files, printLog=false) {
	if (!files || files.length === 0) {
		return Promise.reject(new Error('No scanned files found!'));
	}

	const missingFeatures = getMissingFeatures(query);

	return Promise.all(files.map(file => {
		return scanFile(missingFeatures, file, printLog).then((unsupportedFeatures) => {
			return {
				file,
				unsupported_features: unsupportedFeatures,
			}
		});
	}));
}

module.exports = doiuse;
