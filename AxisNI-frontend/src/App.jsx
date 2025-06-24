import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import ChartCreator from "./components/ChartCreator";
// import ChartList from "./components/ChartList";
import logo from "./components/assets/LogoEF.png";
//import logo1 from "./components/assets/FA.png";


function App() {
  const [loadedData, setLoadedData] = useState(null);

  return (
    <div
      style={{
        width: "100%",
        padding: "20px 40px",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#333",
        boxSizing: "border-box",
      }}
    >
      {/* Header Section */}
      <header
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <img
            src={logo}
            alt="Faculty of Information Technology"
            style={{ height: 60, objectFit: "contain" }}
          />
          {/* <img
            src={logo1}
            alt="Faculty of Administration"
            style={{ height: 60, objectFit: "contain" }}
          /> */}
        </div>
        <h1 style={{ fontSize: "1.6rem", margin: "10px 0" }}>
          Excel/CSV Chart Builder
        </h1>
        <p style={{ color: "#666", fontSize: "0.95rem" }}>
          Upload your dataset and create visual insights in seconds.
        </p>
      </header>

      {/* Upload Section */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
          backgroundColor: "#fff",
        }}
      >
        
        {/* <label style={{ fontWeight: 600, marginBottom: "8px", display: "block" }}>
          Supported formats:{" "}
          <span style={{ fontWeight: "normal" }}>Excel (.xlsx) and CSV (.csv)</span>
        </label> */}
        <FileUploader onDataLoaded={setLoadedData} />
      </section>

      {/* Chart Section */}
      {loadedData && (
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
            backgroundColor: "#fff",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
            2️⃣ Create Your Chart
          </h2>
          <ChartCreator data={loadedData} />
        </section>
      )}
    </div>
  );
}

export default App;
