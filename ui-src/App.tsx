import React, { useState } from "react";
import "./styles/App.css";
import BuyMeACoffee from "./BuyMeACoffee";
import ChoiceFont from "./ChoiceFont";
import EditShowGroup from "./EditShowGroup";
import EditShowType from "./EditShowType";
import ChoiceVariable from "./ChoiceVariable";
// import { cleanFontType } from "../widget-src/code";

function App() {
  const [module, setModule] = useState<string>("");
  const [data, setData] = useState<any>();

  onmessage = (e) => {
    console.log("Received message:", e.data.pluginMessage);
    setModule(e.data.pluginMessage.moduleName);
    setData(e.data.pluginMessage.data);
  };

  console.log("Current module:", module);
  console.log("Current data:", data);

  return (
    <div className="App">
      {module === "buyCoffee" && <BuyMeACoffee />}
      {module === "choiceFont" && <ChoiceFont data={data} />}
      {module === "editShowGroup" && <EditShowGroup data={data} />}
      {module === "editTypeList" && <EditShowType data={data} />}
      {module === "choiceVariable" && <ChoiceVariable data={data} />}
    </div>
  );
}

export default App;
