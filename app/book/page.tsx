"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BookingWizard } from "@/components/booking/booking-wizard"
import { Navbar } from "@/components/navbar"
import type { Flight } from "@/lib/mock-data"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

function BookPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [flight, setFlight] = useState<Flight | null>(null)
    const [returnFlight, setReturnFlight] = useState<Flight | null>(null)
    const [passengerCount, setPassengerCount] = useState(1)

    const [date, setDate] = useState<string>("")
    const [returnDate, setReturnDate] = useState<string>("")

    useEffect(() => {
        // Get flight data from session storage
        const flightData = sessionStorage.getItem('bookingFlight')
        const returnFlightData = sessionStorage.getItem('returnFlight')
        const passengers = sessionStorage.getItem('passengerCount')
        const storedDate = sessionStorage.getItem('bookingDate')
        const storedReturnDate = sessionStorage.getItem('returnDate')

        if (flightData) {
            setFlight(JSON.parse(flightData))
        }

        if (returnFlightData) {
            setReturnFlight(JSON.parse(returnFlightData))
        }

        if (passengers) {
            setPassengerCount(parseInt(passengers))
        }

        if (storedDate) {
            setDate(storedDate)
        }

        if (storedReturnDate) {
            setReturnDate(storedReturnDate)
        }
    }, [])

    const handleClose = () => {
        // Clear session storage
        sessionStorage.removeItem('bookingFlight')
        sessionStorage.removeItem('returnFlight')
        sessionStorage.removeItem('passengerCount')
        sessionStorage.removeItem('bookingDate')
        sessionStorage.removeItem('returnDate')
        router.push('/flights')
    }

    if (!flight) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">No flight selected</p>
                    <Link href="/flights" className="text-blue-600 hover:underline flex items-center gap-2 justify-center">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Flights
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Navbar />
            <div className="h-screen flex flex-col pt-20">
                <BookingWizard
                    key={passengerCount}
                    flight={flight}
                    returnFlight={returnFlight}
                    passengerCount={passengerCount}
                    date={date}
                    returnDate={returnDate}
                    onClose={handleClose}
                />
            </div>
        </div>
    )
}

export default function BookPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <BookPageContent />
        </Suspense>
    )
}
