
import { Plane, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Flight } from "@/lib/mock-data"

interface FlightCardProps {
    flight: Flight
    onBook: (flight: Flight) => void
}

// Helper to get airline logo URL
const getAirlineLogo = (airlineName: string) => {
    const domainMap: Record<string, string> = {
        "United Airlines": "united.com",
        "American Airlines": "aa.com",
        "Delta Air Lines": "delta.com",
        "Frontier Airlines": "flyfrontier.com",
        "Alaska Airlines": "alaskaair.com",
        "JetBlue Airways": "jetblue.com",
        "Spirit Airlines": "spirit.com",
        "Southwest Airlines": "southwest.com",
        "British Airways": "britishairways.com",
        "Lufthansa": "lufthansa.com",
        "Air France": "airfrance.com",
        "Emirates": "emirates.com",
        "Qatar Airways": "qatarairways.com",
        "Singapore Airlines": "singaporeair.com",
    }

    const domain = domainMap[airlineName]
    if (domain) {
        return `https://logo.clearbit.com/${domain}`
    }
    return null
}

export function FlightCard({ flight, onBook }: FlightCardProps) {
    const logoUrl = getAirlineLogo(flight.airline)

    return (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all p-6 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Airline Info */}
                <div className="flex items-center gap-4 w-full md:w-1/4">
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-white rounded-full overflow-hidden border border-slate-100">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={flight.airline}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                            />
                        ) : null}
                        <div className={`w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg ${logoUrl ? 'hidden' : ''}`}>
                            {flight.airlineCode}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 text-xl">{flight.airline}</h3>
                        <p className="text-xs text-slate-500">{flight.flightNumber}</p>
                    </div>
                </div>

                {/* Flight Times */}
                <div className="flex items-center justify-center gap-8 w-full md:w-2/4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-slate-900">{flight.departure.time}</div>
                        <div className="text-sm text-slate-500">{flight.departure.code}</div>
                    </div>

                    <div className="flex flex-col items-center w-full max-w-[120px]">
                        <div className="text-xs text-slate-400 mb-1">{flight.duration}</div>
                        <div className="relative w-full h-[2px] bg-blue-200">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1">
                                <Plane className="w-4 h-4 text-blue-500 rotate-90" />
                            </div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        </div>
                        <div className="text-xs text-blue-600 mt-1 font-medium">Direct</div>
                    </div>

                    <div className="text-center">
                        <div className="text-xl font-bold text-slate-900">{flight.arrival.time}</div>
                        <div className="text-sm text-slate-500">{flight.arrival.code}</div>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-col items-end gap-3 w-full md:w-1/4 border-t md:border-t-0 md:border-l border-blue-50 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                        <span className="text-sm text-slate-500">from</span>
                        <div className="text-2xl font-bold text-blue-600">
                            ${flight.price.toLocaleString()}
                        </div>
                        {flight.seatsAvailable && (
                            <div className={`text-xs font-medium ${flight.seatsAvailable < 9 ? 'text-red-500' : 'text-blue-600'}`}>
                                {flight.seatsAvailable} seat{flight.seatsAvailable !== 1 ? 's' : ''} left
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={() => onBook(flight)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        Book Now
                    </Button>
                </div>
            </div>
        </div>
    )
}
