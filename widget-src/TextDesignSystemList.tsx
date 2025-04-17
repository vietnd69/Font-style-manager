import { textStyleType } from "./code";
import getFontWeightValue from "./hooks/getFontWeightValue";
import type { FontWeightNumerical } from "./hooks/getFontWeightValue";

const { widget } = figma;
const { AutoLayout, Text, Rectangle } = widget;

/**
 * Props for the TextDesignList component
 */
type TextDesignSystemListType = {
  showStyle: textStyleType[]; // Text styles to display
  showGroup: string[]; // Groups to display
};

/**
 * Extract only the name part from a style path
 * For example: "Heading/H1" returns "H1"
 *
 * @param name - Style name or path
 * @returns The extracted name without the path
 */
const getOnlyName = (name: string) => {
  if (name.includes("/")) {
    const onlyName: string | undefined = name.split("/").pop();
    return onlyName ? onlyName : "";
  } else {
    return name;
  }
};

/**
 * Split a style name into name and group components
 * 
 * @param name - Style name in format "Group/Name" or just "Name"
 * @returns Object with separated name and group
 */
const splitNameAndGroup = (name: string): { name: string; group: string } => {
  if (name.includes("/")) {
    const parts = name.split("/");
    const onlyName = parts.pop() || "";
    const group = parts.join("/");
    return { name: onlyName, group };
  } else {
    return { name, group: "" };
  }
};

/**
 * TextDesignList Component
 *
 * Renders a list of text styles with their visual representation
 * and properties such as font family, style, size, etc.
 *
 * @param value - Configuration with styles and groups to show
 */
const TextDesignList = ({ value }: { value: TextDesignSystemListType }) => {
  const { showStyle } = value;
  const styleList = showStyle;

  /**
   * Format line height value for display
   */
  const formatLineHeight = (lineHeight: LineHeight) => {
    if (lineHeight.unit !== "AUTO" && lineHeight.value) {
      return lineHeight.unit === "PIXELS" 
        ? `${lineHeight.value}px`
        : parseFloat((lineHeight.value / 100).toPrecision(3));
    }
    return "auto";
  };

  return (
    <AutoLayout direction={"vertical"} width={"fill-parent"}>
      {styleList.length !== 0 &&
        styleList.map((style: textStyleType, index: number) => {
          const { name, group } = splitNameAndGroup(style.name);
          const fontWeight = getFontWeightValue(style.fontName.style).fontWeight as FontWeightNumerical;
          
          return (
            <AutoLayout
              key={index}
              width={"fill-parent"}
              direction={"vertical"}
            >
              {/* Style preview with actual font rendering */}
              <AutoLayout
                width={"fill-parent"}
                height={"hug-contents"}
                verticalAlignItems={"center"}
                padding={{ top: 16, bottom: 16, right: 32, left: 32 }}
              >
                <AutoLayout verticalAlignItems={"center"}>
                  <Text
                    width={170}
                    fontSize={style.fontSize}
                    fontFamily={style.fontName.family}
                    fontWeight={fontWeight}
                  >
                    Ag
                  </Text>
                  <AutoLayout
                    width={"hug-contents"}
                    height={"hug-contents"}
                    direction="vertical"
                  >
                    <Text fontSize={18} fill={"#777"}>
                      {group}
                    </Text>
                    <Text fontSize={22}>{name}</Text>
                  </AutoLayout>
                </AutoLayout>
                <AutoLayout
                  width={"fill-parent"}
                  direction={"vertical"}
                  horizontalAlignItems={"end"}
                  spacing={12}
                >
                  <AutoLayout>
                    <Text fontSize={22} fill={"#777"}>
                      {style.fontName.family + " " + style.fontName.style}
                    </Text>
                  </AutoLayout>
                  <AutoLayout spacing={8} verticalAlignItems={"end"}>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontWeight={400}
                      fontSize={24}
                      fill={"#555"}
                    >
                      font-size:
                    </Text>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontWeight={600}
                      fontSize={24}
                    >
                      {style.fontSize + "px"}
                    </Text>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontWeight={400}
                      fontSize={24}
                      fill={"#555"}
                    >
                      |
                    </Text>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontWeight={400}
                      fontSize={24}
                      fill={"#555"}
                    >
                      font-weight:
                    </Text>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontWeight={600}
                      fontSize={24}
                    >
                      {fontWeight}
                    </Text>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontWeight={400}
                      fontSize={24}
                      fill={"#555"}
                    >
                      |
                    </Text>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontWeight={400}
                      fontSize={24}
                      fill={"#555"}
                    >
                      line-height:
                    </Text>
                    <Text
                      fontFamily={"Roboto Slab"}
                      fontSize={24}
                      fontWeight={600}
                    >
                      {formatLineHeight(style.lineHeight)}
                    </Text>
                  </AutoLayout>
                </AutoLayout>
              </AutoLayout>
              <Rectangle width={"fill-parent"} height={1} fill={"#ccc"} />
            </AutoLayout>
          );
        })}
    </AutoLayout>
  );
};

export default TextDesignList;
