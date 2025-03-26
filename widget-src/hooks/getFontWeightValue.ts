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

  return { fontWeight, fontStyle, fontWidth };
};

export default getFontWeightValue;
