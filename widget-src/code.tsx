const { widget } = figma;
const { AutoLayout, Text, Rectangle, useSyncedState, useEffect, SVG, usePropertyMenu, useWidgetId, Fragment } = widget;

import TextDesignList from "./TextDesignSystemList";
import TextDesignManager from "./TextDesignSystemManager";

import { coffeeSvg, searchActive, searchDisable, listViewActive, listViewDisable, listSvg } from "./svg";

export type msgType =
	| {
			type: "close";
	  }
	| {
			type: "setFamilyAndWeight";
			data: {
				family: any;
				weight: any;
			};
	  }
	| {
			type: "setShowTypoGroup";
			data: {
				group: any;
			};
	  };

export type textStyleType = {
	id: string;
	name: string;
	fontName: FontName;
	fontSize: number;
	lineHeight: LineHeight;
	description: string;
};

export type CleanFontType = {
	family: string;
	styles: string[];
};
function Widget() {
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

	const [mode, setMode] = useSyncedState<"edit" | "view">("mode", "edit");
	const [textStyles, setTextStyles] = useSyncedState<textStyleType[]>("textStyles", []);

	const [filterStyles, setFilterStyles] = useSyncedState<textStyleType[]>("filterStyles", []);

	const [checkedFamily, setCheckedFamily] = useSyncedState("checkedFamily", "");
	const [checkedStyle, setCheckedStyle] = useSyncedState("checkedStyle", "");

	const [cacheStyle, setCacheStyle] = useSyncedState<textStyleType[]>("cacheStyle", []);

	const [isFirstLoadFont, setIsFirstLoadFont] = useSyncedState("isFirstLoadFont", true);
	const [localFonts, setLocalFonts] = useSyncedState<Font[]>("localFonts", []);
	const [cleanFont, setCleanFont] = useSyncedState<CleanFontType[]>("cleanFont", []);

	const [showGroup, setShowGroup] = useSyncedState<string[]>("showGroup", []);

	const [hasReloadLocalFont, setHasReloadLocalFont] = useSyncedState("hasReloadLocalFont", false);

	const [isOpenSearchBar, setIsOpenSearchBar] = useSyncedState<boolean>("isOpenSearchBar", true);

	const widgetId = useWidgetId();

	const handleCloneWidget = (showGroup?: string[]) => {
		const widgetNode = figma.getNodeById(widgetId) as WidgetNode;
		const clonedWidget = widgetNode.clone();

		clonedWidget.setWidgetSyncedState({
			mode: "view",
			textStyles,
			filterStyles,
			checkedFamily,
			checkedStyle,
			cacheStyle,
			isFirstLoadFont,
		});
		// Position the cloned widget beside this widget
		widgetNode.parent!.appendChild(clonedWidget);
		clonedWidget.x = widgetNode.x + widgetNode.width + 250;
		clonedWidget.y = widgetNode.y;
	};

	const handleSetMode = () => setMode((prev) => (prev === "edit" ? "view" : "edit"));
	const modeOptions = [
		{ option: "edit", label: "Edit mode" },
		{ option: "view", label: "List mode" },
	];
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

	const loadLocalFont = () => {
		figma.listAvailableFontsAsync().then((fonts) => {
			setLocalFonts(fonts);
			fontsClean(fonts);
			// console.log(fonts)
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

	useEffect(() => {
		figma.ui.onmessage = (msg) => {
			// console.log(msg.type)
			handleGetUiMessage(msg);
		};
	});

	const handleGetUiMessage = (msg: msgType) => {
		if (msg.type === "setFamilyAndWeight") {
			// console.log(msg);
			setCheckedFamily(msg.data.family);
			setCheckedStyle(msg.data.weight);
			figma.closePlugin();
		}
		if (msg.type === "setShowTypoGroup") {
		}
		if (msg.type === "close") {
			// console.log("ok")
			figma.closePlugin();
		}
	};

	// const [findKeys, setFindKeys] = useSyncedState("findKeys", { family: "", style: "" });

	const toggleSearchBar = () => {
		setIsOpenSearchBar((prev) => !prev);
	};

	const fontsClean = (fonts: Font[]) => {
		let fontFamily: string = "";
		let data: CleanFontType[] = [];
		let fontStyles: string[] = [];
		for (let font of fonts) {
			if (fontFamily === font.fontName.family) {
				fontStyles.push(font.fontName.style);
			} else {
				if (fontFamily != "" && fontStyles.length != 0) {
					data.push({ family: fontFamily, styles: fontStyles });
				}
				fontStyles = [font.fontName.style];
				fontFamily = font.fontName.family;
			}
		}

		setCleanFont(data);
		// console.log(data);
	};

	const getLocalTextStyle = () => {
		const styles: TextStyle[] = figma.getLocalTextStyles();
		// console.log(styles);
		const data = styles ? styles.map((style) => getDataStyle(style.id) as textStyleType) : [];
		// console.log(data)
		setTextStyles(data);
		setCacheStyle(data);
		setFilterStyles(data);
	};

	const getDataStyle = (id: string) => {
		const data = figma.getStyleById(id) as TextStyle;

		if (data) {
			return {
				id: data?.id,
				name: data?.name,
				fontName: {
					family: data?.fontName?.family,
					style: data?.fontName?.style,
				},
				fontSize: data.fontSize,
				lineHeight: data.lineHeight,
				description: data.description,
			};
		} else {
			return null;
		}
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

	const showUi = (moduleName: string, name: string, data?: any, size?: { width: number; height: number }) =>
		new Promise((resolve) => {
			figma.showUI(__html__, {
				width: size?.width || 300,
				height: size?.height || 300,
				title: name,
			});
			figma.ui.postMessage({ moduleName, data });
		});

	return (
		<AutoLayout
			width={mode === "edit" ? 1800 : 1200}
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
			<AutoLayout width={"fill-parent"} horizontalAlignItems={"center"} direction={"vertical"} padding={{ bottom: 6 }}>
				<Text fontSize={46} fontWeight={700} onClick={() => handleCloneWidget()}>
					FONT STYLES MANAGER
				</Text>
				<Text fontSize={18}>{mode === "edit" ? "Choose styles you want to change" : "Typography list"}</Text>
			</AutoLayout>

			<AutoLayout positioning={"absolute"} x={mode === "edit" ? 1815 : 1215} y={120} width={82}>
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
							tooltip={isOpenSearchBar ? "Hidden search tool" : "Show search tool"}
						/>
					)}
					{mode === "view" && (
						<Fragment>
							<SVG
								src={listSvg}
								onClick={() =>
									showUi("editShowGroup", "Choice Group of Typo", textStyles, { width: 500, height: 650 })
								}
							/>
						</Fragment>
					)}
					<Rectangle width={"fill-parent"} height={1} fill={"#888"} />
					<SVG src={coffeeSvg} tooltip={"Buy me a coffee"} onClick={() => showUi("buyCoffee", "Buy me a coffee")} />
				</AutoLayout>
			</AutoLayout>

			{mode === "edit" && (
				<TextDesignManager
					value={{
						textStyles,
						showUi,
						getLocalTextStyle,
						setHasReloadLocalFont,
						localFonts,
						cleanFont,
						isOpenSearchBar,
					}}
				/>
			)}
			{mode === "view" && <TextDesignList value={{ textStyles, showGroup }} />}
		</AutoLayout>
	);
}

widget.register(Widget);
