const { widget } = figma;
const { AutoLayout, Text, Rectangle, useSyncedState, Input, SVG, Fragment } =
  widget;

import {
  textStyleType,
  textDesignManagerType,
  checkStyleChanged,
} from "./code";
import CheckBox from "./components/CheckBox";

import getFontWeightValue from "./hooks/getFontWeightValue";

import {
  uploadSvg,
  loadSvg,
  closeSvg,
  warningSvg,
  fontFamilySvg,
  fontStyleSvg,
  fontSizeSvg,
  folderSvg,
  nameSvg,
  listSvg,
  lineHeightSvg,
  letterSpacingSvg,
  variableSvg,
  variableOutlineSvg,
} from "./svg";

/**
 * TextDesignManager Component
 *
 * A component for managing and displaying text design styles in Figma.
 * Provides functionality for:
 * - Viewing and filtering text styles
 * - Applying text styles to selected elements
 * - Managing text style properties like font family, weight, size, etc.
 * - Searching and organizing text styles
 *
 * @param value - Configuration and state for the text design manager
 */
const TextDesignManager = ({ value }: { value: textDesignManagerType }) => {
  const {
    textStyles,
    showUi,
    updateProgressUi,
    getLocalTextStyle,
    setHasReloadLocalFont,
    localFonts,
    cleanFont,
    isOpenSearchBar,
    showEditType,
    localVariableList,
  } = value;
  const [filterStyles, setFilterStyles] = useSyncedState<textStyleType[]>(
    "filterStyles",
    []
  );

  const [searchName, setSearchName] = useSyncedState("searchName", "");
  const [searchGroup, setSearchGroup] = useSyncedState("searchGroup", "");
  const [searchFamily, setSearchFamily] = useSyncedState("searchFamily", "");
  const [searchStyle, setSearchStyle] = useSyncedState("searchStyle", "");
  const [searchFontSize, setSearchFontSize] = useSyncedState(
    "searchFontSize",
    ""
  );
  const [searchLineHeight, setSearchLineHeight] = useSyncedState<
    LineHeight | { unit: "" }
  >("searchLineHeight", {
    unit: "",
  });
  const [searchLetterSpacing, setSearchLetterSpacing] = useSyncedState<
    LetterSpacing | { unit: "" }
  >("searchLetterSpacing", {
    unit: "",
  });

  const [checkedGroup, setCheckedGroup] = useSyncedState("checkedGroup", "");
  const [checkedFamily, setCheckedFamily] = useSyncedState("checkedFamily", "");
  const [checkedStyle, setCheckedStyle] = useSyncedState("checkedStyle", "");
  const [checkedFontSize, setCheckedFontSize] = useSyncedState(
    "checkedFontSize",
    ""
  );
  const [checkedLineHeight, setCheckedLineHeight] = useSyncedState<
    LineHeight | { unit: "" }
  >("checkedLineHeight", {
    unit: "",
  });
  const [checkedLetterSpacing, setCheckedLetterSpacing] = useSyncedState<
    LetterSpacing | { unit: "" }
  >("checkedLetterSpacing", {
    unit: "",
  });

  const [stylesChecked, setStylesChecked] = useSyncedState<string[]>(
    "stylesChecked",
    []
  );
  const [hasCheckAll, setHasCheckAll] = useSyncedState<boolean>(
    "hasCheckAll",
    false
  );

  const [cacheStyle, setCacheStyle] = useSyncedState<textStyleType[]>(
    "cacheStyle",
    []
  );

  const [currentModeID, setCurrentModeID] = useSyncedState<string | undefined>(
    "currentModeID",
    undefined
  );

  // Hàm lấy mode hiện tại
  const getCurrentMode = async () => {
    try {
      // Lấy tất cả collection biến
      const collections =
        await figma.variables.getLocalVariableCollectionsAsync();

      if (collections.length > 0) {
        // Lấy collection đầu tiên hoặc collection đang active
        // Figma API hiện không có hàm để lấy trực tiếp active mode
        const activeCollection = collections[0];

        if (activeCollection.modes.length > 0) {
          // Lấy mode mặc định hoặc mode đầu tiên
          const modeID =
            activeCollection.defaultModeId || activeCollection.modes[0].modeId;
          setCurrentModeID(modeID);
        }
      }
    } catch (error) {
      console.error("Error getting current mode:", error);
    }
  };

  // Gọi hàm lấy current mode khi component được khởi tạo
  if (!currentModeID) {
    getCurrentMode();
  }

  /**
   * Toggle selection state for a specific text style
   * @param id - ID of the text style to toggle
   */
  const handleCheck = (id: string) => {
    // Check if style is already in the selected list
    const hasStyleInList = stylesChecked.find((idStyle) => idStyle === id)
      ? true
      : false;

    if (hasStyleInList) {
      // If already selected, remove it
      if (stylesChecked.length === filterStyles.length) {
        setHasCheckAll(false); // Uncheck "Select All" if was previously all selected
      }
      setStylesChecked((prev) => prev.filter((idStyle) => idStyle !== id));
    } else {
      // If not selected, add it
      if (stylesChecked.length === filterStyles.length - 1) {
        setHasCheckAll(true); // Check "Select All" if this completes the set
      }
      setStylesChecked((prev) => [...prev, id]);
    }
  };

  /**
   * Toggle selection state for all text styles
   * Either selects all styles or deselects all styles
   */
  const handleCheckAll = () => {
    setHasCheckAll((prev) => {
      if (!prev) {
        // If not all selected, select all styles
        setStylesChecked(filterStyles.map((style) => style.id));
      } else {
        // If all selected, clear selection
        setStylesChecked([]);
      }

      return !prev;
    });
  };

  /**
   * Update text styles in Figma based on current state
   * Compares current styles with cached styles to identify changes
   */
  const updateStyle = async (
    setSearchGroup: (value: string) => void,
    setSearchName: (value: string) => void,
    setSearchFamily: (value: string) => void,
    setSearchStyle: (value: string) => void,
    setSearchFontSize: (value: string) => void,
    setCheckedFamily: (value: string) => void,
    setCheckedGroup: (value: string) => void,
    setCheckedStyle: (value: string) => void,
    setCheckedFontSize: (value: string) => void,
    setCheckedLineHeight: (value: LineHeight | { unit: "" }) => void,
    setCheckedLetterSpacing: (value: LetterSpacing | { unit: "" }) => void,
    setFilterStyles: (value: textStyleType[]) => void,
    setCacheStyle: (value: textStyleType[]) => void,
    setStylesChecked: (value: string[]) => void,
    setHasCheckAll: (value: boolean) => void,
    setHasReloadLocalFont: (value: boolean) => void
  ) => {
    const totalStyles = filterStyles.length;
    let updatedCount = 0;

    // Show popup iframe to track progress - only call once
    showUi({
      moduleName: "processing",
      name: "Updating Styles",
      data: {
        message: "Processing...",
        current: 0,
        total: totalStyles,
      },
    });

    for (const style of filterStyles) {
      try {
        // Find the original style in cache for comparison
        const cache = cacheStyle.find((i) => i.id === style.id);
        if (cache) {
          // Get the actual style from Figma
          const textStyle: TextStyle = (await figma.getStyleByIdAsync(
            style.id
          )) as TextStyle;
          let isUpdate = false;
          // console.log(textStyle);
          if (cache.name !== style.name) {
            textStyle.name = cache.name;
            isUpdate = true;
          }
          if (cache.description !== style.description) {
            textStyle.description = cache.description;
            isUpdate = true;
          }
          if (
            cache.fontName.family !== style.fontName.family ||
            cache.fontName.style !== style.fontName.style
          ) {
            await figma.loadFontAsync({ ...cache.fontName }).then(() => {
              textStyle.fontName = { ...cache.fontName };
              isUpdate = true;
            });
          }
          if (cache.fontSize !== style.fontSize) {
            await figma.loadFontAsync({ ...cache.fontName }).then(() => {
              textStyle.fontSize = cache.fontSize;
              isUpdate = true;
            });
          }
          if (cache.lineHeight !== style.lineHeight) {
            await figma.loadFontAsync({ ...cache.fontName }).then(() => {
              textStyle.lineHeight = cache.lineHeight;
              isUpdate = true;
            });
          }
          if (cache.letterSpacing !== style.letterSpacing) {
            await figma.loadFontAsync({ ...cache.fontName }).then(() => {
              textStyle.letterSpacing = cache.letterSpacing;
              isUpdate = true;
            });
          }

          // Bind variables to text style if they exist in boundVariables
          if (cache.boundVariables) {
            await figma.loadFontAsync({ ...cache.fontName }).then(async () => {
              // Xử lý đặc biệt cho fontFamily trước
              const boundVariables = cache.boundVariables; // Tạo biến tạm để tránh lỗi TypeScript

              if (boundVariables && "fontFamily" in boundVariables) {
                try {
                  const variableId = (
                    boundVariables.fontFamily as VariableAlias
                  ).id;
                  const variable =
                    await figma.variables.getVariableByIdAsync(variableId);

                  if (variable) {
                    // Bind fontFamily trước
                    textStyle.setBoundVariable("fontFamily", variable);
                    isUpdate = true;

                    // Kiểm tra xem fontStyle có còn tương thích với fontFamily mới không
                    const fontName = textStyle.fontName; // Lấy fontName cập nhật sau khi bind fontFamily

                    try {
                      await figma.loadFontAsync(fontName);
                    } catch (e) {
                      // fontStyle không tương thích với fontFamily mới
                      // Tìm font style tương tự nhất
                      const fontVariants =
                        await figma.listAvailableFontsAsync();
                      const familyVariants = fontVariants.filter(
                        (font) => font.fontName.family === fontName.family
                      );

                      if (familyVariants.length > 0) {
                        // Tìm font style default hoặc đầu tiên
                        const defaultStyle =
                          familyVariants.find(
                            (font) => font.fontName.style === "Regular"
                          ) || familyVariants[0];

                        // Cập nhật fontStyle
                        textStyle.fontName = defaultStyle.fontName;
                        figma.notify(
                          `Font style "${fontName.style}" không tương thích với font family "${fontName.family}". Đã đổi sang "${defaultStyle.fontName.style}"`
                        );
                      }
                    }
                  }
                } catch (e) {
                  figma.notify(`Failed to bind variable to fontFamily: ${e}`, {
                    error: true,
                  });
                }
              }

              // Sau đó mới xử lý các biến khác
              if (boundVariables) {
                for (const [property, variableAlias] of Object.entries(
                  boundVariables
                )) {
                  // Bỏ qua fontFamily vì đã xử lý ở trên
                  if (property === "fontFamily") continue;

                  if (variableAlias) {
                    // Get the Variable instance from variable ID
                    const variableId = (variableAlias as VariableAlias).id;
                    const variable =
                      await figma.variables.getVariableByIdAsync(variableId);

                    if (variable) {
                      try {
                        // Special case for fontStyle property when variable is a number type (it should be bound to fontWeight)
                        if (
                          property === "fontStyle" &&
                          variable.resolvedType === "FLOAT"
                        ) {
                          // Unbind from fontStyle if it exists
                          textStyle.setBoundVariable("fontStyle", null);
                          // Bind to fontWeight instead
                          textStyle.setBoundVariable("fontWeight", variable);
                        } else {
                          // For all other properties, bind to the correct property
                          textStyle.setBoundVariable(
                            property as VariableBindableTextField,
                            variable
                          );
                        }
                        isUpdate = true;
                      } catch (e) {
                        figma.notify(
                          `Failed to bind variable to ${property}: ${e}`,
                          { error: true }
                        );
                      }
                    }
                  } else if (property) {
                    // If variableAlias is null, unbind the variable
                    try {
                      textStyle.setBoundVariable(
                        property as VariableBindableTextField,
                        null
                      );
                      isUpdate = true;
                    } catch (e) {
                      figma.notify(
                        `Failed to unbind variable from ${property}: ${e}`,
                        { error: true }
                      );
                    }
                  }
                }
              }
            });
          }

          // if (isUpdate) {
          //   figma.notify("✓ " + textStyle.name + "Style has update", {
          //     timeout: 300,
          //   });
          // }
        }
      } catch (err) {
        figma.notify("✕ " + err, { timeout: 3000, error: true });
      }

      // Update progress - use updateProgressUi instead of showUi
      updatedCount++;
      updateProgressUi({
        moduleName: "processing",
        data: {
          message: "Processing...",
          current: updatedCount,
          total: totalStyles,
        },
      });
    }

    // Show completion message - use updateProgressUi
    updateProgressUi({
      moduleName: "processing",
      data: {
        message: "Styles updated",
        current: updatedCount,
        total: totalStyles,
        completed: true,
      },
    });

    // Success notification but don't close popup
    // figma.notify("✓ Styles updated successfully", { timeout: 2000 });

    setSearchGroup("");
    setSearchName("");
    setSearchFamily("");
    setSearchStyle("");
    setSearchFontSize("");
    setCheckedFamily("");
    setCheckedGroup("");
    setCheckedStyle("");
    setCheckedFontSize("");
    setCheckedLineHeight({ unit: "" });
    setCheckedLetterSpacing({ unit: "" });
    setFilterStyles(textStyles);
    setCacheStyle(textStyles);
    setStylesChecked([]);
    setHasCheckAll(false);
    setHasReloadLocalFont(true);
  };

  const handleChangeSelectedStyle = () => {
    console.log(
      "[handleChangeSelectedStyle] Starting to update selected styles"
    );
    console.log(
      `[handleChangeSelectedStyle] Number of selected styles: ${stylesChecked.length}`
    );

    if (stylesChecked.length !== 0) {
      for (const style of stylesChecked) {
        console.log(
          `[handleChangeSelectedStyle] Processing style ID: ${style}`
        );
        const cache = cacheStyle.find((i) => i.id === style) as textStyleType;
        if (cache) {
          console.log(
            `[handleChangeSelectedStyle] Found cache for style: ${cache.name}`
          );
          let hasChanges = false;

          if (checkedGroup != "") {
            console.log(
              `[handleChangeSelectedStyle] Updating group for ${cache.name}: ${checkedGroup}`
            );
            cache.name = checkedGroup + "/" + getNameStyle(cache.name);
            hasChanges = true;
          }
          if (checkedFamily != "") {
            console.log(
              `[handleChangeSelectedStyle] Updating font family for ${cache.name}: ${checkedFamily}`
            );
            cache.fontName = {
              ...cache.fontName,
              family: checkedFamily,
            };
            hasChanges = true;
          }
          if (checkedStyle != "") {
            console.log(
              `[handleChangeSelectedStyle] Updating font style for ${cache.name}: ${checkedStyle}`
            );
            cache.fontName = {
              ...cache.fontName,
              style: checkedStyle,
            };
            hasChanges = true;
          }
          if (checkedFontSize != "" || isNaN(Number(checkedFontSize))) {
            console.log(
              `[handleChangeSelectedStyle] Updating font size for ${cache.name}: ${checkedFontSize}`
            );
            cache.fontSize = Number(checkedFontSize);
            hasChanges = true;
          }
          if (checkedLineHeight.unit != "") {
            console.log(
              `[handleChangeSelectedStyle] Updating line height for ${cache.name}: ${JSON.stringify(checkedLineHeight)}`
            );
            cache.lineHeight = checkedLineHeight;
            hasChanges = true;
          }
          if (checkedLetterSpacing.unit != "") {
            console.log(
              `[handleChangeSelectedStyle] Updating letter spacing for ${cache.name}: ${JSON.stringify(checkedLetterSpacing)}`
            );
            cache.letterSpacing = checkedLetterSpacing;
            hasChanges = true;
          }

          if (hasChanges) {
            console.log(
              `[handleChangeSelectedStyle] Updating cache for style: ${cache.name}`
            );
            setCacheStyle((prev) =>
              prev.map((i) => (i.id === style ? cache : i))
            );
          } else {
            console.log(
              `[handleChangeSelectedStyle] No changes needed for style: ${cache.name}`
            );
          }
        } else {
          console.warn(
            `[handleChangeSelectedStyle] No cache found for style ID: ${style}`
          );
        }
      }
      console.log(
        "[handleChangeSelectedStyle] Finished updating selected styles"
      );
    } else {
      console.log("[handleChangeSelectedStyle] No styles selected");
    }
  };

  const checkFontName = (font: textStyleType) => {
    // Check if fontName.style is a number
    // Only apply check for style, not for family
    if (!isNaN(Number(font.fontName.style))) {
      return { check: false, status: "number" };
    }

    const res = localFonts.filter(
      (fontLocal) => font.fontName.family === fontLocal.fontName.family
    );
    if (res.length !== 0) {
      const style = res.filter(
        (fontLocal) => font.fontName.style === fontLocal.fontName.style
      );
      if (style.length !== 0) {
        return { check: true };
      } else {
        return { check: false, status: "style" };
      }
    } else {
      return { check: false, status: "family" };
    }
  };

  const getNameStyle = (name: string): string => {
    const lastDirectoryPart = name.lastIndexOf("/");

    if (lastDirectoryPart === -1) {
      return name.trim();
    } else {
      const nameStyle = name.slice(lastDirectoryPart + 1);
      return nameStyle.trim();
    }
  };
  const getGroupStyle = (name: string): string => {
    const lastDirectoryPart = name.lastIndexOf("/");

    if (lastDirectoryPart === -1) {
      return "";
    } else {
      const groupStyle = name.slice(0, lastDirectoryPart);
      return groupStyle.trim();
    }
  };

  const findAll = (data: {
    group: string;
    name: string;
    family: string;
    style: string;
    fontSize: number;
    lineHeight: LineHeight | { readonly unit: "" };
    letterSpacing: LetterSpacing | { readonly unit: "" };
  }) => {
    // console.log(data);
    let styles = [...textStyles];
    if (data.group !== "") {
      styles = styles.filter((style) => {
        const regex = new RegExp(data.group, "i");
        const groupStyle = getGroupStyle(style.name);
        return regex.test(groupStyle);
      });
    }

    if (data.name !== "") {
      styles = styles.filter((style) => {
        const regex = new RegExp(data.name, "i");
        const nameStyle = getNameStyle(style.name);
        return regex.test(nameStyle);
      });
    }

    if (data.family !== "") {
      styles = styles.filter((style) => style.fontName.family === data.family);
    }

    if (data.style !== "") {
      styles = styles.filter((style) => style.fontName.style === data.style);
    }

    if (data.fontSize !== 0 || isNaN(data.fontSize)) {
      styles = styles.filter((style) => style.fontSize === data.fontSize);
    }
    if (data.lineHeight.unit !== "") {
      styles = styles.filter((style) => {
        if (data.lineHeight.unit === "AUTO") {
          return style.lineHeight.unit === data.lineHeight.unit;
        } else {
          const checkUnit = style.lineHeight.unit === data.lineHeight.unit;
          const checkValue =
            data.lineHeight.unit !== "" &&
            !!data.lineHeight.value &&
            style.lineHeight.unit !== "AUTO" &&
            !!style.lineHeight.value &&
            parseFloat(style.lineHeight.value?.toPrecision(3).toString()) ===
              parseFloat(data.lineHeight.value.toPrecision(3).toString()) &&
            true;
          return checkUnit && checkValue;
        }
      });
    }
    if (data.letterSpacing.unit !== "") {
      // console.log("run");
      styles = styles.filter((style) => {
        const checkUnit = style.letterSpacing.unit === data.letterSpacing.unit;
        const checkValue =
          "value" in data.letterSpacing && "value" in style.letterSpacing
            ? data.letterSpacing.value === style.letterSpacing.value
            : false;
        return checkUnit && checkValue;
      });
    }

    setFilterStyles(styles);
    setCacheStyle(styles);
    setStylesChecked([]);
    setHasCheckAll(false);
  };

  const clearSearch = () => {
    setSearchGroup("");
    setSearchName("");
    setSearchFamily("");
    setSearchStyle("");
    setSearchFontSize("");
    setSearchLineHeight({ unit: "" });
    setSearchLetterSpacing({ unit: "" });
    setFilterStyles(textStyles);
    setCacheStyle(textStyles);
    setStylesChecked([]);
    setHasCheckAll(false);
  };

  const handleSearch = () => {
    findAll({
      group: searchGroup,
      name: searchName,
      family: searchFamily,
      style: searchStyle,
      fontSize: Number(searchFontSize),
      lineHeight: searchLineHeight,
      letterSpacing: searchLetterSpacing,
    });
  };

  const getLineHeight = (data: string) => {
    const unit =
      data === "auto"
        ? "AUTO"
        : data.endsWith("px")
          ? "PIXELS"
          : data.endsWith("%")
            ? "PERCENT"
            : "";
    const value =
      unit === "AUTO"
        ? { unit: "AUTO" }
        : unit === "PIXELS"
          ? { value: Number(data.replace("px", "")), unit: unit }
          : unit === "PERCENT"
            ? { value: Number(data.replace("%", "")), unit: unit }
            : { unit: "" };
    return value as LineHeight | { unit: "" };
  };

  const getLetterSpacing = (data: string): LetterSpacing | { unit: "" } => {
    if (data === "") {
      return { unit: "" };
    }
    const unit = data.endsWith("px") ? "PIXELS" : "PERCENT";
    const value = Number(data.replace(/[px%]/g, ""));
    return { value, unit } as LetterSpacing;
  };

  const getDataVariable = async (variableId: string) => {
    const data = await figma.variables.getVariableByIdAsync(variableId);
    if (data) {
      const modes = await figma.variables.getVariableCollectionByIdAsync(
        data.variableCollectionId
      );

      if (modes) {
        // Get defaultModeId from collection or first mode
        const defaultModeId = modes.defaultModeId || modes.modes[0]?.modeId;

        // Check if defaultModeId is valid
        if (!defaultModeId) {
          console.warn(`Variable ${variableId} has no valid defaultModeId`);
          return undefined;
        }

        return {
          id: data.id,
          name: data.name,
          key: data.key,
          variableCollectionId: data.variableCollectionId,
          scopes: data.scopes,
          valuesByMode: data.valuesByMode,
          defaultModeId,
        };
      }
    }
    return undefined;
  };

  return (
    <Fragment>
      {/* search bar*/}
      {isOpenSearchBar && (
        <AutoLayout
          spacing={12}
          verticalAlignItems={"end"}
          width={"fill-parent"}
        >
          <AutoLayout
            padding={10}
            verticalAlignItems={"center"}
            horizontalAlignItems={"center"}
            onClick={() => clearSearch()}
            tooltip={"Clear search"}
          >
            <SVG src={closeSvg} />
          </AutoLayout>
          <AutoLayout
            spacing={12}
            width={"fill-parent"}
            verticalAlignItems={"end"}
          >
            <AutoLayout width={466} spacing={12} direction={"vertical"}>
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
                width={"fill-parent"}
              >
                <SVG src={folderSvg} />
                <Input
                  fontSize={22}
                  value={searchGroup}
                  onTextEditEnd={(e) => setSearchGroup(e.characters)}
                  placeholder="Find group style"
                  width={"fill-parent"}
                />
              </AutoLayout>
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
                width={"fill-parent"}
              >
                <SVG src={nameSvg} />
                <Input
                  fontSize={22}
                  value={searchName}
                  onTextEditEnd={(e) => setSearchName(e.characters)}
                  placeholder="Find name style"
                  width={"fill-parent"}
                />
              </AutoLayout>
            </AutoLayout>

            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={"fill-parent"}
            >
              <SVG src={fontFamilySvg} />
              <Input
                fontSize={22}
                value={searchFamily}
                onTextEditEnd={(e) => setSearchFamily(e.characters)}
                placeholder="Find family"
                width={"fill-parent"}
              />
            </AutoLayout>
            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={372}
            >
              <SVG src={fontStyleSvg} />
              <Input
                width={"fill-parent"}
                fontSize={22}
                value={searchStyle}
                onTextEditEnd={(e) => setSearchStyle(e.characters)}
                placeholder="Find style"
              />
            </AutoLayout>
            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={172}
            >
              <SVG src={fontSizeSvg} />
              <Input
                width={"fill-parent"}
                fontSize={22}
                value={searchFontSize}
                onTextEditEnd={(e) => setSearchFontSize(e.characters)}
                placeholder="Find size"
              />
            </AutoLayout>
            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={194}
            >
              <SVG src={lineHeightSvg} />
              <Input
                width={"fill-parent"}
                fontSize={22}
                value={
                  searchLineHeight.unit !== ""
                    ? searchLineHeight.unit !== "AUTO" && searchLineHeight.value
                      ? searchLineHeight.unit === "PIXELS"
                        ? searchLineHeight.value.toString() + "px"
                        : searchLineHeight.value.toString() + "%"
                      : "auto"
                    : ""
                }
                onTextEditEnd={(e) =>
                  setSearchLineHeight(getLineHeight(e.characters))
                }
                placeholder="Line height"
              />
            </AutoLayout>

            {showEditType.letterSpacing && (
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
                width={194}
              >
                <SVG src={letterSpacingSvg} />
                <Input
                  width={"fill-parent"}
                  fontSize={22}
                  value={
                    "value" in searchLetterSpacing
                      ? searchLetterSpacing.unit === "PIXELS"
                        ? searchLetterSpacing.value.toString() + "px"
                        : searchLetterSpacing.value.toString() + "%"
                      : ""
                  }
                  onTextEditEnd={(e) =>
                    setSearchLetterSpacing(getLetterSpacing(e.characters))
                  }
                  placeholder="Letter spacing"
                />
              </AutoLayout>
            )}
          </AutoLayout>

          <AutoLayout
            hoverStyle={{ fill: "#1A7CF0" }}
            onClick={() => handleSearch()}
            width={150}
            padding={{ top: 14, bottom: 14, right: 24, left: 24 }}
            verticalAlignItems={"center"}
            horizontalAlignItems={"center"}
            cornerRadius={12}
            fill={"#0B68D6"}
          >
            <Text fontSize={24} fill={"#fff"}>
              Search
            </Text>
          </AutoLayout>
        </AutoLayout>
      )}
      {stylesChecked?.length !== 0 && (
        <Fragment>
          <AutoLayout
            width={"fill-parent"}
            verticalAlignItems={"center"}
            spacing={24}
            padding={{ top: 12 }}
          >
            <Text fontSize={24}>Change all selected styles</Text>
            <Rectangle width={"fill-parent"} height={1} fill={"#ccc"} />
          </AutoLayout>
          <AutoLayout direction={"vertical"} width={"fill-parent"} spacing={12}>
            <AutoLayout
              spacing={24}
              verticalAlignItems={"center"}
              width={"fill-parent"}
              overflow={"scroll"}
            >
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                width={"fill-parent"}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
              >
                <SVG src={folderSvg} />
                <Input
                  width={"fill-parent"}
                  fontSize={22}
                  value={checkedGroup}
                  onTextEditEnd={(e) => setCheckedGroup(e.characters)}
                  placeholder="Move to group"
                />
              </AutoLayout>
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                width={"fill-parent"}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
              >
                <SVG src={fontFamilySvg} />
                <Input
                  width={"fill-parent"}
                  fontSize={22}
                  value={checkedFamily}
                  onTextEditEnd={(e) => setCheckedFamily(e.characters)}
                  placeholder="Change to font family"
                />
                <SVG
                  src={listSvg}
                  tooltip="Choice font"
                  onClick={() =>
                    showUi({
                      moduleName: "choiceFont",
                      name: "Choice in font list",
                      data: cleanFont,
                    })
                  }
                />
              </AutoLayout>
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                width={"fill-parent"}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
                overflow={"scroll"}
              >
                <SVG src={fontStyleSvg} />
                <Input
                  width={"fill-parent"}
                  fontSize={22}
                  value={checkedStyle}
                  onTextEditEnd={(e) => setCheckedStyle(e.characters)}
                  placeholder="Change to font style"
                />
              </AutoLayout>
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                width={"fill-parent"}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
              >
                <SVG src={fontSizeSvg} />
                <Input
                  width={"fill-parent"}
                  fontSize={22}
                  value={checkedFontSize}
                  onTextEditEnd={(e) => setCheckedFontSize(e.characters)}
                  placeholder="Change to font size"
                />
              </AutoLayout>
              <AutoLayout
                padding={16}
                fill={"#eee"}
                cornerRadius={8}
                width={"fill-parent"}
                spacing={12}
                verticalAlignItems={"end"}
                stroke={"#ccc"}
                strokeWidth={1}
              >
                <SVG src={lineHeightSvg} />
                <Input
                  width={"fill-parent"}
                  fontSize={22}
                  value={
                    checkedLineHeight.unit !== ""
                      ? checkedLineHeight.unit !== "AUTO" &&
                        checkedLineHeight.value
                        ? checkedLineHeight.unit === "PIXELS"
                          ? checkedLineHeight.value.toString() + "px"
                          : checkedLineHeight.value.toString() + "%"
                        : "auto"
                      : ""
                  }
                  onTextEditEnd={(e) =>
                    setCheckedLineHeight(getLineHeight(e.characters))
                  }
                  placeholder="Change line height"
                />
              </AutoLayout>
              {showEditType.letterSpacing && (
                <AutoLayout
                  padding={16}
                  fill={"#eee"}
                  cornerRadius={8}
                  width={"fill-parent"}
                  spacing={12}
                  verticalAlignItems={"end"}
                  stroke={"#ccc"}
                  strokeWidth={1}
                >
                  <SVG src={letterSpacingSvg} />
                  <Input
                    width={"fill-parent"}
                    fontSize={22}
                    value={
                      checkedLetterSpacing.unit !== ""
                        ? checkedLetterSpacing.value &&
                          checkedLetterSpacing.unit === "PIXELS"
                          ? checkedLetterSpacing.value.toString() + "px"
                          : checkedLetterSpacing.value.toString() + "%"
                        : ""
                    }
                    onTextEditEnd={(e) =>
                      setCheckedLetterSpacing(getLetterSpacing(e.characters))
                    }
                    placeholder="Change letter spacing"
                  />
                </AutoLayout>
              )}
              <AutoLayout
                onClick={() => handleChangeSelectedStyle()}
                padding={{
                  top: 14,
                  bottom: 14,
                  right: 24,
                  left: 24,
                }}
                verticalAlignItems={"center"}
                horizontalAlignItems={"center"}
                cornerRadius={12}
                fill={"#0B68D6"}
              >
                <Text fontSize={24} fill={"#fff"}>
                  Change selected
                </Text>
              </AutoLayout>
            </AutoLayout>
            <Text fill={"#F23131"}>
              Warning: If you change the font family, you should check the name
              of font style.
            </Text>
          </AutoLayout>
        </Fragment>
      )}

      <AutoLayout direction={"vertical"} width={"fill-parent"}>
        {/* table title */}
        <AutoLayout
          verticalAlignItems={"center"}
          spacing={12}
          width={"fill-parent"}
          fill={"#333"}
          cornerRadius={{ topLeft: 16, topRight: 16 }}
          padding={{ left: 12, right: 12 }}
        >
          <CheckBox isCheck={hasCheckAll} onClick={() => handleCheckAll()} />
          <Rectangle width={1} height={60} fill={"#ccc"} />
          <Text fontSize={24} fontFamily={"Roboto"} width={450} fill={"#eee"}>
            Name
          </Text>
          <Rectangle width={1} height={60} fill={"#ccc"} />
          <Text
            fontSize={24}
            fontFamily={"Roboto"}
            width={"fill-parent"}
            fill={"#eee"}
          >
            Font family
          </Text>
          <Rectangle width={1} height={60} fill={"#ccc"} />
          <AutoLayout width={360}>
            <Text fontSize={24} fontFamily={"Roboto"} fill={"#ccc"}>
              Style
            </Text>
            <Text
              fontSize={24}
              fontFamily={"Roboto"}
              fill={"#ccc"}
              horizontalAlignText={"right"}
              width={"fill-parent"}
            >
              Weight
            </Text>
          </AutoLayout>
          <Rectangle width={1} height={60} fill={"#ccc"} />
          <Text fontSize={24} width={160} fontFamily={"Roboto"} fill={"#ccc"}>
            Size
          </Text>
          <Rectangle width={1} height={60} fill={"#ccc"} />
          <AutoLayout width={180}>
            <Text fontSize={24} fontFamily={"Roboto"} fill={"#ccc"}>
              Line height
            </Text>
          </AutoLayout>
          {showEditType.letterSpacing && (
            <>
              <Rectangle width={1} height={60} fill={"#ccc"} />
              <AutoLayout width={180}>
                <Text fontSize={24} fontFamily={"Roboto"} fill={"#ccc"}>
                  Letter spacing
                </Text>
              </AutoLayout>
            </>
          )}
          {showEditType.description && (
            <>
              <Rectangle width={1} height={60} fill={"#ccc"} />
              <Text
                fontSize={24}
                fontFamily={"Roboto"}
                width={"fill-parent"}
                fill={"#eee"}
              >
                Description
              </Text>
            </>
          )}
        </AutoLayout>

        {/* table content */}
        <AutoLayout direction={"vertical"} spacing={0} width={"fill-parent"}>
          {filterStyles.length !== 0 &&
          cacheStyle.length !== 0 &&
          cacheStyle.length === filterStyles.length ? (
            filterStyles.map((style) => {
              // console.log(style)
              const cache = cacheStyle.find(
                (i) => i.id === style.id
              ) as textStyleType;
              const check = checkFontName(cache);
              // console.log(cache);
              return (
                <AutoLayout
                  key={style.id}
                  width={"fill-parent"}
                  direction={"vertical"}
                >
                  {/* Checkbox */}
                  <AutoLayout
                    verticalAlignItems={"center"}
                    spacing={12}
                    width={"fill-parent"}
                    padding={{ left: 12, right: 12 }}
                  >
                    <CheckBox
                      isCheck={
                        stylesChecked.find((id) => id === style.id)
                          ? true
                          : false
                      }
                      onClick={() => handleCheck(style.id)}
                    />
                    {/* style name */}
                    <Rectangle width={1} height={50} fill={"#ccc"} />
                    <Text
                      fontSize={22}
                      fontFamily={"Roboto"}
                      width={450}
                      fill={"#000000"}
                    >
                      {cache.name}
                    </Text>
                    {/* font family */}
                    <Rectangle width={1} height={50} fill={"#ccc"} />
                    <AutoLayout
                      width={"fill-parent"}
                      verticalAlignItems={"center"}
                      spacing={8}
                      cornerRadius={
                        cache.boundVariables?.fontFamily !== undefined ? 8 : 0
                      }
                      fill={
                        cache.boundVariables?.fontFamily !== undefined
                          ? "#eeeeee"
                          : "#ffffff00"
                      }
                      padding={{ vertical: 6, horizontal: 10 }}
                    >
                      {cache.boundVariables?.fontFamily !== undefined && (
                        <SVG src={variableSvg} />
                      )}
                      {!check.check && check.status === "family" && (
                        <SVG
                          src={warningSvg}
                          tooltip="Font family does not exist in the system"
                        />
                      )}
                      <Input
                        value={cache.fontName.family}
                        onTextEditEnd={(e) => {
                          setCacheStyle((prev) =>
                            prev.map((i) => {
                              if (i.id === style.id) {
                                const newBoundVariables = i.boundVariables
                                  ? { ...i.boundVariables }
                                  : undefined;

                                if (
                                  newBoundVariables &&
                                  "fontFamily" in newBoundVariables
                                ) {
                                  delete newBoundVariables.fontFamily;
                                }

                                return {
                                  ...i,
                                  fontName: {
                                    ...i.fontName,
                                    family: e.characters,
                                  },
                                  boundVariables: newBoundVariables,
                                };
                              }
                              return i;
                            })
                          );
                        }}
                        fontSize={22}
                        fontFamily={"Roboto"}
                        width={"fill-parent"}
                        fill={
                          checkStyleChanged(cache, style, {
                            variables: localVariableList || [],
                            currentMode: currentModeID,
                          }).fontFamily
                            ? "#0B68D6"
                            : "#000000"
                        }
                      />
                    </AutoLayout>
                    {/* Font weight */}
                    <Rectangle width={1} height={50} fill={"#ccc"} />
                    <AutoLayout
                      width={360}
                      verticalAlignItems={"center"}
                      spacing={8}
                      cornerRadius={
                        cache.boundVariables?.fontStyle !== undefined ||
                        cache.boundVariables?.fontWeight !== undefined
                          ? 8
                          : 0
                      }
                      fill={
                        cache.boundVariables?.fontStyle !== undefined ||
                        cache.boundVariables?.fontWeight !== undefined
                          ? "#eeeeee"
                          : "#ffffff00"
                      }
                      padding={{ vertical: 6, horizontal: 10 }}
                    >
                      {(cache.boundVariables?.fontStyle !== undefined ||
                        cache.boundVariables?.fontWeight !== undefined) && (
                        <SVG src={variableSvg} />
                      )}
                      {!check.check &&
                        (check.status === "style" ||
                          check.status === "number") && (
                          <SVG
                            src={warningSvg}
                            tooltip={
                              check.status === "style"
                                ? "Font style does not exist for this font family"
                                : "Numerical font weight is not supported, please use font style names (Regular, Bold, Medium,...)"
                            }
                          />
                        )}
                      <Input
                        value={cache.fontName.style}
                        onTextEditEnd={(e) => {
                          setCacheStyle((prev) =>
                            prev.map((i) => {
                              if (i.id === style.id) {
                                const newBoundVariables = i.boundVariables
                                  ? { ...i.boundVariables }
                                  : undefined;

                                if (newBoundVariables) {
                                  if ("fontStyle" in newBoundVariables) {
                                    delete newBoundVariables.fontStyle;
                                  }
                                  if ("fontWeight" in newBoundVariables) {
                                    delete newBoundVariables.fontWeight;
                                  }
                                }

                                return {
                                  ...i,
                                  fontName: {
                                    ...i.fontName,
                                    style: e.characters,
                                  },
                                  boundVariables: newBoundVariables,
                                };
                              }
                              return i;
                            })
                          );
                        }}
                        fontSize={22}
                        fontFamily={"Roboto"}
                        width={"fill-parent"}
                        fill={
                          checkStyleChanged(cache, style, {
                            variables: localVariableList || [],
                            currentMode: currentModeID,
                          }).fontStyle
                            ? "#0B68D6"
                            : "#000000"
                        }
                      />
                      <Text
                        fontSize={20}
                        fill={"#666"}
                        fontFamily={"Roboto"}
                        horizontalAlignText={"right"}
                      >
                        {getFontWeightValue(cache.fontName.style).fontWeight}
                      </Text>
                      <SVG
                        src={variableOutlineSvg}
                        tooltip="Choice variable"
                        onClick={() =>
                          showUi({
                            moduleName: "choiceVariable",
                            name: "Choice variable",
                            data: {
                              type: "fontStyle",
                              id: style.id,
                              value: cache.fontName.style,
                              variables: localVariableList || [],
                            },
                          })
                        }
                      />
                    </AutoLayout>
                    {/* Font size */}
                    <Rectangle width={1} height={50} fill={"#ccc"} />
                    <AutoLayout
                      width={160}
                      verticalAlignItems={"center"}
                      spacing={8}
                      cornerRadius={
                        cache.boundVariables?.fontSize !== undefined ? 8 : 0
                      }
                      fill={
                        cache.boundVariables?.fontSize !== undefined
                          ? "#eeeeee"
                          : "#ffffff00"
                      }
                      padding={{ vertical: 6, horizontal: 10 }}
                    >
                      {cache.boundVariables?.fontSize !== undefined && (
                        <SVG src={variableSvg} />
                      )}
                      <Input
                        value={cache.fontSize.toString()}
                        onTextEditEnd={(e) => {
                          setCacheStyle((prev) =>
                            prev.map((i) => {
                              if (i.id === style.id) {
                                const newBoundVariables = i.boundVariables
                                  ? { ...i.boundVariables }
                                  : undefined;

                                if (
                                  newBoundVariables &&
                                  "fontSize" in newBoundVariables
                                ) {
                                  delete newBoundVariables.fontSize;
                                }

                                return {
                                  ...i,
                                  fontSize: Number(e.characters),
                                  boundVariables: newBoundVariables,
                                };
                              }
                              return i;
                            })
                          );
                        }}
                        placeholder="Type size"
                        fontSize={22}
                        fontFamily={"Roboto"}
                        width={"fill-parent"}
                        fill={
                          checkStyleChanged(cache, style, {
                            variables: localVariableList || [],
                            currentMode: currentModeID,
                          }).fontSize
                            ? "#0B68D6"
                            : "#000000"
                        }
                      />
                    </AutoLayout>
                    {/* Line height */}
                    <Rectangle width={1} height={50} fill={"#ccc"} />
                    <AutoLayout
                      width={180}
                      verticalAlignItems={"center"}
                      spacing={8}
                      cornerRadius={
                        cache.boundVariables?.lineHeight !== undefined ? 8 : 0
                      }
                      fill={
                        cache.boundVariables?.lineHeight !== undefined
                          ? "#eeeeee"
                          : "#ffffff00"
                      }
                      padding={{ vertical: 6, horizontal: 10 }}
                    >
                      {cache.boundVariables?.lineHeight !== undefined && (
                        <SVG src={variableSvg} />
                      )}
                      <Input
                        value={
                          cache.lineHeight.unit !== "AUTO" &&
                          cache.lineHeight.value
                            ? cache.lineHeight.unit === "PIXELS"
                              ? cache.lineHeight.value.toString() + "px"
                              : parseFloat(
                                  cache.lineHeight.value
                                    .toPrecision(3)
                                    .toString()
                                ) + "%"
                            : "auto"
                        }
                        onTextEditEnd={(e) => {
                          const data = e.characters
                            .replaceAll(" ", "")
                            .toLowerCase();
                          const value = getLineHeight(data);

                          if (value.unit !== "") {
                            setCacheStyle((prev) =>
                              prev.map((i) =>
                                i.id === style.id
                                  ? {
                                      ...i,
                                      lineHeight: {
                                        ...value,
                                      },
                                    }
                                  : i
                              )
                            );
                          }
                        }}
                        fontSize={22}
                        fontFamily={"Roboto"}
                        width={"fill-parent"}
                        fill={
                          checkStyleChanged(cache, style, {
                            variables: localVariableList || [],
                            currentMode: currentModeID,
                          }).lineHeight
                            ? "#0B68D6"
                            : "#000000"
                        }
                      />
                      <Text
                        fontSize={20}
                        fill={"#666"}
                        fontFamily={"Roboto"}
                        horizontalAlignText={"right"}
                      >
                        {cache.lineHeight.unit !== "AUTO" &&
                        cache.lineHeight.value
                          ? cache.lineHeight.unit === "PERCENT"
                            ? parseFloat(
                                (cache.lineHeight.value / 100).toPrecision(3)
                              )
                            : ""
                          : ""}
                      </Text>
                    </AutoLayout>

                    {/* Letter spacing */}
                    {showEditType.letterSpacing && (
                      <>
                        <Rectangle width={1} height={50} fill={"#ccc"} />
                        <AutoLayout
                          width={180}
                          verticalAlignItems={"center"}
                          spacing={8}
                          cornerRadius={
                            cache.boundVariables?.letterSpacing !== undefined
                              ? 8
                              : 0
                          }
                          fill={
                            cache.boundVariables?.letterSpacing !== undefined
                              ? "#eeeeee"
                              : "#ffffff00"
                          }
                          padding={{ vertical: 6, horizontal: 10 }}
                        >
                          {cache.boundVariables?.letterSpacing !==
                            undefined && <SVG src={variableSvg} />}
                          <Input
                            value={
                              cache.letterSpacing.unit === "PIXELS"
                                ? cache.letterSpacing.value.toString() + "px"
                                : parseFloat(
                                    cache.letterSpacing.value
                                      .toPrecision(3)
                                      .toString()
                                  ) + "%"
                            }
                            onTextEditEnd={(e) => {
                              const data = e.characters
                                .replaceAll(" ", "")
                                .toLowerCase();
                              const value = getLetterSpacing(data);

                              if (value.unit !== "") {
                                setCacheStyle((prev) =>
                                  prev.map((i) =>
                                    i.id === style.id
                                      ? {
                                          ...i,
                                          letterSpacing: {
                                            ...value,
                                          },
                                        }
                                      : i
                                  )
                                );
                              }
                            }}
                            fontSize={22}
                            fontFamily={"Roboto"}
                            width={"fill-parent"}
                            fill={
                              checkStyleChanged(cache, style, {
                                variables: localVariableList || [],
                                currentMode: currentModeID,
                              }).letterSpacing
                                ? "#0B68D6"
                                : "#000000"
                            }
                          />
                        </AutoLayout>
                      </>
                    )}
                    {/* Description */}
                    {showEditType.description && (
                      <>
                        <Rectangle width={1} height={50} fill={"#ccc"} />
                        <Input
                          value={cache.description}
                          onTextEditEnd={(e) => {
                            setCacheStyle((prev) =>
                              prev.map((i: textStyleType) =>
                                i.id === style.id
                                  ? {
                                      ...i,
                                      description: e.characters,
                                    }
                                  : i
                              )
                            );
                          }}
                          placeholder="Type description"
                          fontSize={22}
                          fontFamily={"Roboto"}
                          width={"fill-parent"}
                          fill={
                            checkStyleChanged(cache, style, {
                              variables: localVariableList || [],
                              currentMode: currentModeID,
                            }).description
                              ? "#0B68D6"
                              : "#000000"
                          }
                        />
                      </>
                    )}
                  </AutoLayout>
                  <Rectangle width={"fill-parent"} height={1} fill={"#ccc"} />
                </AutoLayout>
              );
            })
          ) : (
            <Text
              fontSize={20}
              width={"fill-parent"}
              height={40}
              horizontalAlignText={"center"}
              verticalAlignText={"center"}
            >
              No style
            </Text>
          )}
        </AutoLayout>
      </AutoLayout>
      {/* bottom button */}
      <AutoLayout spacing={"auto"} width={"fill-parent"}>
        {/* Left button */}
        <AutoLayout
          padding={24}
          fill={"#333"}
          cornerRadius={12}
          onClick={() => getLocalTextStyle()}
          spacing={16}
          hoverStyle={{ fill: "#4A4A4A" }}
        >
          <SVG src={loadSvg} />
          <Text fontSize={26} fill={"#fff"} horizontalAlignText={"center"}>
            {textStyles.length === 0
              ? "Load local text styles"
              : "Reload local text styles"}
          </Text>
        </AutoLayout>
        {/* Right button */}
        <AutoLayout
          padding={24}
          fill={"#0B68D6"}
          cornerRadius={12}
          onClick={() =>
            updateStyle(
              setSearchGroup,
              setSearchName,
              setSearchFamily,
              setSearchStyle,
              setSearchFontSize,
              setCheckedFamily,
              setCheckedGroup,
              setCheckedStyle,
              setCheckedFontSize,
              setCheckedLineHeight,
              setCheckedLetterSpacing,
              setFilterStyles,
              setCacheStyle,
              setStylesChecked,
              setHasCheckAll,
              setHasReloadLocalFont
            )
          }
          spacing={16}
          hoverStyle={{ fill: "#1A7CF0" }}
        >
          <SVG src={uploadSvg} />
          <Text fontSize={26} fill={"#fff"} horizontalAlignText={"center"}>
            Update styles
          </Text>
        </AutoLayout>
      </AutoLayout>
    </Fragment>
  );
};

export default TextDesignManager;
