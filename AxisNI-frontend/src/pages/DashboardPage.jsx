import React, { useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "../components/utils/highcharts-config";
import { Link } from "react-router-dom";

const mainData = [
  { Year: "2010", TotalBudget: 11804.2, TotalResource: 10316.1, TotalCapital: 1488.1 },
  { Year: "2011", TotalBudget: 11520.4, TotalResource: 10329.1, TotalCapital: 1191.3 },
  { Year: "2012", TotalBudget: 11525.9, TotalResource: 10353.4, TotalCapital: 1172.5 },
  { Year: "2013", TotalBudget: 11548.7, TotalResource: 10431.9, TotalCapital: 1116.8 },
  { Year: "2014", TotalBudget: 11919.6, TotalResource: 10519.9, TotalCapital: 1399.7 },
  { Year: "2015", TotalBudget: 11293.8, TotalResource: 10176.1, TotalCapital: 1117.7 },
  { Year: "2016", TotalBudget: 11614, TotalResource: 10398, TotalCapital: 1216 },
  { Year: "2017", TotalBudget: 11845.1, TotalResource: 10612.8, TotalCapital: 1232.3 },
  { Year: "2018", TotalBudget: 12204.7, TotalResource: 10780.4, TotalCapital: 1424.3 },
  { Year: "2019", TotalBudget: 12741.6, TotalResource: 11351.5, TotalCapital: 1390.1 },
  { Year: "2020", TotalBudget: 13746.4, TotalResource: 12196.9, TotalCapital: 1549.5 },
  { Year: "2021", TotalBudget: 14782.5, TotalResource: 13001.5, TotalCapital: 1781 },
  { Year: "2022", TotalBudget: 16323.341, TotalResource: 14269.097, TotalCapital: 2054.244 },
  { Year: "2023", TotalBudget: 16451.684, TotalResource: 14211.967, TotalCapital: 2239.717 },
  { Year: "2024", TotalBudget: 17255.6, TotalResource: 15168.2, TotalCapital: 2087.4 },
  { Year: "2025", TotalBudget: 19085, TotalResource: 16639.4, TotalCapital: 2445.6 },
];

const categories = [
  "Agriculture, Environment and Rural Affairs",
  "Communities",
  "Economy",
  "Education",
  "Finance and Personnel",
  "Health, Social Services and Public Safety",
  "Infrastructure",
  "Justice",
  "Office of the First Minister and Deputy First Minister",
  "Other",
];

const drilldownData = {
  "2010": {
    categories,
    resource: [354.5, 1038.4, 798.9, 1914.8, 182.9, 4302.9, 312.8, 1223.7, 80.2, 107],
    capital: [0, 825.8, 37.6, 169.3, 15.2, 201.7, 133.4, 80, 12, 13.1],
  },
  "2011": {
    categories,
    resource: [347.1, 1013.7, 787.3, 1894.6, 188.6, 4383.1, 319.2, 1213.1, 78.6, 103.8],
    capital: [26.3, 614.4, 41.2, 114.7, 18.9, 200.5, 85, 78.3, 11.2, 0.8],
  },
  "2012": {
    categories,
    resource: [354.4, 1020.7, 780.3, 1876.1, 185.3, 4447.6, 319, 1189, 80, 101],
    capital: [25.5, 558, 32.3, 103.4, 14.6, 279.8, 80.3, 64.5, 10.1, 4],
  },
  "2013": {
    categories,
    resource: [341.2, 1000.5, 798.5, 1887.7, 180.7, 4569.2, 310.7, 1166.7, 77, 99.7],
    capital: [26.6, 654.8, 18.5, 107.7, 10.6, 187.5, 45.7, 51.8, 10.8, 2.8],
  },
  "2014": {
    categories,
    resource: [339.6, 980.9, 826.7, 1874.5, 181.2, 4659.4, 309.8, 1176.4, 73.7, 97.7],
    capital: [37.2, 733.5, 28.3, 183.4, 28.4, 183, 106.8, 82, 15.9, 1.2],
  },
  "2015": {
    categories,
    resource: [294.1, 924.2, 707.9, 1914.2, 141.2, 4697.9, 294.5, 1044.7, 67.9, 89.5],
    capital: [92.4, 452.7, 33.2, 146.8, 23, 213.4, 53.4, 95.9, 4.2, 2.7],
  },
  "2016": {
    categories,
    resource: [197.9, 871.2, 790, 1947.5, 140.1, 4880.1, 372.8, 1050.5, 59.1, 88.8],
    capital: [48.8, 159.7, 90.9, 193.7, 33.6, 232.6, 384.1, 58, 11, 3.6],
  },
  "2017": {
    categories,
    resource: [192, 872.7, 770.7, 1904.1, 155.1, 5144.8, 375.1, 1033.7, 77.6, 87],
    capital: [36.9, 125.4, 62, 172.6, 30.6, 217.1, 414.3, 51.2, 120.4, 1.8],
  },
  "2018": {
    categories,
    resource: [194.1, 900.2, 763.3, 1939.4, 136.6, 5306.2, 370.2, 1029.5, 55.3, 85.6],
    capital: [76.6, 179.3, 93.7, 164.6, 27.3, 237.9, 501.2, 87.1, 54.5, 2.1],
  },
  "2019": {
    categories,
    resource: [203.1, 873.9, 776.7, 2037.7, 155.5, 5701.1, 384.4, 1077.4, 57.3, 84.4],
    capital: [86, 179.1, 82.4, 152.7, 35.3, 280.6, 469, 76.2, 25.3, 3.5],
  },
  "2020": {
    categories,
    resource: [226.1, 823.8, 817.7, 2276.1, 168.6, 6158.4, 417.9, 1111.2, 98, 99.1],
    capital: [98.5, 214.1, 86.1, 157.3, 31.9, 295, 558.2, 88.1, 18.1, 2.2],
  },
  "2021": {
    categories,
    resource: [553.8, 876.3, 821.3, 2345.1, 172.1, 6451.9, 429.9, 1125.3, 120.5, 105.3],
    capital: [95.5, 224.8, 89.8, 158.3, 45, 326.5, 722.5, 96.4, 15.3, 6.9],
  },
  "2022": {
    categories,
    resource: [564.172, 848.314, 781.8, 2642.89, 178.698, 7280.14, 521.238, 1184.16, 156.776, 110.902],
    capital: [82.429, 233.505, 243.531, 211.832, 32.292, 358.133, 796.425, 79.119, 10.397, 6.581],
  },
  "2023": {
    categories,
    resource: [579.775, 861.619, 771.994, 2576.51, 147.453, 7300.9, 523.429, 1156.67, 181.842, 111.781],
    capital: [115.669, 216.056, 245.857, 218.618, 37.908, 468.62, 792.422, 128.764, 11.983, 3.82],
  },
  "2024": {
    categories,
    resource: [577.3, 856, 766.6, 2874.4, 208.1, 7759.8, 559.5, 1262.5, 183.2, 120.8],
    capital: [95, 133.4, 221.9, 254.3, 38.9, 416.8, 820.1, 91.9, 10.5, 4.6],
  },
  "2025": {
    categories,
    resource: [598.9, 938.2, 801.4, 3227.8, 240.1, 8409.9, 638.2, 1415.3, 240.1, 129.5],
    capital: [119.5, 270, 205.4, 388.4, 32.5, 391, 917, 100, 14, 7.8],
  },
};

const COLORS = {
  total: "#2a9d8f",
  resource: "#e9c46a",
  capital: "#f4a261",
};

export default function CoolDashboard() {
    const [selectedView, setSelectedView] = useState("TotalBudget"); // "TotalBudget" or "Breakdown"
    const [drilldownYear, setDrilldownYear] = useState(null);
    const [breakdownType, setBreakdownType] = useState(null);

    const totalBudgetSum = mainData.reduce((acc, d) => acc + d.TotalBudget, 0);
    const totalResourceSum = mainData.reduce((acc, d) => acc + d.TotalResource, 0);
    const totalCapitalSum = mainData.reduce((acc, d) => acc + d.TotalCapital, 0); //Sum


  const yearCategories = mainData.map((d) => d.Year);

  // Prepare drilldown series with resource & capital side by side
  const drilldownSeries = [];
  Object.entries(drilldownData).forEach(([year, data]) => {
    drilldownSeries.push({
      id: year,
      name: "Resource",
      type: "column",
      data: data.categories.map((cat, i) => [cat, data.resource[i]]),
      color: COLORS.resource,
      showInLegend: true,
    });
    drilldownSeries.push({
      id: year,
      name: "Capital",
      type: "column",
      data: data.categories.map((cat, i) => [cat, data.capital[i]]),
      color: COLORS.capital,
      showInLegend: true,
    });
  });

    const resourceCategorySeries = categories.map((cat, catIdx) => ({
    name: cat,
    data: mainData.map((yearData) => drilldownData[yearData.Year].resource[catIdx]),
    type: "line",
    color: undefined, // let Highcharts assign color automatically or define your own palette
  }));

  const capitalCategorySeries = categories.map((cat, catIdx) => ({
    name: cat,
    data: mainData.map((yearData) => drilldownData[yearData.Year].capital[catIdx]),
    type: "line",
    color: undefined,
  }));



  const options = {
    chart: {
      height: 600,
      type: selectedView === "TotalBudget" ? "line" :
            selectedView === "ResourceBreakdown" ? "line" : "column",
      animation: { duration: 800 },
    },
    title: {
      text:
        selectedView === "TotalBudget"
          ? "Total Budget Over Years (£M)"
          : selectedView === "ResourceBreakdown"
            ? `Resource Budget by Category (2010 - 2025) (£M)`
            : `Budget Breakdown for ${drilldownYear || "Year"} (£M)`,
      style: { fontWeight: "bold", fontSize: "20px" },
    },
    xAxis: {
      categories: selectedView === "TotalBudget" || selectedView === "ResourceBreakdown"
        ? yearCategories
        : drilldownYear
          ? drilldownData[drilldownYear].categories
          : [],
      title: { text: selectedView === "TotalBudget" || selectedView === "ResourceBreakdown" ? "Year" : "Department" },
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: { text: "Budget (£M)" },
      labels: {
        formatter() {
          return `£${this.value}M`;
        },
      },
    },
    tooltip: {
      shared: true,
      valuePrefix: "£",
      valueSuffix: "M",
    },
    plotOptions: {
      series: {
        cursor: "pointer",
        marker: { enabled: selectedView !== "Breakdown" }, // markers only for line charts
        point: {
          events: {
            click: function () {
              if (selectedView === "TotalBudget") {
                setDrilldownYear(this.category);
                setSelectedView("Breakdown");
                setBreakdownType(null);
              }
            },
          },
        },
      },
      column: {
        grouping: true,
        shadow: false,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: "£{y}M",
          style: { fontWeight: "bold" },
        },
      },
    },
    legend: {
      enabled: true,
      itemStyle: { fontWeight: "bold" },
    },

    series: selectedView === "TotalBudget"
      ? [
          {
            name: "Total Budget",
            data: mainData.map((d) => d.TotalBudget),
            color: COLORS.total,
          },
          {
            name: "Resource Budget",
            data: mainData.map((d) => d.TotalResource),
            color: COLORS.resource,
          },
          {
            name: "Capital Budget",
            data: mainData.map((d) => d.TotalCapital),
            color: COLORS.capital,
          },
        ]
      : selectedView === "ResourceBreakdown"
        ? breakdownType === "Resource"
          ? resourceCategorySeries
          : capitalCategorySeries
        : drilldownYear
          ? drilldownSeries.filter(
              (s) =>
                s.id === drilldownYear &&
                (breakdownType ? s.name === breakdownType : true)
            )
          : [],
    
    credits: { enabled: false },
  };


  const currentYearData = drilldownYear
  ? mainData.find((d) => d.Year === drilldownYear)
  : mainData[mainData.length - 1];

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "auto",
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ 
        textAlign: "center", 
        marginBottom: 10, 
        color: COLORS.total 
      }}>
        Northern Ireland Budget (2010–2025)
      </h1>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: 20, 
        color: COLORS.capital, 
        fontWeight: "normal" 
      }}>
        Interactive Dashboard
      </h2>

      

      <div
  style={{
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 30,
    gap: 15,
    flexWrap: "wrap",
  }}
>
  {[
    {
      label: "Total Budget",
      value: drilldownYear ? currentYearData.TotalBudget : totalBudgetSum,
      color: COLORS.total,
    },
    {
      label: "Resource Budget",
      value: drilldownYear ? currentYearData.TotalResource : totalResourceSum,
      color: COLORS.resource,
    },
    {
      label: "Capital Budget",
      value: drilldownYear ? currentYearData.TotalCapital : totalCapitalSum,
      color: COLORS.capital,
    },
  ].map(({ label, value, color }) => (
    <div
      key={label}
      style={{
        flex: "1 1 250px",
        background: color,
        color: "white",
        borderRadius: 8,
        padding: 20,
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        cursor: label === "Total Budget" ? "default" : "pointer",
        transition: "transform 0.3s",
        textAlign: "center",
      }}
      onClick={() => {
        if (label === "Total Budget") {
          setSelectedView("TotalBudget");
          setDrilldownYear(null);
          setBreakdownType(null);
        } else if (label === "Resource Budget") {
          setSelectedView("ResourceBreakdown");
          setDrilldownYear(null);
          setBreakdownType("Resource");
        } else if (label === "Capital Budget") {
          setSelectedView("ResourceBreakdown");
          setDrilldownYear(null);
          setBreakdownType("Capital");
        }
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h3 style={{ marginBottom: 10 }}>
        {label} <br /> {drilldownYear ? drilldownYear : "2010 - 2025"}
      </h3>
      <p style={{ fontSize: 28, fontWeight: "bold", margin: 0 }}>
        £{value.toLocaleString()}M
      </p>
    </div>
  ))}
</div>


      <HighchartsReact key={selectedView} highcharts={Highcharts} options={options}/>


      {selectedView === "Breakdown" && (
        <button
          onClick={() => {
        setSelectedView("TotalBudget");
        setDrilldownYear(null);
        }}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            backgroundColor: COLORS.total,
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Back to Overview
        </button>
      )}

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <p style={{
          textAlign: "center",
          fontSize: 14,
          color: COLORS.total,
          marginBottom: 30,
          width: "100%",
          padding: "0 10px",
          wordBreak: "break-word",
          lineHeight: "1.5"
        }}>
          Data sourced from official documents available at&nbsp;
          <a
            href="https://www.finance-ni.gov.uk/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.resource, textDecoration: "underline" }}
          >
            Department of Finance Northern Ireland
          </a>.
        </p>
        <Link
          to="/upload"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            fontSize: 18,
            backgroundColor: COLORS.total,
            color: "white",
            borderRadius: 8,
            textDecoration: "none",
            boxShadow: "0 5px 15px rgba(42, 157, 143, 0.4)",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#23877c")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.total)}
        >
          Upload Your Data & Create Charts
        </Link>
      </div>
    </div>
  );
}