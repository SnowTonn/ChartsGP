// src/components/ChartCreator.jsx
import React, { useState, useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "./utils/highcharts-config";

const chartTypes = ["column", "bar", "line", "pie", "area"];

export default function ChartCreator({ data, onSave }) {
  const keys = Object.keys(data[0] || {});
  const [chartType, setChartType] = useState("column");
  //const [xKey, setXKey] = useState("Year");
  const [xKey, setXKey] = useState(() => keys[0] || "");
  //const [yKey, setYKey] = useState("Total Expenditure (£B) NI");
  const [yKey, setYKey] = useState(() => keys[1] || "");
  const [drilldownKeys, setDrilldownKeys] = useState([]);
  const [title, setTitle] = useState("My Chart");

  
  const availableDrilldownKeys = keys.filter((k) => k !== xKey && k !== yKey);

  // Drilldown keys selector
  const handleDrilldownKeysChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((o) => o.value);
    setDrilldownKeys(selectedOptions);
  };

  const { series, drilldown } = useMemo(() => {
    if (!xKey || !yKey) return { series: [], drilldown: undefined };

    const mainSeries = [];
    const drilldownSeries = [];

    data.forEach((row) => {
      const mainCategory = row[xKey];
      const yValue = Number(row[yKey]) || 0;

      mainSeries.push({
        name: mainCategory,
        y: yValue,
        drilldown: mainCategory,
      });

      const drilldownData = drilldownKeys.map((key) => [key, Number(row[key]) || 0]);

      drilldownSeries.push({
        id: mainCategory,
        name: `${mainCategory} Breakdown`,
        data: drilldownData,
      });
    });

    return {
      series: [
        {
          name: yKey,
          colorByPoint: true,
          data: mainSeries,
        },
      ],
      drilldown: {
        series: drilldownSeries,
      },
    };
  }, [data, xKey, yKey, drilldownKeys]);

  const options = {
    chart: { type: chartType },
    title: { text: title },
    xAxis: {
      type: "category",
      title: { text: xKey },
    },
    yAxis: {
      title: { text: yKey },
    },
    legend: { enabled: false },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: { enabled: true },
      },
    },
    series,
    drilldown,
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 700 }}>
      <h3>Create Chart with Drilldown</h3>

      <input
        placeholder="Chart Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: 12, width: "100%", padding: 6, fontSize: 16 }}
      />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          style={{ flex: 1, minWidth: 120, padding: 6 }}
        >
          {chartTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={xKey}
          onChange={(e) => {
            setXKey(e.target.value);
            setDrilldownKeys([]); // reset drilldown keys when xKey changes
          }}
          style={{ flex: 1, minWidth: 120, padding: 6 }}
        >
          {keys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          value={yKey}
          onChange={(e) => {
            setYKey(e.target.value);
            setDrilldownKeys([]); // reset drilldown keys when yKey changes
          }}
          style={{ flex: 1, minWidth: 180, padding: 6 }}
        >
          {keys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          multiple
          value={drilldownKeys}
          onChange={handleDrilldownKeysChange}
          style={{ flex: 1, minWidth: 250, padding: 6, height: 100 }}
          title="Select categories to show on drilldown (Ctrl/Cmd+click for multiple)"
        >
          {availableDrilldownKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <HighchartsReact highcharts={Highcharts} options={options} />

      {/* <button
        onClick={() => onSave(title, JSON.stringify(options, null, 2))}
        disabled={!xKey || !yKey}
        style={{ marginTop: 12, padding: "8px 16px", fontSize: 16, cursor: "pointer" }}
        title={!xKey || !yKey ? "Select X and Y axis keys first" : "Save Chart Config"}
      >
        Save Chart
      </button> */}
    </div>
  );
}
