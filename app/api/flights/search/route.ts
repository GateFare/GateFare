import { airlineCodeMap } from '@/lib/airline-codes';
import { NextResponse } from 'next/server';
import { searchFlights } from '@/lib/mock-data';
import amadeus from '@/lib/amadeus';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from') || '';
    const toParam = searchParams.get('to') || '';
    const date = searchParams.get('date');
    const passengers = searchParams.get('passengers') || '1';

    // Extract IATA code from format "City (CODE)" or just use as is
    const extractCode = (str: string) => {
        const match = str.match(/\(([A-Z]{3})\)/);
        return match ? match[1] : str;
    };

    const from = extractCode(fromParam);
    const to = extractCode(toParam);

    if (!from || !to || !date) {
        return NextResponse.json(
            { error: "Missing required parameters: from, to, date" },
            { status: 400 }
        );
    }

    try {
        console.log("[Flight Search] Searching (Amadeus):", { from, to, date, passengers });

        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: from,
            destinationLocationCode: to,
            departureDate: date,
            adults: passengers,
            max: 10
        });

        if (!response.data) {
            return NextResponse.json({ flights: [] });
        }

        const flights = response.data.map((offer: any) => {
            const itinerary = offer.itineraries[0];
            const segment = itinerary.segments[0];
            const lastSegment = itinerary.segments[itinerary.segments.length - 1];
            const carrierCode = segment.carrierCode;
            const airlineName = airlineCodeMap[carrierCode] || offer.validatingAirlineCodes[0] || carrierCode;

            // Calculate duration
            const duration = itinerary.duration.replace('PT', '').toLowerCase();

            return {
                id: offer.id,
                airline: airlineName, // You might want to map codes to names if possible
                airlineCode: carrierCode,
                flightNumber: `${carrierCode}${segment.number}`,
                departure: {
                    city: from, // Amadeus returns codes, we might need a map for city names
                    code: segment.departure.iataCode,
                    time: segment.departure.at.split('T')[1].substring(0, 5)
                },
                arrival: {
                    city: to,
                    code: lastSegment.arrival.iataCode,
                    time: lastSegment.arrival.at.split('T')[1].substring(0, 5)
                },
                duration: duration,
                price: parseFloat(offer.price.total),
                currency: offer.price.currency,
                stops: itinerary.segments.length - 1,
                seatsAvailable: offer.numberOfBookableSeats,
                rawOffer: offer // Important for SeatMap
            };
        });

        return NextResponse.json({ flights });
    } catch (error) {
        console.error("Flight Search Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch flights", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
