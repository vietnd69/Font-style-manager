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

// Tạo một interface hoặc type cho checkedFamily
type CheckedFamilyType = {
  value: string;
  type: "string" | "variable";
  variableId?: string;
};

// Tạo một interface hoặc type cho checkedStyle tương tự như CheckedFamilyType
type CheckedStyleType = {
  value: string | number;
  type: "string" | "variable";
  variableId?: string;
  valueTypes?: ("string" | "number")[];
};

// Tạo một interface hoặc type cho checkedFontSize tương tự như CheckedFamilyType
type CheckedFontSizeType = {
  value: string;
  type: "string" | "variable";
  variableId?: string;
};

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
    currentModeID,
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


  const [checkedFamily, setCheckedFamily] = useSyncedState<CheckedFamilyType>("checkedFamily", {
    value: "",
    type: "string",
    variableId: undefined
  });
  const [checkedStyle, setCheckedStyle] = useSyncedState<CheckedStyleType>("checkedStyle", {
    value: "",
    type: "string",
    variableId: undefined,
    valueTypes: ["string", "number"]
  });
  const [checkedFontSize, setCheckedFontSize] = useSyncedState<CheckedFontSizeType>("checkedFontSize", {
    value: "",
    type: "string",
    variableId: undefined
  });
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

  /**
   * Toggle selection state for a specific text style
   * @param id - ID of the text style to toggle
   */
  const handleCheck = (id: string) => {
    const hasStyleInList = stylesChecked.includes(id);

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
      const newValue = !prev;
      setStylesChecked(newValue ? filterStyles.map((style) => style.id) : []);
      return newValue;
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
    setCheckedFamily: (value: CheckedFamilyType | ((currValue: CheckedFamilyType) => CheckedFamilyType)) => void,
    setCheckedStyle: (value: CheckedStyleType | ((currValue: CheckedStyleType) => CheckedStyleType)) => void,
    setCheckedFontSize: (value: CheckedFontSizeType | ((currValue: CheckedFontSizeType) => CheckedFontSizeType)) => void,
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

          // Kiểm tra và unbind các biến đã bị xóa (chuyển từ variable sang giá trị thông thường)
          if (textStyle.boundVariables) {
            // Tìm các biến có trong textStyle (style gốc từ Figma) nhưng không có trong cache (style đã sửa)
            // Đây là các biến đã bị người dùng xóa và cần unbind
            for (const [property, _] of Object.entries(
              textStyle.boundVariables
            )) {
              if (
                !cache.boundVariables ||
                !(property in cache.boundVariables)
              ) {
                try {
                  // Biến đã bị xóa trong cache, unbind nó từ textStyle
                  console.log(
                    `Unbinding variable for ${property} as it was removed in the updated style`
                  );
                  textStyle.setBoundVariable(
                    property as VariableBindableTextField,
                    null
                  );
                  isUpdate = true;

                  // Cập nhật giá trị mới từ cache sau khi unbind
                  if (property === "fontFamily") {
                    await figma.loadFontAsync({
                      family: cache.fontName.family,
                      style: cache.fontName.style,
                    });
                    textStyle.fontName = { ...cache.fontName };
                  } else if (
                    property === "fontStyle" ||
                    property === "fontWeight"
                  ) {
                    await figma.loadFontAsync({
                      family: cache.fontName.family,
                      style: cache.fontName.style,
                    });
                    textStyle.fontName = { ...cache.fontName };
                  } else if (property === "fontSize") {
                    textStyle.fontSize = cache.fontSize;
                  } else if (property === "lineHeight") {
                    textStyle.lineHeight = cache.lineHeight;
                  } else if (property === "letterSpacing") {
                    textStyle.letterSpacing = cache.letterSpacing;
                  }
                } catch (e) {
                  figma.notify(
                    `Failed to unbind variable from ${property}: ${e}`,
                    { error: true }
                  );
                }
              }
            }
          }

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
    setCheckedFamily({
      value: "",
      type: "string",
      variableId: undefined
    });
    setCheckedStyle({
      value: "",
      type: "string",
      variableId: undefined,
      valueTypes: ["string", "number"]
    });
    setCheckedFontSize({
      value: "",
      type: "string",
      variableId: undefined
    });
    setCheckedLineHeight({ unit: "" });
    setCheckedLetterSpacing({ unit: "" });
    setFilterStyles(textStyles);
    setCacheStyle(textStyles);
    setStylesChecked([]);
    setHasCheckAll(false);
    setHasReloadLocalFont(true);
  };

  // Helper để xử lý các biến liên quan đến font
  const handleFontVariableBinding = (
    cache: textStyleType,
    variableId: string | undefined,
    propertyType: string
  ) => {
    if (!variableId) return cache;
    
    // Tìm biến trong danh sách
    const variableToApply = localVariableList.find(
      (variable) => variable.id === variableId
    );
    
    if (!variableToApply || !variableToApply.defaultModeId) return cache;
    
    // Lấy giá trị biến từ mode mặc định
    const variableValue = variableToApply.valuesByMode[variableToApply.defaultModeId];
    const updatedCache = { ...cache };
    
    // Gán variable vào boundVariables
    const newBoundVariables = updatedCache.boundVariables || {};
    newBoundVariables[propertyType] = {
      type: "VARIABLE_ALIAS",
      id: variableId
    };
    updatedCache.boundVariables = newBoundVariables;
    
    return updatedCache;
  };
  
  // Helper để xóa biến khỏi cache
  const removeVariableFromCache = (cache: textStyleType, propertyTypes: string[]) => {
    if (!cache.boundVariables) return cache;
    
    const newBoundVariables = { ...cache.boundVariables };
    
    propertyTypes.forEach(propertyType => {
      if (propertyType in newBoundVariables) {
        delete newBoundVariables[propertyType];
      }
    });
    
    return {
      ...cache,
      boundVariables: Object.keys(newBoundVariables).length > 0 ? newBoundVariables : undefined
    };
  };

  const handleChangeSelectedStyle = () => {
    console.log("[handleChangeSelectedStyle] Starting to update selected styles");
    console.log(`[handleChangeSelectedStyle] Number of selected styles: ${stylesChecked.length}`);

    if (stylesChecked.length === 0) {
      console.log("[handleChangeSelectedStyle] No styles selected");
      return;
    }

    for (const styleId of stylesChecked) {
      console.log(`[handleChangeSelectedStyle] Processing style ID: ${styleId}`);
      const cache = cacheStyle.find((i) => i.id === styleId) as textStyleType;
      
      if (!cache) {
        console.warn(`[handleChangeSelectedStyle] No cache found for style ID: ${styleId}`);
        continue;
      }
      
      console.log(`[handleChangeSelectedStyle] Found cache for style: ${cache.name}`);
      let updatedCache = { ...cache };
      let hasChanges = false;

      // Xử lý font family
      if (checkedFamily.value !== "") {
        console.log(`[handleChangeSelectedStyle] Updating font family for ${cache.name}: ${checkedFamily.value}`);
        
        // Xóa biến cũ nếu có
        updatedCache = removeVariableFromCache(updatedCache, ["fontFamily"]);
        
        if (checkedFamily.type === "variable" && checkedFamily.variableId) {
          // Xử lý biến font family
          updatedCache = handleFontVariableBinding(updatedCache, checkedFamily.variableId, "fontFamily");
          
          // Cập nhật giá trị trực tiếp của fontName.family từ biến để hiển thị đúng
          const variableToApply = localVariableList.find(v => v.id === checkedFamily.variableId);
          if (variableToApply && variableToApply.defaultModeId) {
            const value = variableToApply.valuesByMode[variableToApply.defaultModeId];
            if (typeof value === "string") {
              updatedCache.fontName = {
                ...updatedCache.fontName,
                family: value
              };
            }
          }
        } else {
          // Cập nhật trực tiếp
          updatedCache.fontName = {
            ...updatedCache.fontName,
            family: checkedFamily.value
          };
        }
        hasChanges = true;
      }

      // Xử lý font style
      if (checkedStyle.value !== "") {
        console.log(`[handleChangeSelectedStyle] Updating font style for ${cache.name}: ${checkedStyle.value} (type: ${checkedStyle.type})`);
        
        // Xóa biến cũ nếu có
        updatedCache = removeVariableFromCache(updatedCache, ["fontStyle", "fontWeight"]);
        
        if (checkedStyle.type === "variable" && checkedStyle.variableId) {
          // Xác định trường variable phù hợp (fontStyle hoặc fontWeight)
          const fieldType = typeof checkedStyle.value === 'number' ? 'fontWeight' : 'fontStyle';
          
          // Xử lý biến font style
          updatedCache = handleFontVariableBinding(updatedCache, checkedStyle.variableId, fieldType);
          
          // Cập nhật giá trị hiển thị trực tiếp
          const variableToApply = localVariableList.find(v => v.id === checkedStyle.variableId);
          if (variableToApply && variableToApply.defaultModeId) {
            const value = variableToApply.valuesByMode[variableToApply.defaultModeId];
            
            if (typeof value === "string") {
              updatedCache.fontName = {
                ...updatedCache.fontName,
                style: value
              };
            } 
            else if (typeof value === "number") {
              // Phân tích style hiện tại để xác định đặc tính
              const currentStyle = updatedCache.fontName.style;
              const isCurrentCondensed = currentStyle.toLowerCase().includes('condensed');
              const isCurrentItalic = currentStyle.toLowerCase().includes('italic');
              
              console.log(`[handleChangeSelectedStyle] Analyzing current style: ${currentStyle}`);
              console.log(`[handleChangeSelectedStyle] Is condensed: ${isCurrentCondensed}, Is italic: ${isCurrentItalic}`);
              
              // Lấy danh sách styles của font hiện tại
              const fontStyles = localFonts
                .filter(font => font.fontName.family === updatedCache.fontName.family)
                .map(font => font.fontName.style);
              
              console.log(`[handleChangeSelectedStyle] Available styles for ${updatedCache.fontName.family}:`, fontStyles);
              
              // Tạo danh sách các style phù hợp với weight mới
              const matchingStyles = fontStyles.map(fontStyle => {
                const weightInfo = getFontWeightValue(fontStyle);
                const isCondensed = fontStyle.toLowerCase().includes('condensed');
                const isItalic = fontStyle.toLowerCase().includes('italic');
                
                // Tính điểm phù hợp dựa vào các đặc tính
                let matchScore = 0;
                
                // +100 điểm nếu weight CHÍNH XÁC
                if (weightInfo.fontWeight === value) {
                  matchScore += 100;
                } else if (weightInfo.fontWeight !== undefined) {
                  // +50 điểm trừ đi độ chênh lệch nếu weight KHÔNG chính xác
                  matchScore += 50 - Math.abs(weightInfo.fontWeight - (value as number))/10;
                }
                
                // +200 điểm nếu các đặc tính khác GIỐNG NHAU (giữ nguyên condensed/không condensed)
                if (isCondensed === isCurrentCondensed) {
                  matchScore += 200;
                }
                
                // +50 điểm nếu giữ đặc tính italic
                if (isItalic === isCurrentItalic) {
                  matchScore += 50;
                }
                
                return {
                  styleName: fontStyle,
                  score: matchScore,
                  weight: weightInfo.fontWeight || 400
                };
              })
              .filter(item => item.weight !== undefined)
              .sort((a, b) => b.score - a.score); // Sắp xếp theo điểm cao nhất
              
              console.log(`[handleChangeSelectedStyle] Matching styles with scores:`, matchingStyles);
              
              // Chọn style có điểm cao nhất
              const bestStyleMatch = matchingStyles.length > 0 ? matchingStyles[0].styleName : "Regular";
              
              console.log(`[handleChangeSelectedStyle] Selected best style match: ${bestStyleMatch}`);
              
              updatedCache.fontName = {
                ...updatedCache.fontName,
                style: bestStyleMatch
              };
            }
          }
        } else {
          // Cập nhật trực tiếp
          if (typeof checkedStyle.value === 'number') {
            // Xử lý trường hợp weight là số, cần tìm style phù hợp
            const currentStyle = updatedCache.fontName.style;
            const isCurrentCondensed = currentStyle.toLowerCase().includes('condensed');
            const isCurrentItalic = currentStyle.toLowerCase().includes('italic');
            
            console.log(`[handleChangeSelectedStyle] Direct update with weight value: ${checkedStyle.value}`);
            console.log(`[handleChangeSelectedStyle] Current style: ${currentStyle}`);
            console.log(`[handleChangeSelectedStyle] Is condensed: ${isCurrentCondensed}, Is italic: ${isCurrentItalic}`);
            
            // Lấy danh sách styles của font hiện tại
            const fontStyles = localFonts
              .filter(font => font.fontName.family === updatedCache.fontName.family)
              .map(font => font.fontName.style);
            
            // Tạo danh sách các style phù hợp với weight mới
            const matchingStyles = fontStyles.map(fontStyle => {
              const weightInfo = getFontWeightValue(fontStyle);
              const isCondensed = fontStyle.toLowerCase().includes('condensed');
              const isItalic = fontStyle.toLowerCase().includes('italic');
              
              // Tính điểm phù hợp dựa vào các đặc tính
              let matchScore = 0;
              
              // +100 điểm nếu weight CHÍNH XÁC
              if (weightInfo.fontWeight === checkedStyle.value) {
                matchScore += 100;
              } else if (weightInfo.fontWeight !== undefined) {
                // +50 điểm trừ đi độ chênh lệch nếu weight KHÔNG chính xác
                matchScore += 50 - Math.abs(weightInfo.fontWeight - (checkedStyle.value as number))/10;
              }
              
              // +200 điểm nếu các đặc tính khác GIỐNG NHAU (giữ nguyên condensed/không condensed)
              if (isCondensed === isCurrentCondensed) {
                matchScore += 200;
              }
              
              // +50 điểm nếu giữ đặc tính italic
              if (isItalic === isCurrentItalic) {
                matchScore += 50;
              }
              
              return {
                styleName: fontStyle,
                score: matchScore,
                weight: weightInfo.fontWeight || 400
              };
            })
            .filter(item => item.weight !== undefined)
            .sort((a, b) => b.score - a.score); // Sắp xếp theo điểm cao nhất
            
            console.log(`[handleChangeSelectedStyle] Matching styles with scores:`, matchingStyles);
            
            // Chọn style có điểm cao nhất
            const bestStyleMatch = matchingStyles.length > 0 ? matchingStyles[0].styleName : "Regular";
            
            console.log(`[handleChangeSelectedStyle] Selected best style match: ${bestStyleMatch}`);
            
            updatedCache.fontName = {
              ...updatedCache.fontName,
              style: bestStyleMatch
            };
          } else {
            // Trường hợp style là chuỗi, cập nhật trực tiếp
            updatedCache.fontName = {
              ...updatedCache.fontName,
              style: checkedStyle.value as string
            };
          }
        }
        hasChanges = true;
      }

      // Xử lý font size
      if (checkedFontSize.value !== "" && !isNaN(Number(checkedFontSize.value))) {
        console.log(`[handleChangeSelectedStyle] Updating font size for ${cache.name}: ${checkedFontSize.value}`);
        
        // Xóa biến cũ nếu có
        updatedCache = removeVariableFromCache(updatedCache, ["fontSize"]);
        
        if (checkedFontSize.type === "variable" && checkedFontSize.variableId) {
          // Xử lý biến font size
          updatedCache = handleFontVariableBinding(updatedCache, checkedFontSize.variableId, "fontSize");
          
          // Cập nhật giá trị hiển thị trực tiếp
          const variableToApply = localVariableList.find(v => v.id === checkedFontSize.variableId);
          if (variableToApply && variableToApply.defaultModeId) {
            const value = variableToApply.valuesByMode[variableToApply.defaultModeId];
            if (typeof value === "number") {
              updatedCache.fontSize = value;
            }
          }
        } else {
          // Cập nhật trực tiếp
          updatedCache.fontSize = Number(checkedFontSize.value);
        }
        hasChanges = true;
      }

      // Xử lý lineHeight
      if (checkedLineHeight.unit !== "") {
        console.log(`[handleChangeSelectedStyle] Updating line height for ${cache.name}: ${JSON.stringify(checkedLineHeight)}`);
        
        // Xóa biến cũ nếu có
        updatedCache = removeVariableFromCache(updatedCache, ["lineHeight"]);
        
        // Cập nhật giá trị trực tiếp
        updatedCache.lineHeight = checkedLineHeight;
        hasChanges = true;
      }

      // Xử lý letterSpacing
      if (checkedLetterSpacing.unit !== "") {
        console.log(`[handleChangeSelectedStyle] Updating letter spacing for ${cache.name}: ${JSON.stringify(checkedLetterSpacing)}`);
        
        // Xóa biến cũ nếu có
        updatedCache = removeVariableFromCache(updatedCache, ["letterSpacing"]);
        
        // Cập nhật giá trị trực tiếp
        updatedCache.letterSpacing = checkedLetterSpacing;
        hasChanges = true;
      }

      // Cập nhật cache nếu có thay đổi
      if (hasChanges) {
        console.log(`[handleChangeSelectedStyle] Updating cache for style: ${cache.name}`);
        setCacheStyle((prev) => prev.map((i) => (i.id === styleId ? updatedCache : i)));
      } else {
        console.log(`[handleChangeSelectedStyle] No changes needed for style: ${cache.name}`);
      }
    }
    
    console.log("[handleChangeSelectedStyle] Finished updating selected styles");
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

  /**
   * Extract name part from a style's full name
   * e.g., "Heading/H1" returns "H1"
   */
  const getNameStyle = (name: string): string => {
    return name.includes("/") ? name.split("/").pop() || "" : name;
  };

  /**
   * Extract group part from a style's full name
   * e.g., "Heading/H1" returns "Heading"
   */
  const getGroupStyle = (name: string): string => {
    return name.includes("/") 
      ? name.substring(0, name.lastIndexOf("/")) 
      : "";
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


  return (
    <Fragment>
      {/* search bar*/}
      {isOpenSearchBar && (
        <AutoLayout
          spacing={12}
          verticalAlignItems={"end"}
          width={"fill-parent"}
        >
          {/* clear search */}
          <AutoLayout
            padding={10}
            verticalAlignItems={"center"}
            horizontalAlignItems={"center"}
            onClick={() => clearSearch()}
            tooltip={"Clear search"}
          >
            <SVG src={closeSvg} />
            </AutoLayout>
          {/* search content */}
          <AutoLayout
            spacing={12}
            width={"fill-parent"}
            verticalAlignItems={"end"}
          >
            {/* search group */}
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
              {/* search name */}
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
            {/* search family */}
            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={321}
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
            {/* search style */}
            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={363}
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
            {/* search size */}
            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={213}
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
            {/* search line height */}
            <AutoLayout
              padding={16}
              fill={"#eee"}
              cornerRadius={8}
              spacing={12}
              verticalAlignItems={"end"}
              stroke={"#ccc"}
              strokeWidth={1}
              width={193}
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
            {/* search letter spacing */}
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
          {/* search button */}
          <AutoLayout
            hoverStyle={{ fill: "#1A7CF0" }}
            onClick={() => handleSearch()}
            width={250}
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
      {/* change all selected styles */}
      {stylesChecked?.length !== 0 && (
        <Fragment>
          {/* title */}
          <AutoLayout
            width={"fill-parent"}
            verticalAlignItems={"center"}
            spacing={24}
            padding={{ top: 12 }}
          >
            <Text fontSize={24}>Change all selected styles</Text>
            <Rectangle width={"fill-parent"} height={1} fill={"#ccc"} />
          </AutoLayout>
          {/* content */}
          <AutoLayout direction={"vertical"} width={"fill-parent"} spacing={12}>
            <AutoLayout
              spacing={24}
              verticalAlignItems={"center"}
              width={"fill-parent"}
              overflow={"scroll"}
            >              
              
              {/* font family */}
              <AutoLayout
                padding={{ top: 10, bottom: 10, left: 16, right: 16 }}
                fill={"#eee"}
                cornerRadius={8}
                verticalAlignItems={"center"}
                width={"fill-parent"}
                spacing={12}
                stroke={"#ccc"}
                strokeWidth={1}
              >
                <SVG src={fontFamilySvg} />
                <AutoLayout
                  width={"fill-parent"}
                  verticalAlignItems={"center"}
                  spacing={8}
                  cornerRadius={checkedFamily.type === "variable" ? 8 : 0}
                  fill={checkedFamily.type === "variable" ? "#dadada" : "#ffffff00"}
                  padding={{ vertical: 6, horizontal: 10 }}
                >
                  {checkedFamily.type === "variable" && (
                    <SVG src={variableSvg} />
                  )}
                  <Input
                    width={"fill-parent"}
                    fontSize={22}
                    value={checkedFamily.value}
                    onTextEditEnd={(e) => setCheckedFamily({
                      value: e.characters,
                      type: "string",
                      variableId: undefined
                    })}
                    placeholder="To font family"
                  />
                </AutoLayout>
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
                <SVG
                  src={variableOutlineSvg}
                  tooltip="Choice variable"
                  onClick={() =>
                    showUi({
                      moduleName: "choiceVariableSelected",
                      name: "Choice variable for font family",
                      data: {
                        type: "fontFamily",
                        variables: localVariableList || [],
                      },
                    })
                  }
                />
              </AutoLayout>
              {/* font style */}
              <AutoLayout
                padding={{ top: 10, bottom: 10, left: 16, right: 16 }}
                fill={"#eee"}
                cornerRadius={8}
                width={"fill-parent"}
                spacing={12}
                verticalAlignItems={"center"}
                stroke={"#ccc"}
                strokeWidth={1}
                overflow={"scroll"}
              >
                <SVG src={fontStyleSvg} />
                <AutoLayout
                  width={"fill-parent"}
                  verticalAlignItems={"center"}
                  spacing={8}
                  cornerRadius={checkedStyle.type === "variable" ? 8 : 0}
                  fill={checkedStyle.type === "variable" ? "#dadada" : "#ffffff00"}
                  padding={{ vertical: 6, horizontal: 10 }}
                >
                  {checkedStyle.type === "variable" && (
                    <SVG src={variableSvg} />
                  )}
                  <Input
                    width={"fill-parent"}
                    fontSize={22}
                    value={typeof checkedStyle.value === 'number' ? String(checkedStyle.value) : checkedStyle.value}
                    onTextEditEnd={(e) => setCheckedStyle({
                      value: e.characters,
                      type: "string",
                      variableId: undefined,
                      valueTypes: ["string", "number"]
                    })}
                    placeholder="To font style"
                  />
                </AutoLayout>
                <SVG
                  src={variableOutlineSvg}
                  tooltip="Choice variable"
                  onClick={() =>
                    showUi({
                      moduleName: "choiceVariableSelected",
                      name: "Choice variable for font style",
                      data: {
                        type: "fontStyle",
                        variables: localVariableList || [],
                      },
                    })
                  }
                />
              </AutoLayout>
              {/* font size */}
              <AutoLayout
                padding={{ top: 10, bottom: 10, left: 16, right: 16 }}
                fill={"#eee"}
                cornerRadius={8}
                width={"fill-parent"}
                spacing={12}
                verticalAlignItems={"center"}
                stroke={"#ccc"}
                strokeWidth={1}
              >
                <SVG src={fontSizeSvg} />
                <AutoLayout
                  width={"fill-parent"}
                  verticalAlignItems={"center"}
                  spacing={8}
                  cornerRadius={checkedFontSize.type === "variable" ? 8 : 0}
                  fill={checkedFontSize.type === "variable" ? "#dadada" : "#ffffff00"}
                  padding={{ vertical: 6, horizontal: 10 }}
                >
                  {checkedFontSize.type === "variable" && (
                    <SVG src={variableSvg} />
                  )}
                  <Input
                    width={"fill-parent"}
                    fontSize={22}
                    value={checkedFontSize.value}
                    onTextEditEnd={(e) => setCheckedFontSize({
                      value: e.characters,
                      type: "string",
                      variableId: undefined
                    })}
                    placeholder="To font size"
                  />
                </AutoLayout>
                <SVG
                  src={variableOutlineSvg}
                  tooltip="Choice variable"
                  onClick={() =>
                    showUi({
                      moduleName: "choiceVariableSelected",
                      name: "Choice variable for font size",
                      data: {
                        type: "fontSize",
                        variables: localVariableList || [],
                      },
                    })
                  }
                />
              </AutoLayout>
              {/* line height */}
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
                  placeholder="To line height"
                />
              </AutoLayout>
              {/* letter spacing */}
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
                    placeholder="To letter spacing"
                  />
                </AutoLayout>
              )}
              {/* change selected */}
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
            width={310}
            fill={"#eee"}
          >
            Font family
          </Text>
          <Rectangle width={1} height={60} fill={"#ccc"} />
          <AutoLayout width={350}>
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
          <Text fontSize={24} width={200} fontFamily={"Roboto"} fill={"#ccc"}>
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
          {/* filter styles */}
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
                      width={310}
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
                      <SVG
                        src={variableOutlineSvg}
                        tooltip="Choice variable"
                        onClick={() =>
                          showUi({
                            moduleName: "choiceVariable",
                            name: "Choice variable",
                            data: {
                              type: "fontFamily",
                              id: style.id,
                              value: cache.fontName.family,
                              variables: localVariableList || [],
                            },
                          })
                        }
                      />
                    </AutoLayout>
                    {/* Font weight */}
                    <Rectangle width={1} height={50} fill={"#ccc"} />
                    <AutoLayout
                      width={350}
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
                                    style: typeof e.characters === 'number' ? String(e.characters) : e.characters,
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
                      width={200}
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
                      <SVG
                        src={variableOutlineSvg}
                        tooltip="Choice variable"
                        onClick={() =>
                          showUi({
                            moduleName: "choiceVariable",
                            name: "Choice variable",
                            data: {
                              type: "fontSize",
                              id: style.id,
                              value: cache.fontSize.toString(),
                              variables: localVariableList || [],
                            },
                          })
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
