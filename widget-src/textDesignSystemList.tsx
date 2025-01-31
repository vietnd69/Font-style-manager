import { textStyleType } from "./code";
import getFontWeightValue from "./hooks/getFontWeightValue";
import type { FontWeightNumerical } from "./hooks/getFontWeightValue";

const { widget } = figma;
const { AutoLayout, Text, Rectangle } = widget;

type TextDesignSystemListType = {
  showStyle: textStyleType[];
  showGroup: string[];
};

const getOnlyName = (name: string) => {
  if (name.includes("/")) {
    const onlyName: string | undefined = name.split("/").pop();
    return onlyName ? onlyName : "";
  } else {
    return name;
  }
};

const TextDesignList = ({ value }: { value: TextDesignSystemListType }) => {
  const { showStyle } = value;
  const styleList = showStyle;

  return (
    <AutoLayout direction={"vertical"} width={"fill-parent"}>
      {styleList.length !== 0 &&
        styleList.map((style: textStyleType, index: number) => {
          return (
            <AutoLayout
              key={index}
              width={"fill-parent"}
              direction={"vertical"}
            >
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
                    fontWeight={
                      getFontWeightValue(style.fontName.style)
                        .fontWeight as FontWeightNumerical
                    }
                  >
                    Ag
                  </Text>
                  <Text fontSize={22}>{getOnlyName(style.name)}</Text>
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
                      {getFontWeightValue(style.fontName.style).fontWeight}
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
                      {style.lineHeight.unit != "AUTO" && style.lineHeight.value
                        ? style.lineHeight.unit === "PIXELS"
                          ? style.lineHeight.value.toString() + "px"
                          : parseFloat(
                              (style.lineHeight.value / 100).toPrecision(3)
                            )
                        : "auto"}
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
