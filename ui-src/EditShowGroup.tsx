import React, { useEffect, useState } from "react";
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

type stylesGroupType = {
	name: string;
	styles: textStyleType[];
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

	const [showStyle, setShowStyle] = useState<textStyleType[]>(data);

	const isShowStyle = (id: string) => (showStyle.find((style) => style.id === id) ? true : false);
	useEffect(() => {
		const value: groupsType[] = data.map((style) => ({
			...style,
			groups: getGroups(style.name),
			onlyName: getOnlyName(style.name),
		}));

		setGroups(value);
	}, [data]);

	useEffect(() => {
		// console.log(groups);
		const maxLevels = groups.reduce((max, style) => (style.groups.length > max ? style.groups.length : max), 0);
		const levels: levelsType[] = [];

		let groupName = "";
		for (const style of groups) {
			if (groupName !== style.groups.reduce((name, groupName) => name + "/" + groupName, "all")) {
				groupName = style.groups.reduce((name, groupName) => name + "/" + groupName, "all");
				const children = groups.filter(
					(style) => style.groups.reduce((name, groupName) => name + "/" + groupName, "all") === groupName
				);
				const levelNumber = style.groups.length;
				levels.push({ groupName, children, levelNumber });
			}
		}
		levels.sort((a, b) => (a.levelNumber - b.levelNumber && b.groupName.startsWith(a.groupName) ? -1 : 1));
		setLevels(levels);
		console.log(maxLevels, levels);
	}, [groups]);

	const groupsNavigation = levels.map((level, index) => (
		<div key={index} style={{ marginLeft: level.levelNumber * 12 + "px" }}>
			<p>{level.groupName}</p>
			<div style={{ marginLeft: "16px" }}>
				{level.children.map((child) => (
					<li key={child.id} style={{ marginLeft: "16px" }}>
						<input id={child.id} type="checkbox" name={child.id} defaultChecked={isShowStyle(child.id)} />{" "}
						<label htmlFor={child.id}>{getOnlyName(child.name) }</label>
					</li>
				))}
			</div>
		</div>
	));

	return (
		<div className="edit-show">
			<span>edit show</span>
			<div>{groupsNavigation}</div>
		</div>
	);
};

export default EditShowGroup;
