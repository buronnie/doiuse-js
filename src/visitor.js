function createVisitor(saveUnsupportedFeature) {
	return {
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
	}
}

module.exports = createVisitor;
