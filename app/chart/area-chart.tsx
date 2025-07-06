"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartData = [
    { date: "2024-04-01", desktop: 222, mobile: 150 },
    { date: "2024-04-02", desktop: 97, mobile: 180 },
    { date: "2024-04-03", desktop: 167, mobile: 120 },
    { date: "2024-04-04", desktop: 242, mobile: 260 },
    { date: "2024-04-05", desktop: 373, mobile: 290 },
    { date: "2024-04-06", desktop: 301, mobile: 340 },
];

const chartConfig = {
    visitors: { label: "Visitors" },
    desktop: {
        label: "Desktop",
        color: "#000000",
    },
    mobile: {
        label: "Mobile",
        color: "#5c5c5c",
    },
} satisfies ChartConfig;

export default function AreaChartComponent() {
    const [timeRange, setTimeRange] = React.useState("90d");

    return (
        <Card className="w-full max-w-4xl mx-auto border border-border shadow-md rounded-lg">
            {/* ✅ Matched Bar Chart Header */}
            <CardHeader className="border-b px-6 py-5">
                <div className="flex justify-between items-center">
                    <div className="grid gap-1">
                        <CardTitle className="text-xl font-semibold">Area Chart - Interactive</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Showing total visitors for the last 3 months
                        </CardDescription>
                    </div>

                    {/* ✅ Dropdown Select Matches Bar Chart */}
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[160px] rounded-lg border border-border bg-background text-foreground">
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border border-border bg-background">
                            <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                            <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                            <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            {/* ✅ Chart Styling Matches Bar Chart */}
            <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="w-full h-[350px]">
                    <AreaChart width={700} height={350} data={chartData}>
                        <defs>
                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                    indicator="dot"
                                />
                            }
                        />
                        <Area dataKey="mobile" type="natural" fill="url(#fillMobile)" stroke="var(--color-mobile)" stackId="a" />
                        <Area dataKey="desktop" type="natural" fill="url(#fillDesktop)" stroke="var(--color-desktop)" stackId="a" />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>

            {/* ✅ Footer Styled Same as Bar Chart */}
            <CardFooter className="flex-col items-start gap-2 text-sm px-6 pb-5">
                <div className="flex gap-2 font-medium leading-none text-green-600">
                    Trending up by 4.8% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Interactive filtering for last 3 months
                </div>
            </CardFooter>
        </Card>
    );
}