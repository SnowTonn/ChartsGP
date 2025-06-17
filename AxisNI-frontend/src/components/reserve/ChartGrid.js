// components/ChartGrid.js
import React from "react";
import GridLayout from "react-grid-layout";
import ChartCreator from "./ChartCreator";

export default function ChartGrid({ data, charts, onUpdateChart, onRemoveChart }) {
  const layout = charts.map((chart, index) => ({
    i: chart.id.toString(),
    x: (index * 2) % 12,
    y: Infinity,
    w: 6,
    h: 6,
  }));

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      isResizable
      isDraggable
    >
      {charts.map((chart) => (
        <div key={chart.id} style={{ background: "#fafafa", border: "1px solid #999", borderRadius: 6, padding: 10 }}>
          <ChartCreator
            data={data}
            chartTypeInitial="column"
            titleInitial={chart.title}
            xKeyInitial={chart.xKey}
            yKeyInitial={chart.yKey}
            drilldownKeysInitial={chart.drilldownKeys}
            onSave={(newTitle) => onUpdateChart(chart.id, { title: newTitle })}
            onChange={(newConfig) => onUpdateChart(chart.id, newConfig)}
          />
          <button onClick={() => onRemoveChart(chart.id)} style={{ marginTop: 10 }}>Remove</button>
        </div>
      ))}
    </GridLayout>
  );
}
