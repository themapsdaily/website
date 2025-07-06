"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Download } from "lucide-react"; // Added Download icon
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
    Card,
    CardContent,
//    CardDescription,
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
import html2canvas from "html2canvas"; // Import html2canvas

// ✅ Define types for fetched data
type RawData = {
    year: number;
    feature: string;
    total: number;
};

type ChartFormattedData = {
    year: number;
    total: number;
};

// ✅ Define chart colors
const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

// ✅ Function to calculate percentage change
const calculatePercentageChange = (oldValue: number, newValue: number) => {
    if (oldValue === 0) return 0; // Avoid division by zero
    return ((newValue - oldValue) / oldValue) * 100;
};

export default function BarChartComponent() {
    const [features, setFeatures] = useState<string[]>([]);
    const [selectedFeature, setSelectedFeature] = useState<string>("India");
    const [chartData, setChartData] = useState<ChartFormattedData[]>([]);

    // ✅ Fetch data from API
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/chart-data");
                const data: RawData[] = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format");
                }

                // ✅ Extract unique feature names
                const uniqueFeatures: string[] = [...new Set(data.map((item) => item.feature))];

                // ✅ Sort alphabetically but keep "India" at the top
                const sortedFeatures = uniqueFeatures
                    .filter((feature) => feature !== "India")
                    .sort();

                setFeatures(["India", ...sortedFeatures]);

                // ✅ Default chart data for "India"
                const filteredData: ChartFormattedData[] = data
                    .filter((item) => item.feature === "India")
                    .map(({ year, total }) => ({ year, total }));

                setChartData(filteredData);
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        }

        fetchData();
    }, []);

    // ✅ Update chart data when feature changes
    useEffect(() => {
        async function updateChartData() {
            try {
                const response = await fetch("/api/chart-data");
                const data: RawData[] = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format");
                }

                const filteredData: ChartFormattedData[] = data
                    .filter((item) => item.feature === selectedFeature)
                    .map(({ year, total }) => ({ year, total }));

                setChartData(filteredData);
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        }

        updateChartData();
    }, [selectedFeature]);

    // Ensure chartData is sorted by year
    const sortedData = chartData.sort((a, b) => a.year - b.year);

    // Calculate percentage change if there are at least two data points
    const percentageChange =
        sortedData.length >= 2
            ? calculatePercentageChange(
                sortedData[sortedData.length - 2].total,
                sortedData[sortedData.length - 1].total
            )
            : 0;

    // Determine whether the trend is up or down
    const trendIcon = percentageChange > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />;

    // ✅ Function to download the chart as PNG
    const downloadChartAsPNG = () => {
        const chartElement = document.getElementById("chart-container"); // Add an ID to the chart container

        if (chartElement) {
            html2canvas(chartElement, {
                backgroundColor: "#ffffff", // Set white background
                scale: 2, // Increase scale for better quality
                useCORS: true, // Allow cross-origin images
            }).then((canvas) => {
                const link = document.createElement("a");
                link.download = "chart.png"; // File name
                link.href = canvas.toDataURL("image/png"); // Convert canvas to PNG
                link.click(); // Trigger download
            });
        }
    };

    return (
        <Card id="chart-container"> {/* Add an ID to the chart container */}
            <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* ✅ Heading with Combobox */}
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        Year-Wise Trends
                        <div className="text-2xl font-bold">
                            <Combobox
                                options={features.map((feature) => ({
                                    value: feature,
                                    label: feature,
                                }))}
                                selected={selectedFeature}
                                onChange={(value: string) => setSelectedFeature(value)}
                            />
                        </div>
                    </CardTitle>
                </div>
                {/* ✅ Download PNG Button */}
                <button
                    onClick={downloadChartAsPNG}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                    <Download className="h-5 w-5" />
                    <span>Download PNG</span>
                </button>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        width={1080} // ✅ Ensuring it’s large enough
                        height={400} // ✅ Proper height for visibility
                        data={chartData}
                        margin={{ top: 20 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="year"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            className="text-lg font-semibold"
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ payload, label }) => {
                                if (!payload || payload.length === 0) return null; // Avoid errors on empty tooltip

                                return (
                                    <div className="bg-white p-2 shadow-md rounded-md">
                                        <p className="text-sm font-semibold">Year: {label}</p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Total:</strong> <strong>{payload[0].value}</strong>
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="total" fill="var(--color-desktop)" radius={8}>
                            {/* ✅ Bold & Larger Data Labels */}
                            <LabelList
                                dataKey="total"
                                position="top"
                                offset={12}
                                className="fill-foreground font-bold text-lg"
                                formatter={(value: number) => {
                                    if (value >= 1000) {
                                        const formattedValue = (value / 1000).toFixed(1); // Convert to K format
                                        return formattedValue.length > 3 ? `${(value / 1000).toFixed(0)}K` : `${formattedValue}K`;
                                    }
                                    return value.toString(); // Show full value if below 1000
                                }}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-lg">
                {/* ✅ Increased text size for footer */}
                <div className="flex gap-2 font-bold leading-none">
                    {percentageChange !== 0 ? (
                        <>
                            Trending {percentageChange > 0 ? "up" : "down"} by {Math.abs(percentageChange).toFixed(1)}%
                            this year
                            {trendIcon}
                        </>
                    ) : (
                        "No data to calculate trend"
                    )}
                </div>
                <div className="leading-none text-muted-foreground font-semibold">
                    Values in Thousand Tonnes
                </div>
            </CardFooter>
        </Card>
    );
}
