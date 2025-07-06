"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Combobox } from "./combobox";
import html2canvas from "html2canvas";

type RawData = {
  year: number;
  feature: string;
  total: number;
};

type ChartFormattedData = {
  year: number;
  total: number;
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const calculatePercentageChange = (oldValue: number, newValue: number) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

export default function BarChartComponent() {
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string>("India");
  const [chartData, setChartData] = useState<ChartFormattedData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/chart-data");
        const data: RawData[] = await response.json();

        if (!Array.isArray(data)) throw new Error("Invalid data format");

        const uniqueFeatures: string[] = [...new Set(data.map((item) => item.feature))];
        const sortedFeatures = uniqueFeatures.filter((f) => f !== "India").sort();

        setFeatures(["India", ...sortedFeatures]);

        const filteredData = data
          .filter((item) => item.feature === "India")
          .map(({ year, total }) => ({ year, total }));

        setChartData(filteredData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function updateChartData() {
      try {
        const response = await fetch("/api/chart-data");
        const data: RawData[] = await response.json();

        if (!Array.isArray(data)) throw new Error("Invalid data format");

        const filteredData = data
          .filter((item) => item.feature === selectedFeature)
          .map(({ year, total }) => ({ year, total }));

        setChartData(filteredData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }

    updateChartData();
  }, [selectedFeature]);

  const sortedData = chartData.sort((a, b) => a.year - b.year);

  const percentageChange =
    sortedData.length >= 2
      ? calculatePercentageChange(
          sortedData[sortedData.length - 2].total,
          sortedData[sortedData.length - 1].total
        )
      : 0;

  const trendIcon = percentageChange > 0 ? (
    <TrendingUp className="h-4 w-4" />
  ) : (
    <TrendingDown className="h-4 w-4" />
  );

  const downloadChartAsPNG = () => {
    const chartElement = document.getElementById("chart-container");
    if (chartElement) {
      html2canvas(chartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-2">
      <Card id="chart-container" className="rounded-xl border p-4 sm:p-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-0">
          <CardTitle className="text-base sm:text-xl font-semibold flex items-center gap-2">
            Year-Wise Trends
            <Combobox
              options={features.map((feature) => ({
                value: feature,
                label: feature,
              }))}
              selected={selectedFeature}
              onChange={(value: string) => setSelectedFeature(value)}
            />
          </CardTitle>
          <button
            onClick={downloadChartAsPNG}
            className="text-xs sm:text-sm px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </CardHeader>

        <CardContent className="px-0">
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              width={1080}
              height={400}
              data={chartData}
              margin={{ top: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs sm:text-sm"
              />
              <ChartTooltip
                cursor={false}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) return null;
                  return (
                    <div className="bg-white p-2 shadow-md rounded-md">
                      <p className="text-xs font-medium">Year: {label}</p>
                      <p className="text-xs text-gray-700">
                        <strong>Total:</strong> {payload[0].value}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" fill="var(--color-desktop)" radius={8}>
                <LabelList
                  dataKey="total"
                  position="top"
                  offset={10}
                  className="fill-foreground font-semibold text-xs sm:text-sm"
                  formatter={(value: number) =>
                    value >= 1000
                      ? `${(value / 1000).toFixed(1)}K`.replace(/\.0K$/, "K")
                      : value.toString()
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-1 px-0 pt-4 text-sm sm:text-base">
          <div className="flex flex-wrap items-center gap-1 font-medium leading-none">
            {percentageChange !== 0 ? (
              <>
                Trending {percentageChange > 0 ? "up" : "down"} by{" "}
                {Math.abs(percentageChange).toFixed(1)}% this year
                {trendIcon}
              </>
            ) : (
              "No data to calculate trend"
            )}
          </div>
          <div className="text-muted-foreground font-normal leading-none">
            Values in Thousand Tonnes
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
