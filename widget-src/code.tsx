const { widget } = figma;
const {
  AutoLayout,
  Text,
  Rectangle,
  useSyncedState,
  useEffect,
  SVG,
  usePropertyMenu,
  useWidgetId,
  Fragment,
  Input,
} = widget;

import TextDesignList from "./TextDesignSystemList";
import TextDesignManager from "./TextDesignSystemManager";

import {
  coffeeSvg,
  searchActive,
  searchDisable,
  listViewActive,
  listViewDisable,
  listSvg,
  editSvg,
} from "./svg";

import getFontWeightValue from "./hooks/getFontWeightValue";

/**
 * Interface for parameters passed when showing UI
 */
export interface ShowUiParams {
  moduleName: string; // Module name to identify which UI to show
  name: string; // Name for the UI instance
  data?: unknown; // Optional data to pass to the UI
  size?: { width: number; height: number }; // Optional size for the UI
}

/**
 * Message types for communication between UI and widget
 */
export type msgType =
  | {
      type: "close"; // Close UI message
    }
  | {
      type: "setFamilyAndWeight"; // Set font family and weight
      data: {
        family: string;
        weight: string;
      };
    }
  | {
      type: "setShowTypoGroup"; // Set typography group to display
      data: textStyleType[];
    }
  | {
      type: "setShowDuplicateTypoGroup"; // Set duplicate typography group
      data: textStyleType[];
    }
  | {
      type: "setShowEditType"; // Set display options for typography
      data: ShowType;
    }
  | {
      type: "setVariable"; // Set variable for a style property
      variableId: string; // ID of the selected variable
      styleId: string; // ID of the style to bind variable to
      propertyType: string; // Type of property (e.g., "fontStyle", "fontFamily")
    }
  | {
      type: "setVariableForSelected"; // Set variable for selected elements
      variableId: string; // ID of the selected variable
      propertyType: string; // Type of property (e.g., "fontStyle", "fontFamily")
    }
  | {
      type: "getVariables"; // Yêu cầu lấy variables
      propertyType: string; // Loại property để filter variables (nếu cần)
    };

/**
 * Text style definition with font properties and metadata
 */
export type textStyleType = {
  id: string; // Unique identifier
  name: string; // Display name
  fontName: FontName; // Font name information
  fontSize: number; // Font size in pixels
  lineHeight: LineHeight; // Line height settings
  letterSpacing: LetterSpacing; // Letter spacing settings
  description: string; // Description of the text style
  boundVariables?: { [key: string]: VariableAlias }; // Bound variables
};

/**
 * Simplified font type for easier manipulation
 */
export type cleanFontType = {
  family: string; // Font family name
  styles: string[]; // Available font styles
};

/**
 * Display options for typography details
 */
export type ShowType = {
  letterSpacing: boolean; // Whether to show letter spacing
  description: boolean; // Whether to show descriptions
};

/**
 * Custom variable definition for typography
 */
export type CustomVariable = {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  scopes: VariableScope[];
  valuesByMode: { [modeId: string]: VariableValue };
  defaultModeId?: string;
};

/**
 * Text design manager configuration and state
 */
export type textDesignManagerType = {
  textStyles: textStyleType[]; // Available text styles
  showUi: (params: ShowUiParams) => Promise<unknown>; // Function to show UI
  updateProgressUi: (params: Omit<ShowUiParams, "name" | "size">) => void; // Function to update UI without reopening it
  getLocalTextStyle: () => void; // Function to fetch local text styles
  setHasReloadLocalFont: (
    newValue: boolean | ((currValue: boolean) => boolean)
  ) => void; // Function to update font reload status
  localFonts: Font[]; // Available local fonts
  cleanFont: cleanFontType[]; // Simplified font information
  isOpenSearchBar: boolean; // Search bar visibility state
  showEditType: ShowType; // Typography display options
  localVariableList: CustomVariable[]; // Available variables
  currentModeID?: string; // Current mode ID của variable collection
};

/**
 * Kiểm tra nếu biến và giá trị trực tiếp có cùng giá trị thực tế
 * @param variable - Biến cần kiểm tra
 * @param directValue - Giá trị trực tiếp để so sánh
 * @param variableCollection - Danh sách biến và mode hiện tại
 * @returns true nếu biến và giá trị trực tiếp giống nhau về mặt giá trị
 */
export const compareVariableAndDirectValue = (
  variable: VariableAlias | undefined,
  directValue: any,
  variableCollection: { variables: any[]; currentMode: string | undefined }
): boolean => {
  if (!variable) return false;

  // Tìm biến trong collection
  const foundVariable = variableCollection.variables.find(
    (v) => v.id === variable.id
  );

  if (!foundVariable || !variableCollection.currentMode) return false;

  // Lấy giá trị của biến trong mode hiện tại
  const variableValue =
    foundVariable.valuesByMode[variableCollection.currentMode];

  // Hiển thị thông tin để debug
  console.log(
    `Comparing variable value: "${variableValue}" (${typeof variableValue}) with direct value: "${directValue}" (${typeof directValue})`
  );

  // So sánh giá trị của biến với giá trị trực tiếp
  // Chuyển đổi kiểu dữ liệu nếu cần
  if (typeof variableValue === "string" && typeof directValue === "string") {
    // So sánh các chuỗi không phân biệt chữ hoa/thường
    return variableValue.toLowerCase() === directValue.toLowerCase();
  } else if (
    typeof variableValue === "number" &&
    typeof directValue === "string"
  ) {
    // Có thể là fontWeight (số) vs fontStyle (chuỗi)
    return variableValue.toString() === directValue;
  } else if (
    typeof variableValue === "string" &&
    typeof directValue === "number"
  ) {
    // Ngược lại
    return variableValue === directValue.toString();
  }

  // Các trường hợp khác, so sánh trực tiếp
  return variableValue === directValue;
};

/**
 * Tạo các hàm kiểm tra riêng cho từng thuộc tính
 */

// Kiểm tra font family
export const checkFontFamilyChanged = (
  cacheStyle: textStyleType,
  localStyle: textStyleType,
  variableCollection?: { variables: any[]; currentMode: string | undefined }
): boolean => {
  const cacheHasVariable = !!cacheStyle.boundVariables?.fontFamily;
  const localHasVariable = !!localStyle.boundVariables?.fontFamily;

  // Trường hợp 1: Một trong hai có biến, một không có biến
  if (cacheHasVariable !== localHasVariable) {
    // Nếu có variableCollection, kiểm tra xem biến có giá trị giống với giá trị trực tiếp không
    if (variableCollection) {
      if (cacheHasVariable) {
        // Kiểm tra xem biến trong cache có giá trị giống với giá trị trực tiếp trong local không
        return !compareVariableAndDirectValue(
          cacheStyle.boundVariables?.fontFamily as VariableAlias,
          localStyle.fontName.family,
          variableCollection
        );
      } else if (localHasVariable) {
        // Kiểm tra xem biến trong local có giá trị giống với giá trị trực tiếp trong cache không
        return !compareVariableAndDirectValue(
          localStyle.boundVariables?.fontFamily as VariableAlias,
          cacheStyle.fontName.family,
          variableCollection
        );
      }
    }

    // Nếu không có variableCollection, coi là khác nhau
    return true;
  }

  // Trường hợp 2: Cả hai đều có biến, so sánh ID của biến
  if (cacheHasVariable && localHasVariable) {
    return (
      (cacheStyle.boundVariables!.fontFamily as VariableAlias).id !==
      (localStyle.boundVariables!.fontFamily as VariableAlias).id
    );
  }

  // Trường hợp 3: Cả hai đều không có biến, so sánh giá trị
  return cacheStyle.fontName.family !== localStyle.fontName.family;
};

// Kiểm tra font style
export const checkFontStyleChanged = (
  cacheStyle: textStyleType,
  localStyle: textStyleType,
  variableCollection?: { variables: any[]; currentMode: string | undefined }
): boolean => {
  // Kiểm tra cả fontStyle và fontWeight vì chúng liên quan đến nhau
  const cacheHasStyleVar = !!cacheStyle.boundVariables?.fontStyle;
  const cacheHasWeightVar = !!cacheStyle.boundVariables?.fontWeight;
  const localHasStyleVar = !!localStyle.boundVariables?.fontStyle;
  const localHasWeightVar = !!localStyle.boundVariables?.fontWeight;

  // Ghi log để debug
  console.log(
    `checkFontStyleChanged - cache: "${cacheStyle.fontName.style}", local: "${localStyle.fontName.style}"`
  );
  if (cacheHasStyleVar)
    console.log(
      `Cache has fontStyle variable: ${cacheStyle.boundVariables?.fontStyle}`
    );
  if (cacheHasWeightVar)
    console.log(
      `Cache has fontWeight variable: ${cacheStyle.boundVariables?.fontWeight}`
    );
  if (localHasStyleVar)
    console.log(
      `Local has fontStyle variable: ${localStyle.boundVariables?.fontStyle}`
    );
  if (localHasWeightVar)
    console.log(
      `Local has fontWeight variable: ${localStyle.boundVariables?.fontWeight}`
    );

  // Nếu trạng thái variable khác nhau (một bên có variable, bên kia không)
  // => luôn coi là có thay đổi, bất kể giá trị có giống nhau hay không
  if (
    cacheHasStyleVar !== localHasStyleVar ||
    cacheHasWeightVar !== localHasWeightVar
  ) {
    // Luôn trả về true khi một bên có biến và bên kia không
    return true;
  }

  // Nếu cùng có biến, so sánh ID biến
  if (cacheHasStyleVar && localHasStyleVar) {
    return (
      (cacheStyle.boundVariables!.fontStyle as VariableAlias).id !==
      (localStyle.boundVariables!.fontStyle as VariableAlias).id
    );
  }

  if (cacheHasWeightVar && localHasWeightVar) {
    return (
      (cacheStyle.boundVariables!.fontWeight as VariableAlias).id !==
      (localStyle.boundVariables!.fontWeight as VariableAlias).id
    );
  }

  // Không biến, so sánh giá trị trực tiếp
  const result = cacheStyle.fontName.style !== localStyle.fontName.style;
  console.log(`Direct comparison result: ${result}`);
  return result;
};

// Kiểm tra font size
export const checkFontSizeChanged = (
  cacheStyle: textStyleType,
  localStyle: textStyleType,
  variableCollection?: { variables: any[]; currentMode: string | undefined }
): boolean => {
  const cacheHasVariable = !!cacheStyle.boundVariables?.fontSize;
  const localHasVariable = !!localStyle.boundVariables?.fontSize;

  // Một có biến, một không có biến
  if (cacheHasVariable !== localHasVariable) {
    // Kiểm tra giá trị của biến vs giá trị trực tiếp
    if (variableCollection) {
      if (cacheHasVariable) {
        return !compareVariableAndDirectValue(
          cacheStyle.boundVariables?.fontSize as VariableAlias,
          localStyle.fontSize,
          variableCollection
        );
      } else if (localHasVariable) {
        return !compareVariableAndDirectValue(
          localStyle.boundVariables?.fontSize as VariableAlias,
          cacheStyle.fontSize,
          variableCollection
        );
      }
    }

    return true;
  }

  // Cả hai đều có biến, so sánh ID biến
  if (cacheHasVariable && localHasVariable) {
    return (
      (cacheStyle.boundVariables!.fontSize as VariableAlias).id !==
      (localStyle.boundVariables!.fontSize as VariableAlias).id
    );
  }

  // Cả hai đều không có biến, so sánh giá trị
  return cacheStyle.fontSize !== localStyle.fontSize;
};

// Kiểm tra line height
export const checkLineHeightChanged = (
  cacheStyle: textStyleType,
  localStyle: textStyleType,
  variableCollection?: { variables: any[]; currentMode: string | undefined }
): boolean => {
  const cacheHasVariable = !!cacheStyle.boundVariables?.lineHeight;
  const localHasVariable = !!localStyle.boundVariables?.lineHeight;

  // Một có biến, một không có biến
  if (cacheHasVariable !== localHasVariable) {
    // Line height phức tạp với nhiều trường hợp (AUTO, PIXELS, PERCENT)
    // Cần so sánh giá trị biến và giá trị trực tiếp
    // Để đơn giản, coi là khác nhau
    return true;
  }

  // Cả hai đều có biến, so sánh ID biến
  if (cacheHasVariable && localHasVariable) {
    return (
      (cacheStyle.boundVariables!.lineHeight as VariableAlias).id !==
      (localStyle.boundVariables!.lineHeight as VariableAlias).id
    );
  }

  // Cả hai đều không có biến, so sánh giá trị
  if (cacheStyle.lineHeight.unit !== localStyle.lineHeight.unit) return true;
  if (
    cacheStyle.lineHeight.unit === "AUTO" &&
    localStyle.lineHeight.unit === "AUTO"
  )
    return false;
  if (
    cacheStyle.lineHeight.unit === "AUTO" ||
    localStyle.lineHeight.unit === "AUTO"
  )
    return true;
  return cacheStyle.lineHeight.value !== localStyle.lineHeight.value;
};

// Kiểm tra letter spacing
export const checkLetterSpacingChanged = (
  cacheStyle: textStyleType,
  localStyle: textStyleType,
  variableCollection?: { variables: any[]; currentMode: string | undefined }
): boolean => {
  const cacheHasVariable = !!cacheStyle.boundVariables?.letterSpacing;
  const localHasVariable = !!localStyle.boundVariables?.letterSpacing;

  // Một có biến, một không có biến
  if (cacheHasVariable !== localHasVariable) {
    // Letter spacing cũng phức tạp với unit là PIXELS hoặc PERCENT
    // Để đơn giản, coi là khác nhau
    return true;
  }

  // Cả hai đều có biến, so sánh ID biến
  if (cacheHasVariable && localHasVariable) {
    return (
      (cacheStyle.boundVariables!.letterSpacing as VariableAlias).id !==
      (localStyle.boundVariables!.letterSpacing as VariableAlias).id
    );
  }

  // Cả hai đều không có biến, so sánh giá trị
  if (cacheStyle.letterSpacing.unit !== localStyle.letterSpacing.unit)
    return true;
  if (
    cacheStyle.letterSpacing.unit === "PIXELS" &&
    localStyle.letterSpacing.unit === "PIXELS"
  ) {
    return cacheStyle.letterSpacing.value !== localStyle.letterSpacing.value;
  }
  if (
    cacheStyle.letterSpacing.unit === "PERCENT" &&
    localStyle.letterSpacing.unit === "PERCENT"
  ) {
    return cacheStyle.letterSpacing.value !== localStyle.letterSpacing.value;
  }
  return true;
};

// Kiểm tra description
export const checkDescriptionChanged = (
  cacheStyle: textStyleType,
  localStyle: textStyleType
): boolean => {
  return cacheStyle.description !== localStyle.description;
};

/**
 * Hàm gốc được giữ lại để tương thích ngược, sử dụng các hàm con ở trên
 */
export const checkStyleChanged = (
  cacheStyle: textStyleType,
  localStyle: textStyleType,
  variableCollection?: { variables: any[]; currentMode: string | undefined }
): {
  fontFamily: boolean;
  fontStyle: boolean;
  fontSize: boolean;
  lineHeight: boolean;
  letterSpacing: boolean;
  description: boolean;
} => {
  return {
    fontFamily: checkFontFamilyChanged(
      cacheStyle,
      localStyle,
      variableCollection
    ),
    fontStyle: checkFontStyleChanged(
      cacheStyle,
      localStyle,
      variableCollection
    ),
    fontSize: checkFontSizeChanged(cacheStyle, localStyle, variableCollection),
    lineHeight: checkLineHeightChanged(
      cacheStyle,
      localStyle,
      variableCollection
    ),
    letterSpacing: checkLetterSpacingChanged(
      cacheStyle,
      localStyle,
      variableCollection
    ),
    description: checkDescriptionChanged(cacheStyle, localStyle),
  };
};

// Tạo một interface hoặc type cho checkedFamily
type CheckedFamilyType = {
  value: string;
  type: "string" | "variable";
  variableId?: string;
};

/**
 * Main Widget component for the Font Style Manager
 * Manages state, UI modes, and handles communication with Figma API
 */
function Widget() {
  // Load fonts on first initialization and refresh text styles when needed
  useEffect(() => {
    if (isFirstLoadFont && localFonts.length === 0) {
      loadLocalFont();
      setIsFirstLoadFont(false);
    }
    if (hasReloadLocalFont) {
      getLocalTextStyle();
      setHasReloadLocalFont(false);
    }
  });

  // Core state management
  const [mode, setMode] = useSyncedState<"edit" | "view">("mode", "edit");
  const [textStyles, setTextStyles] = useSyncedState<textStyleType[]>(
    "textStyles",
    []
  );
  const [filterStyles, setFilterStyles] = useSyncedState<textStyleType[]>(
    "filterStyles",
    []
  );

  // Font selection state
  const [checkedFamily, setCheckedFamily] = useSyncedState<CheckedFamilyType>(
    "checkedFamily",
    { value: "", type: "string", variableId: undefined }
  );
  const [checkedStyle, setCheckedStyle] = useSyncedState("checkedStyle", "");

  const [cacheStyle, setCacheStyle] = useSyncedState<textStyleType[]>(
    "cacheStyle",
    []
  );

  const [isFirstLoadFont, setIsFirstLoadFont] = useSyncedState(
    "isFirstLoadFont",
    true
  );
  const [localFonts, setLocalFonts] = useSyncedState<Font[]>("localFonts", []);
  const [cleanFont, setCleanFont] = useSyncedState<cleanFontType[]>(
    "cleanFont",
    []
  );

  const [showGroup] = useSyncedState<string[]>("showGroup", []);

  const [showStyle, setShowStyle] = useSyncedState<textStyleType[]>(
    "showStyle",
    []
  );

  const [hasReloadLocalFont, setHasReloadLocalFont] = useSyncedState(
    "hasReloadLocalFont",
    false
  );

  const [isOpenSearchBar, setIsOpenSearchBar] = useSyncedState<boolean>(
    "isOpenSearchBar",
    true
  );

  const [showEditType, setShowEditType] = useSyncedState<ShowType>(
    "showEditType",
    {
      letterSpacing: true,
      description: true,
    }
  );

  const [localVariableList, setLocalVariableList] = useSyncedState<
    CustomVariable[]
  >("localVariableList", []);

  // Thêm state mới để lưu trữ current mode của variable collection
  const [currentModeID, setCurrentModeID] = useSyncedState<string | undefined>(
    "currentModeID",
    undefined
  );

  const widgetId = useWidgetId();

  /**
   * Creates a clone of the current widget with specified text styles
   * @param showStyleData - Text styles to display in the cloned widget (defaults to current showStyle)
   */
  const handleCloneWidget = async (
    showStyleData: textStyleType[] = showStyle
  ) => {
    const widgetNode = (await figma.getNodeByIdAsync(
      String(widgetId)
    )) as WidgetNode;
    const clonedWidget = widgetNode.clone();

    // Transfer the current state to the cloned widget
    clonedWidget.setWidgetSyncedState({
      mode: "view",
      textStyles,
      filterStyles,
      checkedFamily,
      checkedStyle,
      cacheStyle,
      isFirstLoadFont,
      showStyle: showStyleData,
    });

    // Position the cloned widget beside this widget
    widgetNode.parent!.appendChild(clonedWidget);
    clonedWidget.x = widgetNode.x + widgetNode.width + 250;
    clonedWidget.y = widgetNode.y;
  };

  /**
   * Toggle between edit and view modes
   */
  const handleSetMode = () =>
    setMode((prev) => (prev === "edit" ? "view" : "edit"));

  // Property menu configuration for mode selection
  const modeOptions = [
    { option: "edit", label: "Edit mode" },
    { option: "view", label: "List mode" },
  ];

  // Configure the widget's property menu
  usePropertyMenu(
    [
      {
        itemType: "action",
        tooltip: "Mode view:",
        propertyName: "action:",
      },
      {
        itemType: "dropdown",
        propertyName: "mode",
        tooltip: "Mode view",
        selectedOption: mode,
        options: modeOptions,
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "mode") {
        setMode(propertyValue as "edit" | "view");
      }
    }
  );

  /**
   * Load available fonts from Figma and process them
   */
  const loadLocalFont = async () => {
    try {
      // Load fonts
      const fonts = await figma.listAvailableFontsAsync();

      // Process fonts
      const processedFonts = fonts.filter((font) => {
        // Remove invalid fonts
        if (!font.fontName.family || font.fontName.family.startsWith("??")) {
          return false;
        }
        return true;
      });

      // Update state
      setLocalFonts(processedFonts);

      // Process and organize fonts
      fontsClean(processedFonts);

      // Log font loading information
      console.log(`Loaded ${processedFonts.length} fonts`);

      // Log unique font families
      const uniqueFamilies = [
        ...new Set(processedFonts.map((font) => font.fontName.family)),
      ];
      console.log(
        `Found ${uniqueFamilies.length} font families:`,
        uniqueFamilies
      );
    } catch (error) {
      console.error("Error loading fonts:", error);
      figma.notify("❌ Error occurred while loading fonts", { error: true });
    }
  };

  // const [newStyle, setNewStyle] = useSyncedState("newStyle", {
  // 	name: "",
  // 	fontName: {
  // 		family: "",
  // 		style: "",
  // 	},
  // 	fontSize: 16,
  // 	description: "",
  // });

  // Handle messages from UI
  useEffect(() => {
    figma.ui.onmessage = (msg) => {
      handleGetUiMessage(msg);
    };
  });

  /**
   * Bind a variable to a text style property
   * @param variableId - ID of the variable to bind
   * @param styleId - ID of the text style to update
   * @param propertyType - Type of property to bind (fontFamily, fontSize, etc.)
   */
  const handleSetVariable = async (
    variableId: string,
    styleId: string,
    propertyType: string
  ) => {
    console.log(
      "Setting variable:",
      variableId,
      "for style:",
      styleId,
      "property:",
      propertyType
    );

    // Check style in cache
    const styleToUpdate = cacheStyle.find((style) => style.id === styleId);
    if (!styleToUpdate) {
      console.error("Style not found in cache:", styleId);
      figma.closePlugin();
      return;
    }
    console.log("Found style to update:", styleToUpdate);

    // Check variable in localVariableList
    const variableToApply = localVariableList.find(
      (variable) => variable.id === variableId
    );
    if (!variableToApply) {
      console.error("Variable not found in localVariableList:", variableId);
      figma.closePlugin();
      return;
    }
    console.log("Found variable to apply:", variableToApply);

    // Map property type to the correct field for a TextStyle
    let field: string = ""; // Initialize default value
    switch (propertyType) {
      case "fontFamily":
        field = "fontFamily";
        break;
      case "fontStyle":
        field = "fontStyle";
        break;
      case "fontWeight":
        field = "fontWeight";
        break;
      case "fontSize":
        field = "fontSize";
        break;
      case "lineHeight":
        field = "lineHeight";
        break;
      case "letterSpacing":
        field = "letterSpacing";
        break;
      default:
        console.warn(
          `Property type "${propertyType}" is not supported for variable binding`
        );
        figma.closePlugin();
        return;
    }
    console.log("Mapped field:", field);

    // Get variable value to check type
    const defaultModeId = variableToApply.defaultModeId;
    if (defaultModeId) {
      const variableValue = variableToApply.valuesByMode[defaultModeId];

      // Special case: if fontStyle variable contains a number, use fontWeight field instead
      if (propertyType === "fontStyle" && typeof variableValue === "number") {
        field = "fontWeight";
        console.log(
          "Using fontWeight instead of fontStyle for number variable"
        );
      }
    }

    // Update cache.boundVariables and corresponding value
    setCacheStyle((prev: textStyleType[]) =>
      prev.map((style: textStyleType) => {
        if (style.id === styleId) {
          // Get value from variable based on defaultModeId
          const defaultModeId = variableToApply.defaultModeId;

          // Check defaultModeId and valuesByMode
          if (!defaultModeId || !variableToApply.valuesByMode[defaultModeId]) {
            console.error(
              `Variable ${variableId} has no value for defaultModeId ${defaultModeId}`
            );
            return style;
          }

          const variableValue = variableToApply.valuesByMode[defaultModeId];
          console.log("Variable value:", variableValue);
          console.log("Default mode ID:", defaultModeId);

          // Update corresponding value with field
          let updatedStyle = { ...style };
          console.log("Current style before update:", updatedStyle);

          switch (field) {
            case "fontFamily":
              updatedStyle.fontName = {
                ...style.fontName,
                family: variableValue as string,
              };
              console.log("Updated fontName:", updatedStyle.fontName);
              break;
            case "fontStyle":
              // Check variableValue data type
              if (typeof variableValue === "number") {
                // Check if font supports weight
                const fontSupportsWeight = checkFontWeightSupport(
                  style.fontName.family
                );

                if (fontSupportsWeight) {
                  // Sử dụng getFontWeightValue để tìm tên style phù hợp với font weight
                  const fontStyles = localFonts
                    .filter(
                      (font) => font.fontName.family === style.fontName.family
                    )
                    .map((font) => font.fontName.style);

                  // Tìm style phù hợp nhất với weight được chỉ định
                  let bestStyleMatch = "Regular";
                  let closestWeight = 400;

                  for (const fontStyle of fontStyles) {
                    const weightInfo = getFontWeightValue(fontStyle);
                    if (weightInfo.fontWeight === variableValue) {
                      bestStyleMatch = fontStyle;
                      break;
                    } else if (weightInfo.fontWeight !== undefined) {
                      // Nếu không tìm thấy trùng khớp chính xác, lưu lại style có weight gần nhất
                      const currentDiff = Math.abs(
                        (weightInfo.fontWeight as number) -
                          (variableValue as number)
                      );
                      const closestDiff = Math.abs(
                        closestWeight - (variableValue as number)
                      );

                      if (currentDiff < closestDiff) {
                        closestWeight = weightInfo.fontWeight;
                        bestStyleMatch = fontStyle;
                      }
                    }
                  }

                  updatedStyle.fontName = {
                    ...style.fontName,
                    style: bestStyleMatch,
                  };
                } else {
                  // If weight is not supported, keep current style
                  console.warn(
                    `Font ${style.fontName.family} does not support weight ${variableValue}`
                  );
                  return style;
                }
              } else {
                // If string, use directly
                updatedStyle.fontName = {
                  ...style.fontName,
                  style: variableValue as string,
                };
              }
              console.log("Updated fontName:", updatedStyle.fontName);
              break;
            case "fontWeight":
              // Handle fontWeight variable (it should be a number)
              if (typeof variableValue === "number") {
                // Check if font supports weight
                const fontSupportsWeight = checkFontWeightSupport(
                  style.fontName.family
                );

                if (fontSupportsWeight) {
                  // Sử dụng getFontWeightValue để tìm tên style phù hợp với font weight
                  const fontStyles = localFonts
                    .filter(
                      (font) => font.fontName.family === style.fontName.family
                    )
                    .map((font) => font.fontName.style);

                  // Tìm style phù hợp nhất với weight được chỉ định
                  let bestStyleMatch = "Regular";
                  let closestWeight = 400;

                  for (const fontStyle of fontStyles) {
                    const weightInfo = getFontWeightValue(fontStyle);
                    if (weightInfo.fontWeight === variableValue) {
                      bestStyleMatch = fontStyle;
                      break;
                    } else if (weightInfo.fontWeight !== undefined) {
                      // Nếu không tìm thấy trùng khớp chính xác, lưu lại style có weight gần nhất
                      const currentDiff = Math.abs(
                        (weightInfo.fontWeight as number) -
                          (variableValue as number)
                      );
                      const closestDiff = Math.abs(
                        closestWeight - (variableValue as number)
                      );

                      if (currentDiff < closestDiff) {
                        closestWeight = weightInfo.fontWeight;
                        bestStyleMatch = fontStyle;
                      }
                    }
                  }

                  updatedStyle.fontName = {
                    ...style.fontName,
                    style: bestStyleMatch,
                  };
                } else {
                  // If weight is not supported, keep current style
                  console.warn(
                    `Font ${style.fontName.family} does not support weight ${variableValue}`
                  );
                  return style;
                }
              } else {
                console.warn(
                  `fontWeight variable should be a number, got ${typeof variableValue}`
                );
                return style;
              }
              console.log(
                "Updated fontName (from weight):",
                updatedStyle.fontName
              );
              break;
            case "fontSize":
              updatedStyle.fontSize = variableValue as number;
              console.log("Updated fontSize:", updatedStyle.fontSize);
              break;
            case "lineHeight":
              // LineHeight là object phức tạp với unit và value
              if (typeof variableValue === "number") {
                // Giữ nguyên unit hiện tại, chỉ cập nhật value
                // Nếu unit là AUTO, chuyển sang PIXELS
                if (style.lineHeight.unit === "AUTO") {
                  updatedStyle.lineHeight = {
                    unit: "PIXELS",
                    value: variableValue,
                  };
                } else {
                  updatedStyle.lineHeight = {
                    ...style.lineHeight,
                    value: variableValue,
                  };
                }
                console.log("Updated lineHeight:", updatedStyle.lineHeight);
              } else {
                console.warn(
                  `LineHeight variable phải là số, nhận được ${typeof variableValue}`
                );
              }
              break;
            case "letterSpacing":
              // LetterSpacing cũng là object phức tạp với unit và value
              if (typeof variableValue === "number") {
                // Giữ nguyên unit hiện tại, chỉ cập nhật value
                updatedStyle.letterSpacing = {
                  ...style.letterSpacing,
                  value: variableValue,
                };
                console.log(
                  "Updated letterSpacing:",
                  updatedStyle.letterSpacing
                );
              } else {
                console.warn(
                  `LetterSpacing variable phải là số, nhận được ${typeof variableValue}`
                );
              }
              break;
            default:
              console.warn(
                `Field "${field}" is not supported for variable binding`
              );
              figma.closePlugin();
              return style; // Return current style instead of undefined
          }

          // Update boundVariables
          updatedStyle.boundVariables = {
            ...style.boundVariables,
            [field]: {
              type: "VARIABLE_ALIAS",
              id: variableId,
            },
          };
          console.log("Updated boundVariables:", updatedStyle.boundVariables);

          return updatedStyle;
        }
        return style;
      })
    );

    console.log(
      `Successfully bound variable to ${field} of style ${styleToUpdate.name}`
    );

    figma.closePlugin();
  };

  /**
   * Process messages received from the UI
   * @param msg - Message object from UI
   */
  const handleGetUiMessage = (msg: msgType) => {
    if (msg.type === "setFamilyAndWeight") {
      // Chuyển đổi string thành object CheckedFamilyType
      setCheckedFamily({
        value: msg.data.family,
        type: "string",
        variableId: undefined
      });
      setCheckedStyle(msg.data.weight);
      figma.closePlugin();
    }
    if (msg.type === "setShowTypoGroup") {
      setShowStyle(msg.data);
    }
    if (msg.type === "setShowDuplicateTypoGroup") {
      handleCloneWidget(msg.data);
      figma.closePlugin();
    }
    if (msg.type === "close") {
      figma.closePlugin();
    }
    if (msg.type === "setShowEditType") {
      setShowEditType(msg.data);
      figma.closePlugin();
    }
    if (msg.type === "setVariable") {
      handleSetVariable(msg.variableId, msg.styleId, msg.propertyType);
    }
    if (msg.type === "setVariableForSelected") {
      handleSetVariableForSelected(msg.variableId, msg.propertyType);
    }
  };

  // const [findKeys, setFindKeys] = useSyncedState("findKeys", { family: "", style: "" });

  /**
   * Toggle the search bar visibility
   */
  const toggleSearchBar = () => {
    setIsOpenSearchBar((prev) => !prev);
  };

  /**
   * Process font list to create a clean, organized structure by family and style
   * @param fonts - List of available fonts
   */
  const fontsClean = (fonts: Font[]) => {
    let fontFamily: string = "";
    const data: cleanFontType[] = [];
    let fontStyles: string[] = [];

    // Group fonts by family and collect available styles
    for (const font of fonts) {
      if (fontFamily === font.fontName.family) {
        fontStyles.push(font.fontName.style);
      } else {
        // Add the previous font family and its styles to the result
        if (
          fontFamily != "" &&
          !fontFamily.startsWith("??") &&
          fontStyles.length != 0
        ) {
          data.push({ family: fontFamily, styles: fontStyles });
        }
        // Start collecting styles for the new family
        fontStyles = [font.fontName.style];
        fontFamily = font.fontName.family;
      }
    }

    setCleanFont(data);
  };

  /**
   * Load and process all local text styles from Figma
   */
  const getLocalTextStyle = async () => {
    const styles: TextStyle[] = await figma.getLocalTextStylesAsync();
    const data: textStyleType[] = [];

    // Process each style to extract required information
    for (const style of styles) {
      const value = (await getDataStyle(style.id)) as textStyleType;
      data.push(value);
    }

    // Update state with the processed styles
    setTextStyles(data);
    setCacheStyle(data);
    setFilterStyles(data);
    setShowStyle(data);

    // Load local variables
    const localVariables = await figma.variables.getLocalVariablesAsync();
    const variablesData: CustomVariable[] = [];

    for (const variable of localVariables) {
      const value = await getDataVariable(variable.id);
      if (value) {
        variablesData.push(value);
      }
    }
    setLocalVariableList(variablesData);

    // Lấy currentMode từ collections
    if (variablesData.length > 0) {
      try {
        // Lấy collection ID từ variable đầu tiên
        const firstVariable = variablesData[0];
        const collectionId = firstVariable.variableCollectionId;

        // Lấy collection từ API
        const collection =
          await figma.variables.getVariableCollectionByIdAsync(collectionId);

        if (collection && collection.modes.length > 0) {
          // Lấy mode mặc định hoặc mode đầu tiên
          const modeID = collection.defaultModeId || collection.modes[0].modeId;
          setCurrentModeID(modeID);
        }
      } catch (error) {
        console.error("Error getting current mode:", error);
      }
    }

    figma.notify(
      "✅ Style loaded successfully, Waiting for import data to widget"
    );
  };

  /**
   * Retrieve and format text style data from a style ID
   * @param id - The ID of the style to retrieve
   * @returns Formatted text style object or undefined if not found
   */
  const getDataStyle = async (id: string) => {
    const data = (await figma.getStyleByIdAsync(id)) as TextStyle;
    if (data) {
      return {
        id: data?.id,
        name: data?.name,
        fontName: {
          family: data?.fontName?.family,
          style: data?.fontName?.style,
        },
        fontSize: data?.fontSize,
        lineHeight: data?.lineHeight,
        letterSpacing: data?.letterSpacing,
        description: data?.description || "",
        boundVariables: data?.boundVariables,
      };
    }
    return undefined;
  };

  /**
   * Retrieve and format variable data from a variable ID
   * @param variableId - The ID of the variable to retrieve
   * @returns Formatted variable object or undefined if not found
   */
  const getDataVariable = async (variableId: string) => {
    const data = await figma.variables.getVariableByIdAsync(variableId);
    if (data) {
      const modes = await figma.variables.getVariableCollectionByIdAsync(
        data.variableCollectionId
      );

      if (modes) {
        // Lấy defaultModeId từ collection hoặc mode đầu tiên
        const defaultModeId = modes.defaultModeId || modes.modes[0]?.modeId;

        // Kiểm tra xem defaultModeId có hợp lệ không
        if (!defaultModeId) {
          console.warn(`Variable ${variableId} không có defaultModeId hợp lệ`);
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
  // const checkFontName = (font: any) => {
  // 	// const regex = new RegExp(font.fontName.family, "i");
  // 	const res = localFonts.filter((fontLocal) => font.fontName.family === fontLocal.fontName.family);
  // 	// console.log(res)
  // 	if (res.length !== 0) {
  // 		// const regex = new RegExp(font.fontName.style, "i");
  // 		const style = res.filter((fontLocal) => font.fontName.style === fontLocal.fontName.style);
  // 		if (style.length !== 0) {
  // 			return { check: true };
  // 		} else {
  // 			return { check: false, status: "style" };
  // 		}
  // 	} else {
  // 		return { check: false, status: "family" };
  // 	}
  // };

  // const createStyle = () => {
  // 	const check = checkFontName(newStyle);
  // 	if (check.check) {
  // 		try {
  // 			figma.loadFontAsync({ ...newStyle.fontName }).then((res) => {
  // 				const style = figma.createTextStyle();
  // 				style.name = newStyle.name;
  // 				style.fontName = { ...newStyle.fontName };
  // 				style.fontSize = newStyle.fontSize;
  // 				style.description = newStyle.description;

  // 				setNewStyle({
  // 					name: "",
  // 					fontName: {
  // 						family: "",
  // 						style: "",
  // 					},
  // 					fontSize: 16,
  // 					description: "",
  // 				});
  // 			});
  // 		} catch (err) {
  // 			console.log(err);
  // 		} finally {
  // 			getLocalTextStyle();
  // 		}
  // 	} else {
  // 		console.log("not find " + check.status);
  // 	}
  // };

  const showUi = ({ moduleName, name, data, size }: ShowUiParams) =>
    new Promise(() => {
      figma.showUI(__html__, {
        width: size?.width || 300,
        height: size?.height || 350,
        title: name,
        themeColors: true,
      });
      figma.ui.postMessage({ moduleName, data });
    });

  /**
   * Cập nhật thông tin tiến trình trong UI mà không gọi lại figma.showUI
   * Chỉ gửi message tới UI đã hiển thị
   */
  const updateProgressUi = ({
    moduleName,
    data,
  }: Omit<ShowUiParams, "name" | "size">) => {
    figma.ui.postMessage({ moduleName, data });
  };

  /**
   * Kiểm tra xem font có hỗ trợ weight hay không
   * @param fontFamily - Tên font family cần kiểm tra
   * @returns boolean - true nếu font hỗ trợ weight, false nếu không
   */
  const checkFontWeightSupport = (fontFamily: string): boolean => {
    // Lấy danh sách font từ localFonts
    const fontStyles = localFonts
      .filter((font) => font.fontName.family === fontFamily)
      .map((font) => font.fontName.style);

    // Kiểm tra xem có style nào có weight hợp lệ không
    const hasWeightStyle = fontStyles.some((style) => {
      const weightInfo = getFontWeightValue(style);
      return weightInfo.fontWeight !== undefined;
    });

    return hasWeightStyle;
  };

  /**
   * Apply variable to selected text nodes
   * @param variableId - ID of the variable to bind
   * @param propertyType - Type of property to bind (fontFamily, fontSize, etc.)
   */
  const handleSetVariableForSelected = async (
    variableId: string,
    propertyType: string
  ) => {
    console.log(
      "Setting variable for selected elements:",
      variableId,
      "property:",
      propertyType
    );

    // log variableid
    console.log(variableId);

    figma.closePlugin();
  };

  return (
    <AutoLayout
      width={mode === "edit" ? 2280 : 1200}
      height={"hug-contents"}
      fill={"#fff"}
      padding={{
        top: 60,
        right: 36,
        left: 36,
        bottom: 50,
      }}
      spacing={42}
      direction={"vertical"}
      cornerRadius={24}
      overflow={"scroll"}
      // canvasStacking={"first-on-top"}
    >
      {/* <Text onClick={() => showUi("choiceFont", "font", cleanFont)}>aaaa</Text> */}
      <AutoLayout width={"fill-parent"}>
        <AutoLayout
          width={"fill-parent"}
          horizontalAlignItems={mode === "edit" ? "center" : "start"}
          direction={"vertical"}
          padding={{ bottom: 6 }}
        >
          <Text fontSize={46} fontWeight={700} fill={"#000000"}>
            {mode === "edit" ? "FONT STYLES MANAGER" : "FONT STYLES LIST"}
          </Text>
          {mode === "edit" ? (
            <Text fontSize={18} fill={"#000000"}>
              Choose styles you want to change
            </Text>
          ) : (
            <Input
              width={600}
              fontSize={18}
              value={"Change to your subHeadings"}
              onTextEditEnd={() => {}}
              placeholder={"Change subHeadings"}
            />
          )}
        </AutoLayout>
        {mode === "view" ? (
          <SVG
            src={editSvg}
            onClick={() =>
              showUi({
                moduleName: "editShowGroup",
                name: "Choice Group of Typo",
                data: textStyles,
                size: { width: 500, height: 550 },
              })
            }
          />
        ) : (
          <SVG
            src={editSvg}
            tooltip="Edit table table column"
            onClick={() =>
              showUi({
                moduleName: "editTypeList",
                name: "Choice edit type showed",
                data: showEditType,
                size: { width: 300, height: 350 },
              })
            }
          />
        )}
      </AutoLayout>
      <AutoLayout
        positioning={"absolute"}
        x={mode === "edit" ? 2295 : 1215}
        y={120}
        width={82}
      >
        <AutoLayout
          width={"fill-parent"}
          cornerRadius={16}
          spacing={24}
          padding={{ top: 24, bottom: 24, right: 16, left: 16 }}
          fill={"#ffffff"}
          horizontalAlignItems={"center"}
          direction={"vertical"}
        >
          <SVG
            src={mode === "edit" ? listViewDisable : listViewActive}
            onClick={() => handleSetMode()}
            tooltip={mode === "edit" ? "Open view mode" : "Open edit mode"}
          />
          <Rectangle width={"fill-parent"} height={1} fill={"#e6e6e6"} />
          {mode === "edit" && (
            <SVG
              src={isOpenSearchBar ? searchActive : searchDisable}
              onClick={toggleSearchBar}
              tooltip={
                isOpenSearchBar ? "Hidden search tool" : "Show search tool"
              }
            />
          )}
          {mode === "view" && (
            <Fragment>
              <SVG
                src={listSvg}
                onClick={() =>
                  showUi({
                    moduleName: "editShowGroup",
                    name: "Choice Group of Typo",
                    data: textStyles,
                    size: { width: 450, height: 550 },
                  })
                }
              />
            </Fragment>
          )}
          <Rectangle width={"fill-parent"} height={1} fill={"#e6e6e6"} />
          <SVG
            src={coffeeSvg}
            tooltip={"Buy me a coffee"}
            onClick={() =>
              showUi({ moduleName: "buyCoffee", name: "Buy me a coffee" })
            }
          />
        </AutoLayout>
      </AutoLayout>

      {mode === "edit" && (
        <TextDesignManager
          value={{
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
          }}
        />
      )}
      {mode === "view" && (
        <TextDesignList
          value={{
            showStyle,
            showGroup,
          }}
        />
      )}
    </AutoLayout>
  );
}

widget.register(Widget);
