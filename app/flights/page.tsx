"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FlightCard } from "@/components/flight-card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Filter, Search, Plane } from "lucide-react"
import type { Flight } from "@/lib/mock-data"
import { FlightFilters, type FilterState } from "@/components/flight-filters"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FlightCardSkeleton } from "@/components/flight-card-skeleton"
import { PromotionalBanner } from "@/components/promotional-banner"
import { ModifySearchSheet } from "@/components/modify-search-sheet"
import Image from "next/image"
import Link from "next/link"

function FlightResultsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [flights, setFlights] = useState<Flight[]>([])
    const [loading, setLoading] = useState(true)
    const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null)

    // Filter State
    const [filters, setFilters] = useState<FilterState>({
        maxPrice: 10000,
        airlines: [],
        stops: [],
        sortBy: "price_asc",
        durationOutbound: [0, 24],
        durationInbound: [0, 24],
        departureTimeOutbound: [0, 24],
        departureTimeInbound: [0, 24],
    })

    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const date = searchParams.get("date")
    const returnDate = searchParams.get("returnDate")
    const tripType = searchParams.get("tripType")
    const passengers = parseInt(searchParams.get("passengers") || "1")

    const isReturnTrip = (tripType?.toLowerCase() === "return" || !!returnDate) && !!returnDate
    const isSelectingReturn = isReturnTrip && !!outboundFlight

    useEffect(() => {
        const fetchFlights = async () => {
            setLoading(true)
            try {
                // If selecting return flight, swap origin and destination
                const searchFrom = isSelectingReturn ? to : from
                const searchTo = isSelectingReturn ? from : to
                const searchDate = isSelectingReturn ? returnDate : date

                const query = new URLSearchParams({
                    from: searchFrom || "",
                    to: searchTo || "",
                    date: searchDate || "",
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
    }, [from, to, date, returnDate, passengers, isSelectingReturn])

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

            // Duration Filter
            const parseDuration = (dur: string): number => {
                const match = dur.match(/(\d+)h\s*(?:(\d+)m)?/)
                if (match) {
                    const hours = parseInt(match[1])
                    const minutes = match[2] ? parseInt(match[2]) : 0
                    return hours + minutes / 60
                }
                return 0
            }

            const flightDuration = parseDuration(flight.duration)
            if (flightDuration < filters.durationOutbound[0] || flightDuration > filters.durationOutbound[1]) return false

            // Departure Time Filter
            const parseTime = (timeStr: string): number => {
                const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/)
                if (match) {
                    let hours = parseInt(match[1])
                    const minutes = parseInt(match[2])
                    const period = match[3]

                    if (period === 'PM' && hours !== 12) hours += 12
                    if (period === 'AM' && hours === 12) hours = 0

                    return hours + minutes / 60
                }
                return 0
            }

            const departureHour = parseTime(flight.departure.time)
            if (departureHour < filters.departureTimeOutbound[0] || departureHour > filters.departureTimeOutbound[1]) return false

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
        if (isReturnTrip && !outboundFlight) {
            // Selected outbound flight, now select return
            setOutboundFlight(flight)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            // Selected return flight (or one-way), proceed to booking
            sessionStorage.setItem('bookingFlight', JSON.stringify(outboundFlight || flight))
            if (outboundFlight) {
                sessionStorage.setItem('returnFlight', JSON.stringify(flight))
            } else {
                sessionStorage.removeItem('returnFlight')
            }
            sessionStorage.setItem('passengerCount', passengers.toString())
            sessionStorage.setItem('bookingDate', date || new Date().toISOString().split('T')[0])
            sessionStorage.setItem('returnDate', returnDate || "")
            router.push('/book')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Button variant="ghost" size="icon" onClick={() => {
                                if (outboundFlight) {
                                    setOutboundFlight(null)
                                } else {
                                    router.push('/')
                                }
                            }} className="shrink-0">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>

                            {/* Search Summary Bar */}
                            <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-blue-100 rounded-lg px-4 py-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Plane className="w-4 h-4 text-blue-500" />
                                        <span>{isSelectingReturn ? to : from}</span>
                                    </div>
                                    <span className="text-slate-400">→</span>
                                    <div className="flex items-center gap-1">
                                        <Plane className="w-4 h-4 text-blue-500 transform rotate-45" />
                                        <span>{isSelectingReturn ? from : to}</span>
                                    </div>
                                </div>
                                <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block"></div>
                                <div className="hidden sm:flex items-center gap-4 text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 flex items-center justify-center">📅</span>
                                        <span>{isSelectingReturn ? returnDate : date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 flex items-center justify-center">👤</span>
                                        <span>{passengers} Traveler{passengers > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <ModifySearchSheet />

                            {/* Mobile Filter Trigger */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden gap-2 flex-1 md:flex-none">
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
                </div>

                {/* Step Indicator for Return Trips */}
                {isReturnTrip && (
                    <div className="bg-blue-50 border-t border-blue-100 py-2">
                        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 text-sm">
                            <div className={`flex items-center gap-2 ${!outboundFlight ? 'text-blue-700 font-bold' : 'text-slate-500'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${!outboundFlight ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>1</div>
                                Select Outbound
                            </div>
                            <div className="w-8 h-px bg-slate-300"></div>
                            <div className={`flex items-center gap-2 ${outboundFlight ? 'text-blue-700 font-bold' : 'text-slate-500'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${outboundFlight ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2</div>
                                Select Return
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar (Filters) */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                                <FlightFilters
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    airlines={uniqueAirlines}
                                    filters={filters}
                                    setFilters={setFilters}
                                />
                            </div>

                            {/* Sidebar Banners */}
                            <PromotionalBanner
                                variant="sidebar"
                                title="Need Help?"
                                description="Our travel experts are available 24/7 to assist you."
                                icon="phone"
                                actionLabel="Call Now"
                                color="blue"
                            />
                        </div>
                    </aside>

                    {/* Center Results List */}
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
                                        Found <span className="font-bold text-slate-900">{filteredFlights.length}</span> {isSelectingReturn ? 'return' : 'outbound'} flights
                                    </p>
                                </div>

                                {/* Top Banner */}
                                <PromotionalBanner
                                    variant="inline"
                                    title="Get 5% Cash Back"
                                    description="Use your Gatefare Signature Card and earn 5% back on all flight bookings."
                                    icon="card"
                                    actionLabel="Apply Now"
                                    color="indigo"
                                />

                                {filteredFlights.map((flight, index) => (
                                    <div key={flight.id}>
                                        <FlightCard flight={flight} onBook={handleBook} />
                                        {/* Insert Banner after 2nd item */}
                                        {index === 1 && (
                                            <PromotionalBanner
                                                variant="inline"
                                                title="Travel with Peace of Mind"
                                                description="Add comprehensive travel insurance starting at just $15."
                                                icon="shield"
                                                actionLabel="Add Insurance"
                                                color="amber"
                                            />
                                        )}

                                        {/* Mobile Ad Banner - Tokyo */}
                                        {index === 2 && (
                                            <div className="lg:hidden mt-4 rounded-xl overflow-hidden shadow-sm relative h-24 sm:h-32">
                                                <Link href={`/flights?from=JFK&to=Tokyo&date=${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}&passengers=1&maxPrice=150`}>
                                                    <Image
                                                        src="/ads/tokyo.png"
                                                        alt="Explore Tokyo"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </Link>
                                            </div>
                                        )}

                                        {/* Mobile Ad Banner - Dubai */}
                                        {index === 4 && (
                                            <div className="lg:hidden mt-4 rounded-xl overflow-hidden shadow-sm relative h-24 sm:h-32">
                                                <Link href={`/flights?from=JFK&to=Dubai&date=${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}&passengers=1&maxPrice=150`}>
                                                    <Image
                                                        src="/ads/dubai.png"
                                                        alt="Visit Dubai"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </Link>
                                            </div>
                                        )}

                                        {/* Mobile Ad Banner - Paris */}
                                        {index === 6 && (
                                            <div className="lg:hidden mt-4 rounded-xl overflow-hidden shadow-sm relative h-24 sm:h-32">
                                                <Link href={`/flights?from=JFK&to=Paris&date=${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}&passengers=1&maxPrice=150`}>
                                                    <Image
                                                        src="/ads/paris.png"
                                                        alt="Paris Getaway"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
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
                                        durationOutbound: [0, 24],
                                        durationInbound: [0, 24],
                                        departureTimeOutbound: [0, 24],
                                        departureTimeInbound: [0, 24],
                                    })}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar (Ads) - Desktop Only */}
                    <aside className="hidden xl:block w-72 shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                <Link href={`/flights?from=JFK&to=Dubai&date=${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}&passengers=1&maxPrice=150`}>
                                    <Image
                                        src="/ads/dubai.png"
                                        alt="Visit Dubai"
                                        width={600}
                                        height={150}
                                        className="w-full h-auto object-cover"
                                    />
                                </Link>
                            </div>
                            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                <Link href={`/flights?from=JFK&to=Tokyo&date=${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}&passengers=1&maxPrice=150`}>
                                    <Image
                                        src="/ads/tokyo.png"
                                        alt="Explore Tokyo"
                                        width={600}
                                        height={150}
                                        className="w-full h-auto object-cover"
                                    />
                                </Link>
                            </div>
                        </div>
                    </aside>
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
