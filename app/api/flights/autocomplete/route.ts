import { NextResponse } from 'next/server';
import Amadeus from 'amadeus';
import amadeus from '@/lib/amadeus';
import { mapAmadeusLocationToAirport } from '@/lib/amadeus-helpers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.length < 2) {
        return NextResponse.json({ airports: [] });
    }

    try {
        console.log("[Autocomplete] Searching for:", query);
        const response = await amadeus.referenceData.locations.get({
            keyword: query,
            subType: Amadeus.location.any,
            page: { limit: 10 }
        });

        const airports = response.data.map(mapAmadeusLocationToAirport);
        return NextResponse.json({ airports });
    } catch (error) {
        console.error("Amadeus Autocomplete Error:", error);
        const amadeusError = error as any;

        // Log detailed error information
        console.error("Error details:", {
            description: amadeusError.description,
            code: amadeusError.code,
            response: amadeusError.response?.body || amadeusError.response
        });

        // Check if credentials are missing
        if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
            console.error("⚠️ AMADEUS CREDENTIALS ARE MISSING!");
            return NextResponse.json(
                { error: "Amadeus API credentials not configured" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to fetch airports",
                details: amadeusError.description?.error || (error instanceof Error ? error.message : String(error)),
                code: amadeusError.code
            },
            { status: 500 }
        );
    }
}
