"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FlightCard } from "@/components/flight-card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Filter } from "lucide-react"
import type { Flight } from "@/lib/mock-data"
import { FlightFilters, type FilterState } from "@/components/flight-filters"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FlightCardSkeleton } from "@/components/flight-card-skeleton"

function FlightResultsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [flights, setFlights] = useState<Flight[]>([])
    const [loading, setLoading] = useState(true)

    // Filter State
    const [filters, setFilters] = useState<FilterState>({
        maxPrice: 10000,
        airlines: [],
        stops: [],
        sortBy: "price_asc",
    })

    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const date = searchParams.get("date")
    const passengers = parseInt(searchParams.get("passengers") || "1")

    useEffect(() => {
        const fetchFlights = async () => {
            setLoading(true)
            try {
                const query = new URLSearchParams({
                    from: from || "",
                    to: to || "",
                    date: date || "",
                    passengers: passengers.toString(),
                }).toString()

                const res = await fetch(`/api/flights/search?${query}`)
                const data = await res.json()

                if (data.flights && data.flights.length > 0) {
                    setFlights(data.flights)
                    // Set initial max price based on data
                    const max = data.flights.reduce((acc: number, flight: Flight) => Math.max(acc, flight.price), 0)
                    const roundedMax = Math.ceil(max / 100) * 100
                    setFilters(prev => ({ ...prev, maxPrice: roundedMax }))
                } else {
                    setFlights([])
                }
            } catch (error) {
                console.error("Failed to fetch flights", error)
            } finally {
                setLoading(false)
            }
        }

        if (from && to && date) {
            fetchFlights()
        } else {
            setLoading(false)
        }
    }, [from, to, date, passengers])

    // Derived Data for Filters
    const { minPrice, maxPrice, uniqueAirlines } = useMemo(() => {
        if (flights.length === 0) return { minPrice: 0, maxPrice: 1000, uniqueAirlines: [] }
        const prices = flights.map(f => f.price)
        const airlines = Array.from(new Set(flights.map(f => f.airline)))
        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            uniqueAirlines: airlines
        }
    }, [flights])

    // Filter Logic
    const filteredFlights = useMemo(() => {
        let result = flights.filter(flight => {
            // Price Filter
            if (flight.price > filters.maxPrice) return false

            // Airline Filter
            if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false

            return true
        })

        // Sorting
        result.sort((a, b) => {
            switch (filters.sortBy) {
                case "price_asc": return a.price - b.price
                case "price_desc": return b.price - a.price
                case "duration_asc":
                    return parseInt(a.duration) - parseInt(b.duration) // simplistic parsing
                case "departure_asc":
                    return a.departure.time.localeCompare(b.departure.time)
                default: return 0
            }
        })

        return result
    }, [flights, filters])

    const handleBook = (flight: Flight) => {
        // Store flight data in session storage
        sessionStorage.setItem('bookingFlight', JSON.stringify(flight))
        sessionStorage.setItem('passengerCount', passengers.toString())
        // Navigate to booking page
        router.push('/book')
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">
                                {from} to {to}
                            </h1>
                            <p className="text-sm text-slate-500">{date} • {passengers} Passenger{passengers > 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    {/* Mobile Filter Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="lg:hidden gap-2">
                                <Filter className="w-4 h-4" /> Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                            <div className="py-6">
                                <h2 className="text-lg font-bold mb-6">Filter Flights</h2>
                                <FlightFilters
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    airlines={uniqueAirlines}
                                    filters={filters}
                                    setFilters={setFilters}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 sticky top-24">
                            <FlightFilters
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                airlines={uniqueAirlines}
                                filters={filters}
                                setFilters={setFilters}
                            />
                        </div>
                    </aside>

                    {/* Results List */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <FlightCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredFlights.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-slate-600">
                                        Found <span className="font-bold text-slate-900">{filteredFlights.length}</span> flights
                                    </p>
                                </div>
                                {filteredFlights.map((flight) => (
                                    <FlightCard key={flight.id} flight={flight} onBook={handleBook} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-600 text-lg mb-2">No flights match your filters.</p>
                                <Button
                                    variant="link"
                                    className="text-blue-600"
                                    onClick={() => setFilters({
                                        maxPrice: maxPrice,
                                        airlines: [],
                                        stops: [],
                                        sortBy: "price_asc",
                                    })}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function FlightResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <FlightResultsContent />
        </Suspense>
    )
}
