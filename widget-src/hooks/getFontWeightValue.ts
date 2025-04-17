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

// Map of text descriptions to numerical weights
const FONT_WEIGHT_MAP: Record<string, FontWeightNumerical> = {
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

// Add compound entries to the map
const FONT_STYLES = ["italic"];
const FONT_WIDTHS = ["condensed"];

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
  const lowercaseName = fontWeightName.toLowerCase();
  const words = lowercaseName.split(" ");

  // Default to regular weight if no weight is specified
  let fontWeight: FontWeightNumerical = 400;
  let fontStyle: FontStyle | undefined;
  let fontWidth: FontWidth | undefined;

  // First check if any word directly maps to a weight
  for (const word of words) {
    if (FONT_WEIGHT_MAP[word]) {
      fontWeight = FONT_WEIGHT_MAP[word];
    } else if (FONT_STYLES.includes(word as FontStyle)) {
      fontStyle = word as FontStyle;
    } else if (FONT_WIDTHS.includes(word as FontWidth)) {
      fontWidth = word as FontWidth;
    }
  }

  // If no direct match found, check if the full name contains weight keywords
  if (fontWeight === 400) {
    // Check for weight in the full name
    for (const [key, value] of Object.entries(FONT_WEIGHT_MAP)) {
      if (lowercaseName.includes(key)) {
        fontWeight = value;
        break;
      }
    }
  }

  return { fontWeight, fontStyle, fontWidth };
};

export default getFontWeightValue;
