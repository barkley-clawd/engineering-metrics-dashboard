import { useMemo } from "react";

export function useEChartsTheme() {
  return useMemo(
    () => ({
      backgroundColor: "transparent",
      textStyle: { color: "#f1f5f9" },
      title: { textStyle: { color: "#f1f5f9" } },
      legend: { textStyle: { color: "#94a3b8" } },
      tooltip: {
        backgroundColor: "#111318",
        borderColor: "#1e2128",
        textStyle: { color: "#f1f5f9" },
      },
      categoryAxis: {
        axisLine: { lineStyle: { color: "#262a33" } },
        axisLabel: { color: "#94a3b8" },
        splitLine: { lineStyle: { color: "#1e2128" } },
      },
      valueAxis: {
        axisLine: { lineStyle: { color: "#262a33" } },
        axisLabel: { color: "#94a3b8" },
        splitLine: { lineStyle: { color: "#1e2128" } },
      },
    }),
    []
  );
}
