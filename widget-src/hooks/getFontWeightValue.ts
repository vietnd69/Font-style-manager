/**
 * Font weight identifiers in text
 */
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

/**
 * Font style identifier
 */
type FontStyle = "italic";

/**
 * Font width identifier
 */
type FontWidth = "condensed";

/**
 * Numerical values for font weights according to CSS standards
 */
export type FontWeightNumerical =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

/**
 * Convert a font weight name (e.g., "Light Italic") to its numerical, style, and width values
 *
 * This function parses a font style name and extracts:
 * - Font weight (numerical value from 100-900)
 * - Font style (e.g., italic)
 * - Font width (e.g., condensed)
 *
 * @param fontWeightName - The font weight/style name to parse
 * @returns Object with fontWeight, fontStyle, and fontWidth properties
 */
const getFontWeightValue = (
  fontWeightName: string
): {
  fontWeight?: FontWeightNumerical;
  fontStyle?: FontStyle;
  fontWidth?: FontWidth;
} => {
  // Map of text descriptions to numerical weights
  const fontWeights: { [key: string]: FontWeightNumerical } = {
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
    "thin italic": 100,
    "hairline italic": 100,
    "extralight italic": 200,
    "extra-light italic": 200,
    "ultralight italic": 200,
    "ultra-light italic": 200,
    "light italic": 300,
    "normal italic": 400,
    "regular italic": 400,
    "medium italic": 500,
    "semibold italic": 600,
    "semi-bold italic": 600,
    "demibold italic": 600,
    "demi-bold italic": 600,
    "bold italic": 700,
    "extrabold italic": 800,
    "extra-bold italic": 800,
    "ultrabold italic": 800,
    "ultra-bold italic": 800,
    "black italic": 900,
    "heavy italic": 900,
    "thin condensed": 100,
    "hairline condensed": 100,
    "extralight condensed": 200,
    "extra-light condensed": 200,
    "ultralight condensed": 200,
    "ultra-light condensed": 200,
    "light condensed": 300,
    "normal condensed": 400,
    "regular condensed": 400,
    "medium condensed": 500,
    "semibold condensed": 600,
    "semi-bold condensed": 600,
    "demibold condensed": 600,
    "demi-bold condensed": 600,
    "bold condensed": 700,
    "extrabold condensed": 800,
    "extra-bold condensed": 800,
    "ultrabold condensed": 800,
    "ultra-bold condensed": 800,
    "black condensed": 900,
    "heavy condensed": 900,
  };
  const fontStyles: FontStyle[] = ["italic"];
  const fontWidths: FontWidth[] = ["condensed"];

  // Split the font weight name into words for processing
  const words = fontWeightName.toLowerCase().split(" ");

  // Default to regular weight if no weight is specified
  let fontWeight: FontWeightNumerical = 400;
  let fontStyle: FontStyle | undefined;
  let fontWidth: FontWidth | undefined;

  // Process each word to determine weight, style, and width
  for (const word of words) {
    if (word in fontWeights) {
      fontWeight = fontWeights[word as FontWeight];
    } else if (fontStyles.includes(word as FontStyle)) {
      fontStyle = word as FontStyle;
    } else if (fontWidths.includes(word as FontWidth)) {
      fontWidth = word as FontWidth;
    }
  }

  // Nếu không tìm thấy weight từng từ, thử tìm trong toàn bộ tên style
  if (fontWeight === 400) {
    const fullStyleName = fontWeightName.toLowerCase();
    for (const [key, value] of Object.entries(fontWeights)) {
      if (fullStyleName.includes(key)) {
        fontWeight = value;
        break;
      }
    }
  }

  return { fontWeight, fontStyle, fontWidth };
};

export default getFontWeightValue;
