import { NextResponse } from 'next/server';
import { searchFlights } from '@/lib/mock-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const passengers = searchParams.get('passengers') || '1';

    if (!from || !to || !date) {
        return NextResponse.json(
            { error: "Missing required parameters: from, to, date" },
            { status: 400 }
        );
    }

    try {
        console.log("[Flight Search] Searching (MOCK):", { from, to, date, passengers });

        // Use mock data instead of Amadeus API to show specific airlines as requested
        const flights = await searchFlights(from, to, date);

        return NextResponse.json({ flights });
    } catch (error) {
        console.error("Flight Search Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch flights", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
