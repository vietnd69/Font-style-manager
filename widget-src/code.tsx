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

/**
 * Interface for parameters passed when showing UI
 */
export interface ShowUiParams {
  moduleName: string;  // Module name to identify which UI to show
  name: string;        // Name for the UI instance
  data?: unknown;      // Optional data to pass to the UI
  size?: { width: number; height: number };  // Optional size for the UI
}

/**
 * Message types for communication between UI and widget
 */
export type msgType =
  | {
      type: "close";  // Close UI message
    }
  | {
      type: "setFamilyAndWeight";  // Set font family and weight
      data: {
        family: string;
        weight: string;
      };
    }
  | {
      type: "setShowTypoGroup";  // Set typography group to display
      data: textStyleType[];
    }
  | {
      type: "setShowDuplicateTypoGroup";  // Set duplicate typography group
      data: textStyleType[];
    }
  | {
      type: "setShowEditType";  // Set display options for typography
      data: ShowType;
    }
  | {
      type: "setVariable";  // Set variable for a style property
      variableId: string;   // ID of the selected variable
      styleId: string;      // ID of the style to bind variable to
      propertyType: string; // Type of property (e.g., "fontStyle", "fontFamily")
    };

/**
 * Text style definition with font properties and metadata
 */
export type textStyleType = {
  id: string;           // Unique identifier
  name: string;         // Display name
  fontName: FontName;   // Font name information
  fontSize: number;     // Font size in pixels
  lineHeight: LineHeight;  // Line height settings
  letterSpacing: LetterSpacing;  // Letter spacing settings
  description: string;  // Description of the text style
  boundVariables?: { [key: string]: VariableAlias };  // Bound variables
};

/**
 * Simplified font type for easier manipulation
 */
export type cleanFontType = {
  family: string;     // Font family name
  styles: string[];   // Available font styles
};

/**
 * Display options for typography details
 */
export type ShowType = {
  letterSpacing: boolean;  // Whether to show letter spacing
  description: boolean;    // Whether to show descriptions
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
  textStyles: textStyleType[];  // Available text styles
  showUi: (params: ShowUiParams) => Promise<unknown>;  // Function to show UI
  updateProgressUi: (params: Omit<ShowUiParams, 'name' | 'size'>) => void;  // Function to update UI without reopening it
  getLocalTextStyle: () => void;  // Function to fetch local text styles
  setHasReloadLocalFont: (
    newValue: boolean | ((currValue: boolean) => boolean)
  ) => void;  // Function to update font reload status
  localFonts: Font[];  // Available local fonts
  cleanFont: cleanFontType[];  // Simplified font information
  isOpenSearchBar: boolean;  // Search bar visibility state
  showEditType: ShowType;  // Typography display options
  localVariableList: CustomVariable[];  // Available variables
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
  const [checkedFamily, setCheckedFamily] = useSyncedState("checkedFamily", "");
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

  const widgetId = useWidgetId();

  /**
   * Creates a clone of the current widget with specified text styles
   * @param showStyleData - Text styles to display in the cloned widget (defaults to current showStyle)
   */
  const handleCloneWidget = async (
    showStyleData: textStyleType[] = showStyle
  ) => {
    const widgetNode = (await figma.getNodeByIdAsync(widgetId)) as WidgetNode;
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
  const loadLocalFont = () => {
    figma.listAvailableFontsAsync().then((fonts) => {
      setLocalFonts(fonts);
      fontsClean(fonts);
    });
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
   * Process messages received from the UI
   * @param msg - Message object from UI
   */
  const handleGetUiMessage = (msg: msgType) => {
    if (msg.type === "setFamilyAndWeight") {
      setCheckedFamily(msg.data.family);
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
      // Handle binding variable to text style property
      console.log("Setting variable:", msg.variableId, "for style:", msg.styleId, "property:", msg.propertyType);
      
      try {
        // Find the text style to update
        const styleToUpdate = figma.getStyleById(msg.styleId) as TextStyle;
        if (!styleToUpdate) {
          console.error("Style not found:", msg.styleId);
          figma.closePlugin();
          return;
        }
        
        // Get the variable reference
        const variableToApply = figma.variables.getVariableById(msg.variableId);
        if (!variableToApply) {
          console.error("Variable not found:", msg.variableId);
          figma.closePlugin();
          return;
        }
        
        // Map property type to the correct field for a TextStyle
        let field: string;
        switch (msg.propertyType) {
          case "fontFamily":
            field = "fontFamily";
            break;
          case "fontStyle":
          case "fontWeight":
            field = "fontStyle";
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
            console.warn(`Property type "${msg.propertyType}" not supported for variable binding`);
            figma.closePlugin();
            return;
        }
        
        // Use setBoundVariable to bind the variable to the style
        // @ts-ignore - Bypassing type checking because Figma API typings might be outdated
        styleToUpdate.setBoundVariable(field, variableToApply);
        
        console.log(`Successfully bound variable to ${field} of style ${styleToUpdate.name}`);
      } catch (error) {
        console.error("Failed to bind variable:", error);
      }
      
      figma.closePlugin();
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
      // Extract modes and values
      const modes = await figma.variables.getVariableCollectionByIdAsync(
        data.variableCollectionId
      );
      
      if (modes) {
        // Get default mode ID
        const defaultMode = modes.modes.find((mode) => mode.name === "Default");
        
        return {
          id: data.id,
          name: data.name,
          key: data.key,
          variableCollectionId: data.variableCollectionId,
          scopes: data.scopes,
          valuesByMode: data.valuesByMode,
          defaultModeId: defaultMode?.modeId || "",
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
        height: size?.height || 400,
        title: name,
      });
      figma.ui.postMessage({ moduleName, data });
    });
    
  /**
   * Cập nhật thông tin tiến trình trong UI mà không gọi lại figma.showUI
   * Chỉ gửi message tới UI đã hiển thị
   */
  const updateProgressUi = ({ moduleName, data }: Omit<ShowUiParams, 'name' | 'size'>) => {
    figma.ui.postMessage({ moduleName, data });
  };

  return (
    <AutoLayout
      width={mode === "edit" ? 1980 : 1200}
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
          <Text fontSize={46} fontWeight={700}>
            {mode === "edit" ? "FONT STYLES MANAGER" : "FONT STYLES LIST"}
          </Text>
          {mode === "edit" ? (
            <Text fontSize={18}>Choose styles you want to change</Text>
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
        x={mode === "edit" ? 1995 : 1215}
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
          <Rectangle width={"fill-parent"} height={1} fill={"#888"} />
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
          <Rectangle width={"fill-parent"} height={1} fill={"#888"} />
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
