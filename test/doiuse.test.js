const doiuse = require('../src/doiuse');

describe('doiuse', () => {
	it('should support filename as a string', async () => {
		const query = 'ie 11';
		const unsupportedFeatures = await doiuse(query, './test/data/fixture1.js');
		expect(unsupportedFeatures).toMatchSnapshot();
	});

	it('should return all unsupported features for the browsers whose usage > 1%', async () => {
		const query = '> 1%';
		const unsupportedFeatures = await doiuse(query, ['./test/data/fixture1.js']);
		expect(unsupportedFeatures).toMatchSnapshot();
	});
});
