import React, { Children, useEffect, useState } from "react";
import "./styles/EditShowGroup.css";

import type { textStyleType } from "../widget-src/code";

type groupsType = textStyleType & {
	groups: string[];
	onlyName: string;
};

type levelsType = {
	groupName: string;
	levelNumber: number;
	children: textStyleType[];
};

type showGroupType = {
	id: number;
	isShow: boolean;
};

const getGroups = (name: string) => {
	if (name.includes("/")) {
		const groups: string[] = name.split("/");
		groups.pop(); // remove name from groups
		return groups;
	} else {
		return [] as string[];
	}
};

const getOnlyName = (name: string) => {
	if (name.includes("/")) {
		const onlyName: string | undefined = name.split("/").pop();
		return onlyName ? onlyName : "";
	} else {
		return name;
	}
};

const EditShowGroup = ({ data }: { data: textStyleType[] }) => {
	const [groups, setGroups] = useState<groupsType[]>([]);

	const [levels, setLevels] = useState<levelsType[]>([]);

	const [showStyle, setShowStyle] = useState<(textStyleType & { isShow: Boolean })[]>([]);

	const [showGroup, setShowGroup] = useState<showGroupType[]>([]);
	const [isShowAll, setIsShowAll] = useState<boolean>(true);

	useEffect(() => {
		const value: groupsType[] = data.map((style) => ({
			...style,
			groups: getGroups(style.name),
			onlyName: getOnlyName(style.name),
		}));
		const showStyleData = data.map((textStyle) => ({ ...textStyle, isShow: true }));
		setShowStyle(showStyleData);
		setGroups(value);
		setShowGroup(Array.from(Array(10).keys()).map((index) => ({ id: index, isShow: true })));
	}, [data]);

	useEffect(() => {
		// console.log(groups);
		const maxLevels = groups.reduce((max, style) => (style.groups.length > max ? style.groups.length : max), 0);
		const levels: levelsType[] = [];

		let groupName = "";
		for (const style of groups) {
			if (groupName !== style.groups.reduce((name, groupName) => name + "/" + groupName, "No group")) {
				groupName = style.groups.reduce((name, groupName) => name + "/" + groupName, "No group");
				const children = groups.filter(
					(style) => style.groups.reduce((name, groupName) => name + "/" + groupName, "No group") === groupName
				);
				const levelNumber = style.groups.length;
				levels.push({ groupName, children, levelNumber });
			}
		}
		levels.sort((a, b) => (a.levelNumber - b.levelNumber && b.groupName.startsWith(a.groupName) ? -1 : 1));
		setLevels(levels);
		// console.log(maxLevels, levels);
	}, [groups]);

	const isShowStyle = (id: string) => !!showStyle.find((style) => style.id === id && style.isShow);

	const isShowGroup = (id: number) => !!showGroup.find((group) => group.id === id && group.isShow);

	const toggleShowGroup = (id: number, children: textStyleType[]) =>
		setShowGroup((prev) =>
			prev.map((group) => {
				if (group.id === id) {
					children.forEach((child) => (!group.isShow ? handleShowStyle(child) : handleUnShowStyle(child)));
					return { ...group, isShow: !group.isShow };
				} else {
					return group;
				}
			})
		);

	const toggleShowStyle = (style: textStyleType) =>
		setShowStyle((prev) =>
			prev.map((prevStyle) => (prevStyle.id === style.id ? { ...prevStyle, isShow: !prevStyle.isShow } : prevStyle))
		);

	const handleUnShowStyle = (style: textStyleType) =>
		setShowStyle((prev) =>
			prev.map((prevStyle) => (prevStyle.id === style.id ? { ...prevStyle, isShow: false } : prevStyle))
		);

	const handleShowStyle = (style: textStyleType) =>
		setShowStyle((prev) => prev.map((prevStyle) => (prevStyle.id === style.id ? { ...prevStyle, isShow: true } : prevStyle)));

	const handleClickStyle = (style: textStyleType) => toggleShowStyle(style);

	const handleClickGroup = (children: textStyleType[], index: number) => {
		toggleShowGroup(index, children);
	};

	const toggleShowAll = () => {
		if (!isShowAll) {
			setShowGroup(Array.from(Array(10).keys()).map((index) => ({ id: index, isShow: true })));
			setShowStyle((prev) => prev.map((prevStyle) => ({ ...prevStyle, isShow: true })));
			setIsShowAll(true);
		} else {
			setShowGroup(Array.from(Array(10).keys()).map((index) => ({ id: index, isShow: false })));
			setShowStyle((prev) => prev.map((prevStyle) => ({ ...prevStyle, isShow: false })));
			setIsShowAll(false);
		}
	};
	const groupsAndStylesNavigation = levels.map((level, index) => (
		<ul key={index} style={{ paddingLeft: 16 + "px" }} className="group">
			<li onClick={() => handleClickGroup(level.children, index)} className="item">
				<input className="switch" type="checkbox" checked={isShowGroup(index)} />{" "}
				<label>{level.groupName.replace("No group/", "")}</label>
			</li>
			<ul style={{ paddingLeft: 16 + "px" }}>
				{level.children.map((child) => (
					<li className="item" key={child.id} onClick={() => handleClickStyle(child)}>
						<input type="checkbox" checked={isShowStyle(child.id)} /> <label>{getOnlyName(child.name)}</label>
					</li>
				))}
			</ul>
		</ul>
	));

	const handleClose = () =>
		parent.postMessage(
			{
				pluginMessage: {
					type: "setShowDuplicateTypoGroup",
					data: showStyle.filter((style) => style.isShow === true),
				},
			},
			"*"
		);

	const handleSave = () =>
		parent.postMessage(
			{
				pluginMessage: {
					type: "setShowTypoGroup",
					data: showStyle.filter((style) => style.isShow === true),
				},
			},
			"*"
		);
	return (
		<div className="edit-show">
			<span className="title">Choice of group display or Typography style</span>
			<div className="style-list">
				<li
					onClick={() => toggleShowAll()}
					style={{ padding: "8px 16px", background: "#eee", width: "100%", cursor: "pointer" }}
				>
					<input className="switch" type="checkbox" checked={isShowAll} />{" "}
					<label>{!isShowAll ? "Choice all style" : "Unchosen all style"}</label>
				</li>
				{groupsAndStylesNavigation}
			</div>
			<div className="action">
				<button className="close" onClick={() => handleClose()}>
					Apply to new widget
				</button>
				<button className="ok" onClick={() => handleSave()}>
					Apply
				</button>
			</div>
		</div>
	);
};

export default EditShowGroup;
