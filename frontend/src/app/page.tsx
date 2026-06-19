"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useDashboardStore } from "@/store/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function TestChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, "dark");

    chart.setOption({
      backgroundColor: "transparent",
      title: {
        text: "Sample Activity",
        textStyle: { color: "#f1f5f9" },
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisLine: { lineStyle: { color: "#262a33" } },
        axisLabel: { color: "#94a3b8" },
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "#262a33" } },
        axisLabel: { color: "#94a3b8" },
        splitLine: { lineStyle: { color: "#1e2128" } },
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: "bar",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#38bdf8" },
              { offset: 1, color: "rgba(56, 189, 248, 0.2)" },
            ]),
          },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} className="h-64 w-full" />;
}

export default function Home() {
  const { data, isLoading, error, selectedRepoKey, fetch } =
    useDashboardStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>
          Signal House
        </h1>
        <p className="mt-2 text-text-secondary">
          Developer activity dashboard scaffold
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card-bg border-card-border hover:bg-card-hover transition-colors">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2">
              Repository
              <Badge variant="secondary" className="text-xs">
                {selectedRepoKey}
              </Badge>
            </CardTitle>
            <CardDescription className="text-text-muted">
              Current repository context
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-4 w-3/4 bg-divider" />
            ) : error ? (
              <p className="text-status-error text-sm">{error}</p>
            ) : (
              <p className="text-text-secondary text-sm">
                {data ? "Data loaded" : "No data available"}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border hover:bg-card-hover transition-colors">
          <CardHeader>
            <CardTitle className="text-text-primary">Status</CardTitle>
            <CardDescription className="text-text-muted">
              System health overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Poller</span>
              <Badge variant="outline" className="border-divider text-text-muted">
                Disabled
              </Badge>
            </div>
            <Separator className="bg-divider" />
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Last refresh</span>
              <span className="text-text-muted text-sm">Never</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border hover:bg-card-hover transition-colors">
          <CardHeader>
            <CardTitle className="text-text-primary">Actions</CardTitle>
            <CardDescription className="text-text-muted">
              Dashboard controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="default"
              size="sm"
              className="w-full bg-accent-primary hover:bg-accent-primary/80"
              onClick={() => fetch()}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="outline" size="sm" className="w-full border-divider text-text-secondary hover:bg-card-hover">
              View Diagnostics
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="bg-card-bg border-card-border">
          <CardHeader>
            <CardTitle className="text-text-primary">Activity Chart</CardTitle>
            <CardDescription className="text-text-muted">
              ECharts test with custom dark theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestChart />
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 text-center text-text-muted text-sm">
        <p>Scaffold complete. Tailwind v4 + shadcn/ui + ECharts + Zustand</p>
      </footer>
    </div>
  );
}
