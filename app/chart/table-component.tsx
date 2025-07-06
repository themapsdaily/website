"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Combobox } from "./combobox";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

// ✅ Define Types
type RawData = {
    year: number;
    feature: string;
    total: number;
};

type FormattedData = {
    year: number;
    feature: string;
    total: number;
};

export default function StateProductionTable() {
    const [years, setYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [allData, setAllData] = useState<FormattedData[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/chart-data");
                const data: RawData[] = await response.json();
                if (!Array.isArray(data)) throw new Error("Invalid data format");

                const uniqueYears = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a);
                setYears(uniqueYears);
                setSelectedYear(uniqueYears[0]);
                setAllData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);

    const filteredData = allData
        .filter((d) => d.year === selectedYear && d.feature !== "India")
        .sort((a, b) => b.total - a.total);

    const getTrendData = (state: string) => {
        const trendData = allData
            .filter((d) => d.feature === state && d.year <= selectedYear! && d.year > selectedYear! - 5)
            .sort((a, b) => a.year - b.year);

        if (trendData.length === 0) {
            return {
                trendData: [],
                minValue: 0,
                maxValue: 0,
                strokeColor: "#FACC15",
                fillColor: "rgba(250, 204, 21, 0.3)",
                showChart: false,
            };
        }

        const minValue = Math.min(...trendData.map((d) => d.total));
        const maxValue = Math.max(...trendData.map((d) => d.total));
        const buffer = (maxValue - minValue) * 0.1;

        const firstPoint = trendData[0].total;
        const lastPoint = trendData[trendData.length - 1].total;

        let strokeColor = "#FACC15";
        let fillColor = "rgba(250, 204, 21, 0.3)";

        if (lastPoint > firstPoint) {
            strokeColor = "#10B981";
            fillColor = "rgba(16, 185, 129, 0.3)";
        } else if (lastPoint < firstPoint) {
            strokeColor = "#EF4444";
            fillColor = "rgba(239, 68, 68, 0.3)";
        }

        return {
            trendData,
            minValue: minValue - buffer,
            maxValue: maxValue + buffer,
            strokeColor,
            fillColor,
            showChart: true,
        };
    };

    const downloadCSV = () => {
        const csvContent = [
            "State,Year,Milk Production",
            ...allData.map(({ feature, year, total }) => `${feature},${year},${total}`),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "state_milk_production.csv";
        link.click();
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-base md:text-lg font-bold">State-Wise Production</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Combobox
                        options={years.map((year) => ({ value: String(year), label: String(year) }))}
                        selected={String(selectedYear)}
                        onChange={(value: string) => setSelectedYear(Number(value))}
                    />
                    <Button
                        onClick={downloadCSV}
                        className="p-2 text-xs md:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4 md:h-5 md:w-5" />
                        <span>CSV</span>
                    </Button>
                </div>
            </div>

            {/* ✅ Table only below */}
            <div className="border border-border rounded-lg shadow-sm bg-background p-2 md:p-4 overflow-x-auto">
                <Table className="text-[10px] md:text-xs">
                    <TableCaption>Milk production trends for different states.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">#</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead className="w-[100px]">Trend (5 yrs)</TableHead>
                            <TableHead className="text-right">Milk Production (in Thousand Tonnes)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item, index) => {
                            const { trendData, minValue, maxValue, strokeColor, fillColor, showChart } = getTrendData(item.feature);
                            const safeId = `grad-${item.feature.replace(/\s+/g, "_")}`;

                            return (
                                <TableRow key={item.feature}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="text-xs md:text-sm font-semibold">{item.feature}</TableCell>
                                    <TableCell>
                                        {showChart ? (
                                            <ResponsiveContainer width="100%" height={40}>
                                                <AreaChart data={trendData}>
                                                    <defs>
                                                        <linearGradient id={safeId} x1="0" x2="0" y1="0" y2="1">
                                                            <stop offset="10%" stopColor={fillColor} stopOpacity={0.7} />
                                                            <stop offset="90%" stopColor={fillColor} stopOpacity={0.2} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="year" hide />
                                                    <YAxis domain={[minValue, maxValue]} hide />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="total"
                                                        stroke={strokeColor}
                                                        strokeWidth={2}
                                                        fill={`url(#${safeId})`}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground">No Data</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-xs md:text-sm">
                                        {item.total.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
