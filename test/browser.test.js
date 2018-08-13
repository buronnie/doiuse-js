const { getBrowsersByQuery, getMissingFeatures } = require('../src/browser');

describe('getBrowsersByQuery', () => {
	it('should return ie 10 when the query is ie 10', () => {
		const query = 'ie 10';
		expect(getBrowsersByQuery(query)).toMatchSnapshot();
	});

	it('should return all browsers whose usage is > 1%', () => {
		const query = '> 1%';
		expect(getBrowsersByQuery(query)).toMatchSnapshot();
	});
});

describe('getMissingFeatures', () => {
	it('should return all missing features for ie 10', () => {
		const query = 'ie 10';
		expect(getMissingFeatures(query)).toMatchSnapshot();
	});

	it('should return all missing features for all browsers whose usage is > 1%', () => {
		const query = '> 1%';
		expect(getMissingFeatures(query)).toMatchSnapshot();
	});
});
