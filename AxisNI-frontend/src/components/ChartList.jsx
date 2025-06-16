// frontend-react/src/components/ChartList.jsx
import React, { useEffect, useState } from "react";
import { getCharts } from "../services/api";

export default function ChartList() {
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    getCharts().then((res) => setCharts(res.data));
  }, []);

  return (
    <div>
      <h3>Made in FIT</h3>
      <ul>
        {charts.map((chart) => (
          <li key={chart.id}>
            {chart.name} - ID: {chart.id}
          </li>
        ))}
      </ul>
    </div>
  );
}
