import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./styles/ChoiceFont.css";
import fontFamilySvg from "./styles/assets/font-family.png";
import fontWeightSvg from "./styles/assets/font-weight.png";

const ChoiceFont = (data: any) => {
	const [inputFontName, setInputFontName] = useState<any>("");
	const [listFontWeight, setListFontWeight] = useState<any>("");
	const [inputFontWeight, setInputFontWeight] = useState<any>("");

	const handleClose = () => parent.postMessage({ pluginMessage: { type: "close" } }, "*");

	const handleSave = () =>
		parent.postMessage(
			{
				pluginMessage: {
					type: "setFamilyAndWeight",
					data: { family: inputFontName.value, weight: inputFontWeight.value },
				},
			},
			"*"
		);

	const getFontWeightList = (font: string) => data?.data.find((fontList: any) => fontList.family === font).styles;
	const getFontWeightStyleAndWidth = (input: string) => {
		const fontWeights = {
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

		const fontStyles = ["italic"];

		const fontWidths = ["condensed"];

		const words = input.toLowerCase().split(" ");

		let fontWeight = 400;
		let fontStyle;
		let fontWidth;

		for (const word of words) {
			if (word in fontWeights) {
				fontWeight = fontWeights[word as keyof typeof fontWeights];
			} else if (fontStyles.includes(word)) {
				fontStyle = word;
			} else if (fontWidths.includes(word)) {
				fontWidth = word;
			}
		}

		return { fontWeight, fontStyle, fontWidth };
	};

	const sortFontNames = (fontNames: any) => {
		return fontNames.sort((a: string, b: string) => {
			const aInfo = getFontWeightStyleAndWidth(a);
			const bInfo = getFontWeightStyleAndWidth(b);
			if (aInfo.fontStyle !== bInfo.fontStyle) {
				return aInfo.fontStyle === undefined ? -1 : 1;
			}
			if (aInfo.fontWidth !== bInfo.fontWidth) {
				return aInfo.fontWidth === undefined ? -1 : 1;
			}

			if (aInfo.fontWeight !== bInfo.fontWeight) {
				return aInfo.fontWeight - bInfo.fontWeight;
			}

			return a.localeCompare(b);
		});
	};

	const mapFontWeights = (data: any[]) => data.map((weight) => ({ value: weight, label: weight }));
	useEffect(() => {
		if (inputFontName !== "") {
			setListFontWeight(mapFontWeights(sortFontNames(getFontWeightList(inputFontName?.value))));
		}
		// console.log(inputFontName);
	}, [inputFontName]);

	const fontList = data?.data.map((font: any) => ({ value: font.family, label: font.family }));

	const handleSelectFont = (data: any) => setInputFontName(data);
	const handleSelectWeight = (data: any) => setInputFontWeight(data);

	return (
		<div id="choiceFont">
			<div className="font-name input">
				<img className="icon" src={fontFamilySvg} alt="font-family" />
                {/* <FontFamilySvg className="icon"/> */}
				<Select
					classNamePrefix="react-select"
					options={fontList}
					placeholder="Select font"
					value={inputFontName}
					onChange={handleSelectFont}
					isSearchable={true}
				/>
			</div>
			{listFontWeight && (
				<div className="font-weight input">
					<img className="icon" src={fontWeightSvg} alt="font-weight" />
					<Select
						classNamePrefix="react-select"
						options={listFontWeight}
						placeholder="Choice style"
						value={inputFontWeight}
						onChange={handleSelectWeight}
						// isSearchable={true}
					/>

					{/* <select className="weight-select" placeholder="Choice style" /> */}
				</div>
			)}
			<div className="action">
				<button className="close" onClick={() => handleClose()}>
					Cancel
				</button>
				<button className="ok" onClick={() => handleSave()}>
					OK
				</button>
			</div>
		</div>
	);
};

export default ChoiceFont;
