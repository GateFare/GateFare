
export interface Flight {
    id: string
    airline: string
    airlineCode: string
    flightNumber: string
    departure: {
        city: string
        code: string
        time: string
    }
    arrival: {
        city: string
        code: string
        time: string
    }
    duration: string
    price: number
    currency: string
    stops: number
    seatsAvailable: number
    rawOffer?: any
}

export interface Airport {
    code: string
    city: string
    name: string
    country: string
}

const AIRPORTS: Airport[] = [
    { code: "LHR", city: "London", name: "Heathrow Airport", country: "United Kingdom" },
    { code: "DXB", city: "Dubai", name: "Dubai International Airport", country: "UAE" },
    { code: "JFK", city: "New York", name: "John F. Kennedy International Airport", country: "USA" },
    { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
    { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport", country: "India" },
    { code: "DEL", city: "New Delhi", name: "Indira Gandhi International Airport", country: "India" },
    { code: "CDG", city: "Paris", name: "Charles de Gaulle Airport", country: "France" },
    { code: "HND", city: "Tokyo", name: "Haneda Airport", country: "Japan" },
    { code: "SYD", city: "Sydney", name: "Kingsford Smith Airport", country: "Australia" },
]

export async function searchAirports(query: string): Promise<Airport[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const lowerQuery = query.toLowerCase()
    return AIRPORTS.filter(
        (airport) =>
            airport.city.toLowerCase().includes(lowerQuery) ||
            airport.code.toLowerCase().includes(lowerQuery) ||
            airport.name.toLowerCase().includes(lowerQuery),
    )
}

export async function searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate some mock flights based on the route
    const airlines = [
        { name: "United Airlines", code: "UA" },
        { name: "American Airlines", code: "AA" },
        { name: "Delta Air Lines", code: "DL" },
        { name: "Frontier Airlines", code: "F9" },
    ]

    const flights: Flight[] = Array.from({ length: 5 }).map((_, i) => {
        const airline = airlines[Math.floor(Math.random() * airlines.length)]
        // More realistic pricing between $300 and $600
        const priceBase = 300 + Math.random() * 300

        // Random times
        const depHour = 6 + Math.floor(Math.random() * 14) // 6 AM to 8 PM
        const depMin = Math.floor(Math.random() * 60)
        const durationHours = 2 + Math.floor(Math.random() * 6) // Shorter domestic-style duration
        const stops = Math.random() > 0.7 ? 1 : 0 // Mostly non-stop

        const depTime = `${depHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`
        const arrHour = (depHour + durationHours) % 24
        const arrTime = `${arrHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`

        return {
            id: `FL-${Math.random().toString(36).substr(2, 9)}`,
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: `${airline.code}${100 + Math.floor(Math.random() * 900)}`,
            departure: {
                city: from,
                code: from.substring(0, 3).toUpperCase(), // Naive code generation for mock
                time: depTime,
            },
            arrival: {
                city: to,
                code: to.substring(0, 3).toUpperCase(),
                time: arrTime,
            },
            duration: `${durationHours}h ${Math.floor(Math.random() * 60).toString().padStart(2, '0')}m`,
            price: Math.floor(priceBase),
            currency: "USD",
            stops: stops,
            seatsAvailable: Math.floor(Math.random() * 9) + 1, // 1-9 seats
            rawOffer: { isMock: true, id: `MOCK-OFFER-${Math.random().toString(36).substr(2, 9)}` }
        }
    })

    return flights
}


