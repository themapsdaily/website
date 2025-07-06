import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
    // Define the path to your GeoJSON file
    const geoJsonPath = path.join(process.cwd(), 'public', 'maps', 'India2019.geojson');
    
    // Log the file path for debugging
    console.log("GeoJSON File Path:", geoJsonPath);

    try {
        // Read the GeoJSON file
        const geoJsonData = await fs.readFile(geoJsonPath, 'utf-8');
        
        // Parse the GeoJSON data to ensure it's valid JSON
        const geoJson = JSON.parse(geoJsonData);

        // Check if the parsed data is a valid FeatureCollection
        if (!geoJson || geoJson.type !== "FeatureCollection" || !geoJson.features || geoJson.features.length === 0) {
            console.error("GeoJSON is invalid or empty.");
            return NextResponse.json({ message: "Invalid GeoJSON data", error: "No valid features found" }, { status: 500 });
        }

        // Return the valid GeoJSON data as a response
        return NextResponse.json(geoJson);
    } catch (error) {
        // Error handling if GeoJSON reading fails
        if (error instanceof Error) {
            console.error("Error reading GeoJSON file:", error.message);
            return NextResponse.json({ message: "Error reading GeoJSON file", error: error.message }, { status: 500 });
        } else {
            // Handle cases where the error is not an instance of Error
            console.error("An unknown error occurred:", error);
            return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
        }
    }
}
