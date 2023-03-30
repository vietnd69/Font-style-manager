type FontWeight =
	| "thin"
	| "hairline"
	| "extralight"
	| "extra-light"
	| "ultraLight"
	| "ultra-light"
	| "light"
	| "normal"
	| "regular"
	| "medium"
	| "semibold"
	| "semi-bold"
	| "demibold"
	| "demi-bold"
	| "bold"
	| "extrabold"
	| "extra-bold"
	| "ultrabold"
	| "ultra-bold"
	| "black"
	| "heavy";
type FontStyle = "italic";
type FontWidth = "condensed";

const getFontWeightValue = (fontWeightName: string): { fontWeight?: number; fontStyle?: FontStyle; fontWidth?: FontWidth } => {
	const fontWeights: { [key: string]: number } = {
		thin: 100,
		hairline: 100,
		extralight: 200,
		"extra-light": 200,
		ultralight: 200,
		"ultra-light": 200,
		light: 300,
		normal: 400,
		regular: 400,
		medium: 500,
		semibold: 600,
		"semi-bold": 600,
		demibold: 600,
		"demi-bold": 600,
		bold: 700,
		extrabold: 800,
		"extra-bold": 800,
		ultrabold: 800,
		"ultra-bold": 800,
		black: 900,
		heavy: 900,
	};
	const fontStyles: FontStyle[] = ["italic"];

	const fontWidths: FontWidth[] = ["condensed"];
	const words = fontWeightName.toLowerCase().split(" ");

	let fontWeight = 400;
	let fontStyle: FontStyle | undefined;
	let fontWidth: FontWidth | undefined;


	for (const word of words) {
		if (word in fontWeights) {
			fontWeight = fontWeights[word as FontWeight];
		} else if (fontStyles.includes(word as FontStyle)) {
			fontStyle = word as FontStyle;
		} else if (fontWidths.includes(word as FontWidth)) {
			fontWidth = word as FontWidth;
		}
	}

	return { fontWeight, fontStyle, fontWidth };
};
export default getFontWeightValue;
