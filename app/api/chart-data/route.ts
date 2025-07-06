import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Try both names, one should work based on your schema
    const data = await prisma.time_based_metrics?.findMany({ // ✅ Try this first
      where: { feature_type: { in: ["National", "Subnational"] } },
      orderBy: { year: "asc" },
      select: { year: true, feature: true, total: true },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}