import React, { useState } from "react";
import { uploadExcel, uploadCsv, getSheetNames } from "../services/api";
import ChartCreator from "./ChartCreator";

export default function FileUploader() {
  const [fileEntries, setFileEntries] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [showDataPreview, setShowDataPreview] = useState(false);

  // Array of chart configs: { id, title, xKey, yKey, drilldownKeys }
  const [charts, setCharts] = useState([]);

  const handleFilesChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newEntries = [];

    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop().toLowerCase();
      const fileType = ext === "csv" ? "csv" : "excel";
      let sheetNames = [];

      if (fileType === "excel") {
        try {
          const res = await getSheetNames(file);
          sheetNames = res.data.sheets || [];
        } catch {
          alert(`Failed to get sheet names for ${file.name}`);
        }
      }

      newEntries.push({
        file,
        fileType,
        sheetIndex: 0,
        range: "A1:Z50",
        sheetNames,
      });
    }

    setFileEntries(newEntries);
    setMergedData([]);
    setCharts([]); // reset charts
  };

  const updateEntry = (index, field, value) => {
    setFileEntries((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleUpload = async () => {
    const datasets = [];

    for (let i = 0; i < fileEntries.length; i++) {
      const { file, fileType, sheetIndex, range } = fileEntries[i];
      try {
        const res =
          fileType === "excel"
            ? await uploadExcel(file, sheetIndex, range)
            : await uploadCsv(file);

        const data = res.data;

        if (Array.isArray(data)) {
          // Prefix columns to avoid collisions
          const prefixed = data.map((row) => {
            const newRow = {};
            for (const [key, value] of Object.entries(row)) {
              newRow[`F${i + 1}_${key}`] = value;
            }
            return newRow;
          });
          datasets.push(prefixed);
        }
      } catch {
        alert(`Upload failed for ${file.name}`);
      }
    }

    // Merge datasets horizontally by row index
    const maxRows = Math.max(...datasets.map((d) => d.length));
    const merged = [];

    for (let i = 0; i < maxRows; i++) {
      const row = {};
      for (const dataset of datasets) {
        const currentRow = dataset[i] || {};
        Object.assign(row, currentRow);
      }
      merged.push(row);
    }

    setMergedData(merged);
    setShowDataPreview(true);

    // Initialize with 1 empty chart config
    setCharts([{ id: 1, title: "Chart 1", xKey: "", yKey: "", drilldownKeys: [] }]);
  };

  // Add a new blank chart config
  const addChart = () => {
    setCharts((prev) => [
      ...prev,
      { id: prev.length + 1, title: `Chart ${prev.length + 1}`, xKey: "", yKey: "", drilldownKeys: [] },
    ]);
  };

  // Remove chart by id
  const removeChart = (id) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  };

  // Update chart config
  const updateChart = (id, newConfig) => {
    setCharts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...newConfig } : c))
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Upload and Combine Data (Side-by-Side)</h3>

      <input type="file" multiple onChange={handleFilesChange} />

      {fileEntries.map((entry, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginTop: 10,
            borderRadius: 6,
          }}
        >
          <strong>{entry.file.name}</strong>
          <div>
            <label>File Type:</label>
            <select
              value={entry.fileType}
              onChange={(e) => updateEntry(idx, "fileType", e.target.value)}
            >
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          {entry.fileType === "excel" && entry.sheetNames.length > 0 && (
            <>
              <div>
                <label>Sheet:</label>
                <select
                  value={entry.sheetIndex}
                  onChange={(e) =>
                    updateEntry(idx, "sheetIndex", Number(e.target.value))
                  }
                >
                  {entry.sheetNames.map((name, i) => (
                    <option key={i} value={i}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Range:</label>
                <input
                  type="text"
                  value={entry.range}
                  onChange={(e) => updateEntry(idx, "range", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      ))}

      {fileEntries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button onClick={handleUpload}>Upload and Merge</button>
        </div>
      )}

      {mergedData.length > 0 && (
        <>
          <div style={{ marginTop: 16 }}>
            <label>
              <input
                type="checkbox"
                checked={showDataPreview}
                onChange={() => setShowDataPreview((prev) => !prev)}
              />{" "}
              Show Merged Data
            </label>
          </div>

          {showDataPreview && (
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table border="1" cellPadding={5}>
                <thead>
                  <tr>
                    {Object.keys(mergedData[0] || {}).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mergedData.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <h3>Charts</h3>
            <button onClick={addChart}>+ Add Chart</button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 16,
                marginTop: 12,
              }}
            >
              {charts.map(({ id, title, xKey, yKey, drilldownKeys }) => (
                <div
                  key={id}
                  style={{
                    border: "1px solid #999",
                    padding: 10,
                    borderRadius: 6,
                    background: "#fafafa",
                    position: "relative",
                    minWidth: 350,
                    minHeight: 400,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <button
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      cursor: "pointer",
                      fontSize: 18,
                      border: "none",
                      background: "transparent",
                      color: "#555",
                    }}
                    onClick={() => removeChart(id)}
                    title="Remove chart"
                  >
                    &times;
                  </button>

                  <ChartCreator
                    data={mergedData}
                    onSave={(newTitle) => updateChart(id, { title: newTitle })}
                    chartTypeInitial="column"
                    titleInitial={title}
                    xKeyInitial={xKey}
                    yKeyInitial={yKey}
                    drilldownKeysInitial={drilldownKeys}
                    onChange={(newConfig) => updateChart(id, newConfig)}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
