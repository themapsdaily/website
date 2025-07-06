"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BarChartComponent from "./bar-chart";
import TableComponent from "./table-component";
import SourceDetails from "./source-details"; // create this file

export default function ChartPage() {
    return (
        <div className="min-h-screen flex flex-col w-full">
            {/* Header Section */}
            <section className="border-b bg-background w-full">
                <div className="w-full px-8 md:px-16 lg:px-24">
                    <div className="flex flex-col items-start gap-1 py-8 md:py-10 lg:py-12">
                        <Link
                            href="/docs/tailwind-v4"
                            className="group mb-2 inline-flex items-center gap-2 px-0.5 text-sm font-medium"
                        >
                            <span className="underline-offset-4 group-hover:underline">The Maps Daily | Agriculture</span>
                        </Link>
                        <h1 className="text-2xl font-bold leading-tight tracking-tighter sm:text-3xl md:text-4xl lg:leading-[1.1]">
                            Milk Production
                        </h1>
                        <p className="max-w-2xl text-base font-light text-foreground sm:text-lg">
                            India is the world's largest milk producer, contributing approximately 24% of global milk production. 
                            In 2022-23, India produced around 230.58 million tonnes of milk, with Uttar Pradesh being the top milk-producing state. 
                            The Indian dairy sector has seen significant growth in the past decade, with a 63.56% increase in milk production between 2014-15 and 2023-24.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content with Tabs */}
            <div className="w-full px-8 md:px-16 lg:px-24 mt-6">
                <Tabs defaultValue="bar" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                        <TabsTrigger value="table">Table View</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bar">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="w-full lg:w-[70%]">
                                <BarChartComponent />
                            </div>
                            <div className="w-full lg:w-[30%]">
                                <SourceDetails />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="table">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="w-full lg:w-[70%]">
                                <TableComponent />
                            </div>
                            <div className="w-full lg:w-[30%]">
                                <SourceDetails />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
