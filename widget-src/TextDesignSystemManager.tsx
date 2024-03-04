const { widget } = figma;
const { AutoLayout, Text, Rectangle, useSyncedState, Input, SVG, Fragment } = widget;

import { cleanFontType, textStyleType } from "./code";
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
} from "./svg";

type textDesignManagerType = {
	textStyles: textStyleType[];
	showUi: (
		moduleName: string,
		name: string,
		data?: any,
		size?: {
			width: number;
			height: number;
		}
	) => Promise<unknown>;
	getLocalTextStyle: () => void;
	setHasReloadLocalFont: (newValue: boolean | ((currValue: boolean) => boolean)) => void;
	localFonts: Font[];
	cleanFont: cleanFontType[];
	isOpenSearchBar: boolean;
};
const TextDesignManager = ({ value }: { value: textDesignManagerType }) => {
	const { textStyles, showUi, getLocalTextStyle, setHasReloadLocalFont, localFonts, cleanFont, isOpenSearchBar } = value;
	const [filterStyles, setFilterStyles] = useSyncedState<textStyleType[]>("filterStyles", []);

	const [searchName, setSearchName] = useSyncedState("searchName", "");
	const [searchGroup, setSearchGroup] = useSyncedState("searchGroup", "");
	const [searchFamily, setSearchFamily] = useSyncedState("searchFamily", "");
	const [searchStyle, setSearchStyle] = useSyncedState("searchStyle", "");
	const [searchFontSize, setSearchFontSize] = useSyncedState("searchFontSize", "");
	const [searchLineHeight, setSearchLineHeight] = useSyncedState<LineHeight | { unit: "" }>("searchLineHeight", {
		unit: "",
	});

	const [checkedGroup, setCheckedGroup] = useSyncedState("checkedGroup", "");
	const [checkedFamily, setCheckedFamily] = useSyncedState("checkedFamily", "");
	const [checkedStyle, setCheckedStyle] = useSyncedState("checkedStyle", "");
	const [checkedFontSize, setCheckedFontSize] = useSyncedState("checkedFontSize", "");
	const [checkedLineHeight, setCheckedLineHeight] = useSyncedState<LineHeight | { unit: "" }>("checkedLineHeight", {
		unit: "",
	});

	const [stylesChecked, setStylesChecked] = useSyncedState<string[]>("stylesChecked", []);
	const [hasCheckAll, setHasCheckAll] = useSyncedState<boolean>("hasCheckAll", false);

	const [cacheStyle, setCacheStyle] = useSyncedState<textStyleType[]>("cacheStyle", []);

	const handleCheck = (id: string) => {
		const hasStyleInList = stylesChecked.find((idStyle) => idStyle === id) ? true : false;
		if (hasStyleInList) {
			if (stylesChecked.length === filterStyles.length) {
				setHasCheckAll(false);
			}
			setStylesChecked((prev) => prev.filter((idStyle) => idStyle !== id));
		} else {
			if (stylesChecked.length === filterStyles.length - 1) {
				setHasCheckAll(true);
			}
			setStylesChecked((prev) => [...prev, id]);
		}
	};

	const handleCheckAll = () => {
		setHasCheckAll((prev) => {
			if (!prev) {
				setStylesChecked(filterStyles.map((style) => style.id));
			} else {
				setStylesChecked([]);
			}

			return !prev;
		});
	};

	const updateStyle = async () => {
		for (let style of filterStyles) {
			try {
				const cache = cacheStyle.find((i) => i.id === style.id);
				if (cache) {
					const textStyle: TextStyle = await figma.getStyleByIdAsync(style.id) as TextStyle;
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
					if (cache.fontName.family !== style.fontName.family || cache.fontName.style !== style.fontName.style) {
						await figma.loadFontAsync({ ...cache.fontName }).then((res) => {
							textStyle.fontName = { ...cache.fontName };
							isUpdate = true;
						});
					}
					if (cache.fontSize !== style.fontSize) {
						await figma.loadFontAsync({ ...cache.fontName }).then((res) => {
							textStyle.fontSize = cache.fontSize;
							isUpdate = true;
						});
					}
					if (cache.lineHeight !== style.lineHeight) {
						await figma.loadFontAsync({ ...cache.fontName }).then((res) => {
							textStyle.lineHeight = cache.lineHeight;
							isUpdate = true;
						});
					}
					if (isUpdate) {
						figma.notify("✓ " + textStyle.name + "Style has update", {timeout: 300});
					}
				}
			} catch (err) {
				figma.notify("✕ " + err, { timeout: 3000, error: true });
			}
		}
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
		setFilterStyles(textStyles);
		setCacheStyle(textStyles);
		setStylesChecked([]);
		setHasCheckAll(false);
		setHasReloadLocalFont(true);
	};

	const checkFontName = (font: any) => {
		// const regex = new RegExp(font.fontName.family, "i");
		const res = localFonts.filter((fontLocal) => font.fontName.family === fontLocal.fontName.family);
		// console.log(res)
		if (res.length !== 0) {
			// const regex = new RegExp(font.fontName.style, "i");
			const style = res.filter((fontLocal) => font.fontName.style === fontLocal.fontName.style);
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
	}) => {
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
		});
	};

	const handleChangeSelectedStyle = () => {
		// console.log(stylesChecked)
		if (stylesChecked.length !== 0) {
			for (let style of stylesChecked) {
				const cache = cacheStyle.find((i) => i.id === style) as textStyleType;
				// console.log(cache);
				if (cache) {
					if (checkedGroup != "") {
						cache.name = checkedGroup + "/" + getNameStyle(cache.name);
					}
					if (checkedFamily != "") {
						cache.fontName = { ...cache.fontName, family: checkedFamily };
					}
					if (checkedStyle != "") {
						cache.fontName = { ...cache.fontName, style: checkedStyle };
					}
					if (checkedFontSize != "" || isNaN(Number(checkedFontSize))) {
						cache.fontSize = Number(checkedFontSize);
					}
					if (checkedLineHeight.unit != "") {
						cache.lineHeight = checkedLineHeight;
					}
					setCacheStyle((prev) => prev.map((i) => (i.id === style ? cache : i)));
				}
			}
		}
	};

	const getLineHeight = (data: string) => {
		const unit = data === "auto" ? "AUTO" : data.endsWith("px") ? "PIXELS" : data.endsWith("%") ? "PERCENT" : "";
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

	return (
		<Fragment>
			{isOpenSearchBar && (
				<AutoLayout spacing={12} verticalAlignItems={"end"} width={"fill-parent"}>
					<AutoLayout
						padding={10}
						verticalAlignItems={"center"}
						horizontalAlignItems={"center"}
						onClick={() => clearSearch()}
						tooltip={"Clear search"}
					>
						<SVG src={closeSvg} />
					</AutoLayout>
					<AutoLayout spacing={12} width={1458} verticalAlignItems={"end"}>
						<AutoLayout width={470} spacing={12} direction={"vertical"}>
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
							width={195}
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
							width={373}
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
							width={175}
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
							width={195}
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
								onTextEditEnd={(e) => setSearchLineHeight(getLineHeight(e.characters))}
								placeholder="Line height"
							/>
						</AutoLayout>
					</AutoLayout>
					<AutoLayout
						hoverStyle={{ fill: "#1A7CF0" }}
						onClick={() => handleSearch()}
						width={"fill-parent"}
						padding={{ top: 14, bottom: 14, right: 24, left: 24 }}
						verticalAlignItems={"center"}
						horizontalAlignItems={"center"}
						// height={"fill-parent"}
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
					<AutoLayout width={"fill-parent"} verticalAlignItems={"center"} spacing={24} padding={{ top: 12 }}>
						<Text fontSize={24}>Change all selected styles</Text>
						<Rectangle width={"fill-parent"} height={1} fill={"#ccc"} />
					</AutoLayout>
					<AutoLayout direction={"vertical"} width={"fill-parent"} spacing={12}>
						<AutoLayout spacing={24} verticalAlignItems={"center"} width={"fill-parent"} overflow={"scroll"}>
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
										showUi("choiceFont", "Choice in font list", cleanFont, { width: 350, height: 400 })
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
											? checkedLineHeight.unit !== "AUTO" && checkedLineHeight.value
												? checkedLineHeight.unit === "PIXELS"
													? checkedLineHeight.value.toString() + "px"
													: checkedLineHeight.value.toString() + "%"
												: "auto"
											: ""
									}
									onTextEditEnd={(e) => setCheckedLineHeight(getLineHeight(e.characters))}
									placeholder="Change line height"
								/>
							</AutoLayout>
							<AutoLayout
								onClick={() => handleChangeSelectedStyle()}
								padding={{ top: 14, bottom: 14, right: 24, left: 24 }}
								verticalAlignItems={"center"}
								horizontalAlignItems={"center"}
								// height={"fill-parent"}
								cornerRadius={12}
								fill={"#0B68D6"}
							>
								<Text fontSize={24} fill={"#fff"}>
									Change selected
								</Text>
							</AutoLayout>
						</AutoLayout>
						<Text fill={"#F23131"}>
							Warning: If you change the font family, you should check the name of font style.
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
					<Text fontSize={24} fontFamily={"Roboto"} width={"fill-parent"} fill={"#eee"}>
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
					<Rectangle width={1} height={60} fill={"#ccc"} />
					<Text fontSize={24} fontFamily={"Roboto"} width={"fill-parent"} fill={"#eee"}>
						Description
					</Text>
				</AutoLayout>

				{/* table content */}
				<AutoLayout direction={"vertical"} spacing={0} width={"fill-parent"}>
					{filterStyles.length !== 0 && cacheStyle.length !== 0 && cacheStyle.length === filterStyles.length ? (
						filterStyles.map((style) => {
							// console.log(style)
							const cache = cacheStyle.find((i) => i.id === style.id) as textStyleType;
							const check = checkFontName(cache);
							// console.log(cache.lineHeight.value);
							return (
								<AutoLayout key={style.id} width={"fill-parent"} direction={"vertical"}>
									<AutoLayout
										verticalAlignItems={"center"}
										spacing={12}
										width={"fill-parent"}
										padding={{ left: 12, right: 12 }}
									>
										<CheckBox
											isCheck={stylesChecked.find((id) => id === style.id) ? true : false}
											onClick={() => handleCheck(style.id)}
										/>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<Input
											value={cache.name}
											onTextEditEnd={(e) => {
												setCacheStyle((prev) =>
													prev.map((i) => (i.id === style.id ? { ...i, name: e.characters } : i))
												);
											}}
											placeholder="Type name"
											fontSize={22}
											fontFamily={"Roboto"}
											width={450}
										/>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<AutoLayout width={"fill-parent"} verticalAlignItems={"center"} spacing={6}>
											{!check.check && check.status === "family" && <SVG src={warningSvg} />}
											<Input
												value={cache.fontName.family}
												onTextEditEnd={(e) => {
													setCacheStyle((prev) =>
														prev.map((i) =>
															i.id === style.id
																? {
																		...i,
																		fontName: { ...i.fontName, family: e.characters },
																  }
																: i
														)
													);
												}}
												fontSize={22}
												fontFamily={"Roboto"}
												width={"fill-parent"}
											/>
										</AutoLayout>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<AutoLayout width={360} verticalAlignItems={"center"} spacing={6}>
											{!check.check && <SVG src={warningSvg} />}
											<Input
												value={cache.fontName.style}
												onTextEditEnd={(e) => {
													setCacheStyle((prev) =>
														prev.map((i) =>
															i.id === style.id
																? {
																		...i,
																		fontName: { ...i.fontName, style: e.characters },
																  }
																: i
														)
													);
												}}
												fontSize={22}
												fontFamily={"Roboto"}
												width={"fill-parent"}
											/>
											<Text fontSize={20} fill={"#666"} fontFamily={"Roboto"} horizontalAlignText={"right"}>
												{getFontWeightValue(cache.fontName.style).fontWeight}
											</Text>
										</AutoLayout>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<Input
											value={cache.fontSize.toString()}
											onTextEditEnd={(e) => {
												setCacheStyle((prev) =>
													prev.map((i) =>
														i.id === style.id ? { ...i, fontSize: Number(e.characters) } : i
													)
												);
											}}
											placeholder="Type size"
											fontSize={22}
											fontFamily={"Roboto"}
											width={160}
										/>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<AutoLayout width={180} verticalAlignItems={"center"} spacing={6}>
											{/* <Text fontSize={22} fontFamily={"Roboto"} horizontalAlignText={"left"}>
												{cache.lineHeight.value ? cache.lineHeight.value : "Auto"}
											</Text> */}
											<Input
												value={
													cache.lineHeight.unit !== "AUTO" && cache.lineHeight.value
														? cache.lineHeight.unit === "PIXELS"
															? cache.lineHeight.value.toString() + "px"
															: parseFloat(cache.lineHeight.value.toPrecision(3).toString()) + "%"
														: "auto"
												}
												onTextEditEnd={(e) => {
													const data = e.characters.replaceAll(" ", "").toLowerCase();
													const value = getLineHeight(data);

													// console.log(value);
													if (value.unit !== "") {
														setCacheStyle((prev) =>
															prev.map((i) =>
																i.id === style.id
																	? {
																			...i,
																			lineHeight: { ...value },
																	  }
																	: i
															)
														);
													}
												}}
												fontSize={22}
												fontFamily={"Roboto"}
												width={"fill-parent"}
											/>
											<Text fontSize={20} fill={"#666"} fontFamily={"Roboto"} horizontalAlignText={"right"}>
												{cache.lineHeight.unit !== "AUTO" && cache.lineHeight.value
													? cache.lineHeight.unit === "PERCENT"
														? parseFloat((cache.lineHeight.value / 100).toPrecision(3))
														: ""
													: ""}
											</Text>
										</AutoLayout>
										<Rectangle width={1} height={50} fill={"#ccc"} />
										<Input
											value={cache.description}
											onTextEditEnd={(e) => {
												setCacheStyle((prev) =>
													prev.map((i:textStyleType) => (i.id === style.id ? { ...i, description: e.characters } : i))
												);
											}}
											placeholder="Type description"
											fontSize={22}
											fontFamily={"Roboto"}
											width={"fill-parent"}
										/>
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
			<AutoLayout spacing={"auto"} width={"fill-parent"}>
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
						{textStyles.length === 0 ? "Load local text styles" : "Reload local text styles"}
					</Text>
				</AutoLayout>

				<AutoLayout
					padding={24}
					fill={"#0B68D6"}
					cornerRadius={12}
					onClick={() => updateStyle()}
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
