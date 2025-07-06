"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Combobox } from "./combobox";
import html2canvas from "html2canvas";

type RawData = { year: number; feature: string; total: number };
type ChartFormattedData = { year: number; total: number };

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
};

const calculatePercentageChange = (oldValue: number, newValue: number) =>
  oldValue === 0 ? 0 : ((newValue - oldValue) / oldValue) * 100;

export default function BarChartComponent() {
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedFeature, setSelectedFeature] = useState("India");
  const [chartData, setChartData] = useState<ChartFormattedData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/chart-data");
        const data: RawData[] = await res.json();

        const unique = [...new Set(data.map((d) => d.feature))].filter((f) => f !== "India").sort();
        setFeatures(["India", ...unique]);

        const initial = data.filter((d) => d.feature === "India").map(({ year, total }) => ({ year, total }));
        setChartData(initial);
      } catch (e) {
        console.error("Fetch failed", e);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function updateChart() {
      try {
        const res = await fetch("/api/chart-data");
        const data: RawData[] = await res.json();
        const filtered = data
          .filter((d) => d.feature === selectedFeature)
          .map(({ year, total }) => ({ year, total }));
        setChartData(filtered);
      } catch (e) {
        console.error("Fetch failed", e);
      }
    }
    updateChart();
  }, [selectedFeature]);

  const sortedData = [...chartData].sort((a, b) => a.year - b.year);
  const percentageChange = sortedData.length >= 2
    ? calculatePercentageChange(sortedData.at(-2)!.total, sortedData.at(-1)!.total)
    : 0;
  const trendIcon = percentageChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;

  const downloadChartAsPNG = () => {
    const node = document.getElementById("chart-container");
    if (node) {
      html2canvas(node, { backgroundColor: "#fff", scale: 2 }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <Card id="chart-container" className="w-full max-w-5xl mx-auto p-4 rounded-xl">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <CardTitle className="text-xl font-semibold flex flex-wrap items-center gap-2">
          Year-Wise Trends
          <Combobox
            options={features.map((f) => ({ value: f, label: f }))}
            selected={selectedFeature}
            onChange={setSelectedFeature}
          />
        </CardTitle>
        <button
          onClick={downloadChartAsPNG}
          className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          PNG
        </button>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis tickLine={false} axisLine={false} fontSize={10} />
              <ChartTooltip
                cursor={false}
                content={({ payload, label }) =>
                  payload?.length ? (
                    <div className="bg-white text-xs p-2 rounded shadow-sm">
                      <div>Year: {label}</div>
                      <div>Total: {payload[0].value}</div>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="total" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#1E3A8A" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-sm flex-col items-start gap-1">
        <div className="flex items-center gap-1 font-medium">
          {percentageChange !== 0 ? (
            <>
              Trending {percentageChange > 0 ? "up" : "down"} by{" "}
              {Math.abs(percentageChange).toFixed(1)}% this year
              {trendIcon}
            </>
          ) : (
            "No trend data available"
          )}
        </div>
        <div className="text-muted-foreground">Values in Thousand Tonnes</div>
      </CardFooter>
    </Card>
  );
}
