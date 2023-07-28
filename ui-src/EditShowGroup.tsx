import React, { useEffect, useState } from "react";
import "./styles/EditShowGroup.css"

import type {textStyleType} from "../widget-src/code"

type groupsType = {
	name: string,
	groups: string,
	styles: textStyleType[]
}

function EditShowGroup({data}:{data: textStyleType[]}) {

	const [groups, setGroups] = useState<any>([])
    useEffect(() => console.log(data),[])
	return (
		<div className="edit-show">
			edit show
		</div>
	);
}

export default EditShowGroup;
