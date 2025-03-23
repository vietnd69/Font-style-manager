import React, { useState, Suspense, lazy } from "react";
import "./styles/App.css";
// import { cleanFontType } from "../widget-src/code";

// Lazy load components
const BuyMeACoffee = lazy(() => import("./BuyMeACoffee"));
const ChoiceFont = lazy(() => import("./ChoiceFont"));
const EditShowGroup = lazy(() => import("./EditShowGroup"));
const EditShowType = lazy(() => import("./EditShowType"));
const ChoiceVariable = lazy(() => import("./ChoiceVariable"));
const Processing = lazy(() => import("./Processing"));

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
      <Suspense fallback={<div>Loading...</div>}>
        {module === "buyCoffee" && <BuyMeACoffee />}
        {module === "choiceFont" && <ChoiceFont data={data} />}
        {module === "editShowGroup" && <EditShowGroup data={data} />}
        {module === "editTypeList" && <EditShowType data={data} />}
        {module === "choiceVariable" && <ChoiceVariable data={data} />}
        {module === "processing" && <Processing data={data} />}
      </Suspense>
    </div>
  );
}

export default App;
