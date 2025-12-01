"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { ChevronRight, Armchair, X, Plane, Loader2 } from "lucide-react"
import type { Flight } from "@/lib/mock-data"

export interface SeatSelection {
    seatNumber: string | null
    price: number
    segments?: { [segmentId: string]: string }
}

interface StepSeatsProps {
    selection: SeatSelection
    onChange: (selection: SeatSelection) => void
    flight?: Flight
    returnFlight?: Flight | null
    passengerName?: string
}

export function StepSeats({ selection, onChange, flight, returnFlight, passengerName = "Passenger" }: StepSeatsProps) {
    const [activeSegment, setActiveSegment] = useState<string | null>(null)
    const [seatMaps, setSeatMaps] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const segments = useMemo(() => {
        if (!flight) return []
        const segs = [{
            id: flight.id,
            from: flight.departure.city,
            to: flight.arrival.city,
            airline: flight.airline,
            duration: flight.duration,
            type: "Outbound"
        }]

        if (returnFlight) {
            segs.push({
                id: returnFlight.id,
                from: returnFlight.departure.city,
                to: returnFlight.arrival.city,
                airline: returnFlight.airline,
                duration: returnFlight.duration,
                type: "Return"
            })
        }
        return segs
    }, [flight, returnFlight])

    const fetchSeatMap = async (targetFlight: Flight) => {
        setLoading(true)
        setError(null)
        setSeatMaps([]) // Clear previous maps
        try {
            const res = await fetch("/api/flights/seatmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flightOffer: (targetFlight as any).rawOffer })
            })

            const data = await res.json()

            if (data.unavailable) {
                setError("Seat map is not available for this flight. You'll be assigned a random seat.")
            } else if (data.seatMaps) {
                setSeatMaps(data.seatMaps)
            } else {
                setError("Could not load seat map. " + (data.error || ""))
            }
        } catch (err) {
            setError("Failed to load seat map.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenSheet = (segmentId: string) => {
        setActiveSegment(segmentId)
        const targetFlight = segmentId === flight?.id ? flight : returnFlight
        if (targetFlight) {
            fetchSeatMap(targetFlight)
        }
    }

    const handleSeatClick = (seat: any, segmentId: string) => {
        const isAvailable = seat.travelerPricing?.[0]?.seatAvailabilityStatus === "AVAILABLE"
        if (!isAvailable) return

        const currentSegments = selection.segments || {}
        const isSelected = currentSegments[segmentId] === seat.number

        const newSegments = {
            ...currentSegments,
            [segmentId]: isSelected ? null : seat.number
        }

        const seatPrice = 30
        const seatCount = Object.values(newSegments).filter(Boolean).length
        const newPrice = seatCount * seatPrice
        const seatSummary = Object.values(newSegments).filter(Boolean).join(", ")

        onChange({
            seatNumber: seatSummary || null,
            price: newPrice,
            segments: newSegments as any
        })
    }

    const renderSeatMap = () => {
        if (seatMaps.length === 0) {
            return <div className="text-center text-slate-500">Loading seat map...</div>
        }

        const firstMap = seatMaps[0];
        if (!firstMap || !firstMap.decks || firstMap.decks.length === 0) {
            return (
                <div className="text-center text-slate-500 py-10">
                    <p>Seat map data is empty or invalid.</p>
                </div>
            )
        }

        const firstDeck = firstMap.decks[0];
        if (!firstDeck.seats) {
            return (
                <div className="text-center text-slate-500 py-10">
                    <p>No seats found in this deck.</p>
                </div>
            )
        }

        const seats = firstDeck.seats
        const rowMap: { [key: string]: any[] } = {}

        seats.forEach((seat: any) => {
            const rowNumber = seat.number?.match(/^\d+/)?.[0]
            if (rowNumber) {
                if (!rowMap[rowNumber]) rowMap[rowNumber] = []
                rowMap[rowNumber].push(seat)
            }
        })

        const sortedRows = Object.keys(rowMap).sort((a, b) => parseInt(a) - parseInt(b))

        return (
            <div className="flex flex-col gap-2">
                {sortedRows.map(rowNumber => (
                    <div key={rowNumber} className="flex items-center gap-2">
                        <div className="w-6 text-center text-xs text-slate-400">{rowNumber}</div>
                        <div className="flex gap-1 flex-wrap">
                            {rowMap[rowNumber].map((seat: any) => {
                                const isAvailable = seat.travelerPricing?.[0]?.seatAvailabilityStatus === "AVAILABLE"
                                const isSelected = selection.segments?.[activeSegment!] === seat.number

                                return (
                                    <button
                                        key={seat.number}
                                        disabled={!isAvailable}
                                        onClick={() => activeSegment && handleSeatClick(seat, activeSegment)}
                                        className={cn(
                                            "w-8 h-8 rounded border transition-all flex items-center justify-center text-xs font-medium",
                                            !isAvailable
                                                ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                                                : isSelected
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                                        )}
                                        title={`${seat.number} - ${seat.travelerPricing?.[0]?.seatAvailabilityStatus}`}
                                    >
                                        {seat.number.replace(rowNumber, '')}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Pick your perfect seat!</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    Enjoy your flight by booking the most convenient seats.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Select seats</h3>

                {segments.map((segment, index) => (
                    <div key={segment.id}>
                        {index === 0 && <div className="text-sm font-bold text-slate-500 mb-2 uppercase">{segment.type}</div>}

                        <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <Plane className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2">
                                        {segment.from} <ChevronRight className="w-4 h-4 text-slate-400" /> {segment.to}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {segment.airline} • {segment.duration}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-slate-900">{passengerName}</div>
                                    <div className="text-xs text-slate-500">
                                        {selection.segments?.[segment.id] || "Random seat"}
                                    </div>
                                </div>

                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleOpenSheet(segment.id)}
                                        >
                                            Edit Seats
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent
                                        side="right"
                                        className="w-full sm:max-w-md overflow-y-auto overscroll-contain"
                                        data-lenis-prevent="true"
                                    >
                                        <SheetHeader className="mb-6">
                                            <SheetTitle>Select Seat</SheetTitle>
                                            <SheetDescription>
                                                Select your preferred seat from the available options below.
                                            </SheetDescription>
                                        </SheetHeader>

                                        {loading ? (
                                            <div className="flex justify-center py-20">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                            </div>
                                        ) : error ? (
                                            <div className="text-center py-10 text-red-500">
                                                <p>{error}</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 pb-20">
                                                <div className="flex justify-center gap-4 text-sm mb-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded border bg-white" />
                                                        <span>Available</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded bg-blue-600" />
                                                        <span>Selected</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded bg-slate-200" />
                                                        <span>Occupied</span>
                                                    </div>
                                                </div>

                                                {renderSeatMap()}
                                            </div>
                                        )}
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
