import Highcharts from 'highcharts';

Highcharts.setOptions({
  chart: {
    backgroundColor: "#f4f6f9",
    style: {
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
      fontSize: "13px",
      color: "#1a1a1a"
    },
    spacing: [20, 20, 20, 20],
  },
  title: {
    align: "left",
    style: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1a1a1a",
    }
  },
  subtitle: {
    align: "left",
    style: {
      fontSize: "14px",
      color: "#5a5a5a",
    }
  },
  tooltip: {
    backgroundColor: "#ffffff",
    borderColor: "#d0d0d0",
    borderRadius: 6,
    borderWidth: 1,
    shadow: true,
    style: {
      color: "#000000",
      fontSize: "13px",
      fontWeight: "normal"
    }
  },
  legend: {
    align: "center",
    verticalAlign: "bottom",
    itemStyle: {
      color: "#1a1a1a",
      fontWeight: "500",
      fontSize: "13px",
    },
    itemHoverStyle: {
      color: "#000"
    },
    itemHiddenStyle: {
      color: "#bbb"
    }
  },
  xAxis: {
    gridLineWidth: 0,
    lineColor: "#dcdcdc",
    tickColor: "#dcdcdc",
    labels: {
      style: {
        color: "#333",
        fontSize: "12px"
      }
    },
    title: {
      style: {
        color: "#1a1a1a",
        fontSize: "13px"
      }
    }
  },
  yAxis: {
    gridLineColor: "#e0e0e0",
    lineColor: "#dcdcdc",
    tickColor: "#dcdcdc",
    labels: {
      style: {
        color: "#333",
        fontSize: "12px"
      }
    },
    title: {
      style: {
        color: "#1a1a1a",
        fontSize: "13px"
      }
    }
  },
  plotOptions: {
    series: {
      borderWidth: 0,
      dataLabels: {
        style: {
          fontSize: "12px"
          
        }
      },
      marker: {
        radius: 3,
        symbol: 'circle'
      }
    },
    pie: {
      dataLabels: {
        style: {
          fontSize: "12px",
          color: "#111"
        }
      }
    }
  },
  colors: [
    "#1A73E8", "#34A853", "#FBBC05", "#EA4335", "#6C757D",
    "#17A2B8", "#6610f2", "#20c997", "#fd7e14", "#dc3545"
  ]
});
