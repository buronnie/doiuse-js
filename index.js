const caniuse = require('caniuse-lite');
const broswerslist = require('browserslist');
const walk = require('babylon-walk');
const babylon = require('babylon');
const t = require('babel-types');
const fs = require('fs');

const supportedFeatures = require('./data/features');

const query = 'ie 11';
const browsers = broswerslist(query).map((browser) => {
	const [name, version] = browser.split(' ');
	return {
		name,
		version,
	};
});;

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
		plugins: [],
	});
	walk.simple(ast, {
		ArrowFunctionExpression(node) {
			if (missingFeatures['arrow-functions']) {
				console.log(`arrow function is not supported in ${missingFeatures['arrow-functions'].join(',')}`);
			}
		}
	});
});