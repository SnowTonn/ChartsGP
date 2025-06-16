import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import ChartCreator from "./components/ChartCreator";
import ChartList from "./components/ChartList";

function App() {
  const [loadedData, setLoadedData] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      <h1>Excel/CSV Chart Builder</h1>
      <FileUploader onDataLoaded={setLoadedData} />
      {loadedData && <ChartCreator data={loadedData} />}
      <hr />
      <ChartList />
    </div>
  );
}

export default App;
