import React, {  useState } from "react";
import "./styles/App.css";
import BuyMeACoffee from "./BuyMeACoffee";
import ChoiceFont from "./ChoiceFont";
import EditShowGroup from "./EditShowGroup";
// import { cleanFontType } from "../widget-src/code";

function App() {
	const [module, setModule] = useState<string>("");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any>();

	onmessage = (e) => {
		setModule(e.data.pluginMessage.moduleName);
		setData(e.data.pluginMessage.data);
	};

	return (
		<div className="App">
			{module === "buyCoffee" && <BuyMeACoffee />}
			{module === "choiceFont" && <ChoiceFont data={data} />}
			{module === "editShowGroup" && <EditShowGroup data={data} />}
		</div>
	);
}

export default App;
