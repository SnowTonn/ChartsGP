// src/components/ChartCreator.jsx
import React, { useState, useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "./utils/highcharts-config";

const chartTypes = ["column", "bar", "line", "pie", "area"];

export default function ChartCreator({ data, onSave }) {
  const keys = Object.keys(data[0] || {});
  const [chartType, setChartType] = useState("column");
  const [xKey, setXKey] = useState(() => keys[0] || "");
  const [yKeys, setYKeys] = useState(() => (keys[1] ? [keys[1]] : []));
  const [drilldownKeys, setDrilldownKeys] = useState([]);
  const [title, setTitle] = useState("My Chart");
  const [showSecondChart, setShowSecondChart] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(true); // 

  const availableDrilldownKeys = keys.filter(
    (k) => k !== xKey && !yKeys.includes(k)
  );

  const handleDrilldownKeysChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (o) => o.value
    );
    setDrilldownKeys(selectedOptions);
  };

  const { series, drilldown } = useMemo(() => {
    if (!xKey || yKeys.length === 0) return { series: [], drilldown: undefined };

    const drilldownSeries = [];
    const seenDrilldowns = new Set();

    const seriesByMetric = yKeys.map((metric) => {
      const metricSeries = data.map((row) => {
        const category = row[xKey];
        const yValue = Number(row[metric]) || 0;

        if (!seenDrilldowns.has(category)) {
          seenDrilldowns.add(category);
          const drilldownData = drilldownKeys.map((key) => [
            key,
            Number(row[key]) || 0,
          ]);
          drilldownSeries.push({
            id: category,
            name: `${category} Breakdown`,
            data: drilldownData,
          });
        }

        return {
          name: category,
          y: yValue,
          drilldown: category,
        };
      });

      return {
        name: metric,
        colorByPoint: yKeys.length === 1,
        data: metricSeries,
      };
    });

    return {
      series: seriesByMetric,
      drilldown: {
        series: drilldownSeries,
      },
    };
  }, [data, xKey, yKeys, drilldownKeys]);

  const isPieChart = chartType === "pie";

  const options = {
    chart: { type: chartType, height: 550 },
    title: { text: title || yKeys.join(", ") },
    xAxis: {
      type: "category",
      title: { text: xKey },
    },
    yAxis: {
      title: { text: yKeys.length === 1 ? yKeys[0] : "Metrics" },
      labels: {
        format: "{value}", //£
      },
    },
    legend: { enabled: showLegend }, // 
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: showDataLabels,
          format: isPieChart
            ? "<b>{point.name}</b>: {point.percentage:.2f} %"
            : "{point.y:.2f}", //£
        },
      },
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: showDataLabels,
          format: "<b>{point.name}</b>: {point.percentage:.2f} %",
        },
      },
    },
    tooltip: {
      pointFormat: isPieChart
        ? "<b>{point.y}</b> ({point.percentage:.2f}%)"
        : "<b>{point.y:.2f}</b>", //£
    },
    series,
    drilldown,
  };

  const secondChartSeries = useMemo(() => {
    if (drilldownKeys.length === 0) return [];

    return drilldownKeys.map((key) => {
      const total = data.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
      return { name: key, y: total };
    });
  }, [data, drilldownKeys]);

  const secondChartOptions = {
    chart: { type: "pie" },
    title: { text: "Summary of Selected Drilldown Keys" },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: showDataLabels,
          format: "<b>{point.name}</b>: {point.percentage:.2f} %",
        },
      },
    },
    tooltip: {
      pointFormat: "<b>{point.y}</b> ({point.percentage:.2f} %)",
    },
    series: [
      {
        name: "Total",
        colorByPoint: true,
        data: secondChartSeries,
      },
    ],
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
            setDrilldownKeys([]);
          }}
          style={{ flex: 1, minWidth: 120, padding: 6 }}
          title="Select one X metrics"
        >
          {keys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          multiple
          value={yKeys}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
            setYKeys(selected);
            setDrilldownKeys([]);
          }}
          style={{ flex: 3, minWidth: 180, padding: 6, height: 150 }}
          title="Select one or more Y metrics"
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
          style={{ flex: 1, minWidth: 250, padding: 6, height: 150 }}
          title="Select categories to show on drilldown (Ctrl/Cmd+click for multiple)"
        >
          {availableDrilldownKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* Data Labels Toggle */}
      <label style={{ display: "block", marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={showDataLabels}
          onChange={() => setShowDataLabels((prev) => !prev)}
          style={{ marginRight: 6 }}
        />
        Show values on chart
      </label>

      {/* Legend Toggle  */}
      <label style={{ display: "block", marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={showLegend}
          onChange={() => setShowLegend((prev) => !prev)}
          style={{ marginRight: 6 }}
        />
        Show legend
      </label>

      {/* Main Chart */}
      <HighchartsReact highcharts={Highcharts} options={options} />

      {/* Toggle and Second Chart */}
      {secondChartSeries.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={showSecondChart}
              onChange={() => setShowSecondChart((prev) => !prev)}
              style={{ marginRight: 6 }}
            />
            Show summary chart
          </label>

          {showSecondChart && (
            <HighchartsReact highcharts={Highcharts} options={secondChartOptions} />
          )}
        </div>
      )}
    </div>
  );
}
