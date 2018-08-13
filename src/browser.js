const caniuse = require('caniuse-lite');
const broswerslist = require('browserslist');
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
		const { stats } = caniuse.feature(caniuse.features[feature]);
		browsers.forEach(({ name, version }) => {
			if (!(stats[name] && /(^|\s)y($|\s)/.test(stats[name][version]))) {
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

module.exports = {
	getBrowsersByQuery,
	getMissingFeatures,
};
