/* eslint-env node */
module.exports = {
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:@figma/figma-plugins/recommended"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ["./widget-src/tsconfig.json", "./ui-src/tsconfig.json"] ,
	},
	root: true,
	ignorePatterns: [".eslintrc.js", "vite.config.ts"],
};
