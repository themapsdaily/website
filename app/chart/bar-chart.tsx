"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Combobox } from "./combobox";
import html2canvas from "html2canvas";

type RawData = { year: number; feature: string; total: number };
type ChartFormattedData = { year: number; total: number };

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-base md:text-lg font-bold">Year-Wise Trends</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Combobox
            options={features.map((f) => ({ value: f, label: f }))}
            selected={selectedFeature}
            onChange={setSelectedFeature}
          />
          <button
            onClick={downloadChartAsPNG}
            className="p-2 text-xs md:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Download className="h-4 w-4 md:h-5 md:w-5" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      <Card className="w-full h-[360px] p-3 rounded-xl" id="chart-container">
        <CardContent className="px-2 pb-2 pt-0 h-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ top: 10, left: 5, right: 2, bottom: -10 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={10} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickMargin={4}
                  width={28}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}K` : `${value}`
                  }
                />
                <ChartTooltip
                  content={({ payload, label }) =>
                    payload?.length && payload[0]?.value !== undefined ? (
                      <div className="bg-white text-xs p-2 rounded shadow-sm">
                        <div>Year: {label}</div>
                        <div>Total: {payload[0].value.toLocaleString()}</div>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="total" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="text-sm flex-col items-start gap-1 mt-3 px-1">
        <div className="min-h-[32px] flex items-center gap-1 font-medium">
          {percentageChange !== 0 ? (
            <>
              Trending {percentageChange > 0 ? "up" : "down"} by {Math.abs(percentageChange).toFixed(1)}% this year
              {trendIcon}
            </>
          ) : (
            "No trend data available"
          )}
        </div>
        <div className="text-muted-foreground">Values in Thousand Tonnes</div>
      </div>
    </div>
  );
}
