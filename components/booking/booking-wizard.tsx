"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react"
import { StepPassenger, type PassengerDetails } from "./step-passenger"
import { StepSeats, type SeatSelection } from "./step-seats"
import { StepAddons, type AddonsSelection } from "./step-addons"
import { StepPayment, type PaymentDetails } from "./step-payment"
import { Turnstile } from "@marsidev/react-turnstile"
import type { Flight } from "@/lib/mock-data"

interface BookingWizardProps {
    flight: Flight
    passengerCount: number
    date?: string
    onClose: () => void
}

export function BookingWizard({ flight, passengerCount, date, onClose }: BookingWizardProps) {
    const [step, setStep] = useState(1)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [token, setToken] = useState("")
    const [bookingReference, setBookingReference] = useState("")
    const [couponCode, setCouponCode] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponError, setCouponError] = useState("")
    const [discount, setDiscount] = useState(0)

    // Passengers State
    const [passengers, setPassengers] = useState<PassengerDetails[]>(
        Array(passengerCount).fill(null).map(() => ({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            countryCode: "+1",
            passport: "",
            baggage: "none",
            gender: "male" as "male" | "female",
            dobDay: "",
            dobMonth: "",
            dobYear: "",
            ticketExchange: false,
            smsUpdates: false,
        }))
    )

    // Payment State
    const [payment, setPayment] = useState<PaymentDetails>({
        cardNumber: "",
        cardName: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        country: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
    })

    const [seats, setSeats] = useState<SeatSelection>({
        seatNumber: null,
        price: 0,
    })

    const [addons, setAddons] = useState<AddonsSelection>({
        flexibleTicket: false,
        cancellation: "none",
        premiumService: false,
    })

    const updatePassenger = (index: number, data: Partial<PassengerDetails>) => {
        setPassengers(prev => prev.map((p, i) => i === index ? { ...p, ...data } : p))
    }

    // Check if flight is domestic or international
    const isFlightDomestic = () => {
        const depCode = flight.departure.code.substring(0, 2)
        const arrCode = flight.arrival.code.substring(0, 2)
        const usCodes = ['NY', 'LA', 'SF', 'CH', 'MI', 'DA', 'HO', 'AT', 'BO', 'SE', 'DE', 'PH', 'LV', 'OR']
        const isDomesticUS = usCodes.some(code => depCode.includes(code[0])) && usCodes.some(code => arrCode.includes(code[0]))
        return isDomesticUS || depCode === arrCode
    }

    // Apply Coupon
    const applyCoupon = () => {
        setCouponError("")
        const code = couponCode.trim().toUpperCase()

        if (code === "") {
            setCouponError("Please select a coupon")
            return
        }

        if (code === "DOM10" && isFlightDomestic()) {
            setDiscount(0.10)
            setCouponApplied(true)
        } else if (code === "INT20" && !isFlightDomestic()) {
            setDiscount(0.20)
            setCouponApplied(true)
        } else if (code === "DOM10" && !isFlightDomestic()) {
            setCouponError("This coupon is only valid for domestic flights")
            setDiscount(0)
            setCouponApplied(false)
        } else if (code === "INT20" && isFlightDomestic()) {
            setCouponError("This coupon is only valid for international flights")
            setDiscount(0)
            setCouponApplied(false)
        } else {
            setCouponError("Invalid coupon code")
            setDiscount(0)
            setCouponApplied(false)
        }
    }

    // Remove Coupon
    const removeCoupon = () => {
        setCouponCode("")
        setCouponApplied(false)
        setDiscount(0)
        setCouponError("")
    }

    // Calculate Total Price
    const calculateTotal = () => {
        let total = flight.price * passengers.length

        passengers.forEach(p => {
            if (p.baggage === "add") total += 50
            if (p.ticketExchange) total += 54
            if (p.smsUpdates) total += 6
        })

        total += seats.price
        if (addons.flexibleTicket) total += 45 * passengers.length
        if (addons.cancellation === "any_reason") total += 65 * passengers.length
        if (addons.cancellation === "flexible") total += 37 * passengers.length
        if (addons.premiumService) total += 12 * passengers.length

        // Apply discount if coupon is applied
        if (couponApplied && discount > 0) {
            total = total * (1 - discount)
        }

        return Math.round(total)
    }

    const handleNext = () => {
        if (step === 1) {
            const isValid = passengers.every(p => p.firstName && p.lastName) && passengers[0].email
            if (!isValid) {
                setError("Please fill in all required fields for all passengers")
                return
            }
        }
        if (step === 5) {
            if (!payment.cardNumber || !payment.expiryMonth || !payment.expiryYear || !payment.cvv || !payment.country) {
                setError("Please complete all payment fields")
                return
            }
        }
        setError("")
        setStep(step + 1)
    }

    const handleSubmit = async () => {
        if (!token) {
            setError("Please complete the security check")
            return
        }

        const generateReference = () => {
            const date = new Date()
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const random = Math.floor(10000 + Math.random() * 90000)
            return `GF-${year}${month}${day}-${random}`
        }

        const reference = generateReference()
        setBookingReference(reference)

        setLoading(true)
        try {
            const response = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "booking",
                    bookingReference: reference,
                    flightDetails: {
                        airline: flight.airline,
                        flightNumber: flight.flightNumber,
                        from: flight.departure.city,
                        fromCode: flight.departure.code,
                        departureTime: flight.departure.time,
                        to: flight.arrival.city,
                        toCode: flight.arrival.code,
                        arrivalTime: flight.arrival.time,
                        date: date || new Date().toISOString().split('T')[0],
                        duration: flight.duration,
                        basePrice: flight.price,
                        totalPrice: calculateTotal()
                    },
                    passengers,
                    seats,
                    addons,
                    payment,
                    token
                }),
            })

            if (response.ok) {
                setSuccess(true)
            } else {
                setError("Failed to submit booking. Please try again.")
            }
        } catch (error) {
            console.error("Error submitting booking:", error)
            setError("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="h-full overflow-y-auto overscroll-contain" data-lenis-prevent="true">
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-4xl mx-auto pb-24">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-14 h-14 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                            <span className="text-white text-xs">✓</span>
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Booking done!</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl">
                        Your eTicket will be issued shortly in mail.
                    </p>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 mb-6 w-full shadow-md">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Booking Reference</p>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-4xl font-bold text-blue-600 font-mono tracking-wider">{bookingReference}</p>
                        <p className="text-xs text-slate-500 mt-2">Please save this reference number for your records</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 w-full">
                        <h3 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                            Flight Summary
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Route:</span>
                                <span className="font-semibold text-slate-900">{flight.departure.city} → {flight.arrival.city}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Flight:</span>
                                <span className="font-semibold text-slate-900">{flight.airline} {flight.flightNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Departure:</span>
                                <span className="font-semibold text-slate-900">{flight.departure.time}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Arrival:</span>
                                <span className="font-semibold text-slate-900">{flight.arrival.time}</span>
                            </div>
                            <div className="flex justify-between md:col-span-2 pt-2 border-t-2 border-blue-100">
                                <span className="text-slate-700 font-semibold">Total Amount:</span>
                                <span className="font-bold text-2xl text-blue-600">${calculateTotal()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg p-5 mb-6 w-full text-left shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-100 rounded-full p-2 shrink-0">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-amber-900 mb-2">What Happens Next?</h4>
                                <ul className="space-y-2 text-sm text-amber-800">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <span>Our team will verify your booking details and payment information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <span>You'll receive a confirmation email at <strong className="text-amber-900">{passengers[0].email}</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <span>Your e-Ticket will be issued shortly after verification is completed</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 w-full">
                        <p className="text-xs text-slate-600 mb-2">Need assistance or have questions?</p>
                        <p className="text-sm font-semibold text-slate-900">
                            Contact us at <span className="text-blue-600">support@gatefare.com</span> or call <span className="text-blue-600">+1-844-638-0111</span>
                        </p>
                    </div>

                    <Button
                        onClick={() => window.location.href = '/'}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full max-h-screen">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-4 md:px-8 border-b bg-white shrink-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 overflow-x-auto no-scrollbar">
                        <span className={`whitespace-nowrap ${step >= 1 ? "text-blue-600" : ""}`}>Passenger</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                        <span className={`whitespace-nowrap ${step >= 2 ? "text-blue-600" : ""}`}>Seats</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                        <span className={`whitespace-nowrap ${step >= 3 ? "text-blue-600" : ""}`}>Add-ons</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                        <span className={`whitespace-nowrap ${step >= 4 ? "text-blue-600" : ""}`}>Review</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                        <span className={`whitespace-nowrap ${step >= 5 ? "text-blue-600" : ""}`}>Payment</span>
                    </div>
                    <div className="lg:hidden text-right ml-4 shrink-0">
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-xl font-bold text-blue-600">${calculateTotal()}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-8 py-6" data-lenis-prevent="true">
                    {step === 1 && <StepPassenger passengers={passengers} onChange={updatePassenger} />}
                    {step === 2 && <StepSeats selection={seats} onChange={setSeats} flight={flight} passengerName={`${passengers[0].firstName} ${passengers[0].lastName}`} />}
                    {step === 3 && <StepAddons selection={addons} onChange={setAddons} />}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900">Review Your Trip</h3>
                                <p className="text-slate-500 text-sm mt-1">Please double-check your details before confirming.</p>
                            </div>

                            {/* Flight Summary Card */}
                            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-600 p-1 rounded-md text-xs font-bold">{flight.airlineCode}</span>
                                        {flight.airline}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">{flight.flightNumber}</span>
                                </div>
                                <div className="p-4 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900">{flight.departure.time}</div>
                                        <div className="text-sm text-slate-500">{flight.departure.city}</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="text-xs text-slate-400 mb-1">{flight.duration}</div>
                                        <div className="w-24 h-[1px] bg-slate-300 relative">
                                            <div className="absolute -top-1 right-0 w-2 h-2 border-t border-r border-slate-300 rotate-45"></div>
                                        </div>
                                        <div className="text-xs text-blue-600 font-medium mt-1">{flight.stops === 0 ? "Direct" : `${flight.stops} Stop(s)`}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900">{flight.arrival.time}</div>
                                        <div className="text-sm text-slate-500">{flight.arrival.city}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Passenger & Services Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Passenger Details */}
                                <div className="bg-white border rounded-xl p-4 shadow-sm">
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                        Traveler Details
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        {passengers.map((p, i) => (
                                            <div key={i} className="border-b pb-2 last:border-0 last:pb-0">
                                                <div className="font-medium text-slate-900">Passenger {i + 1}</div>
                                                <div className="text-slate-600">{p.firstName} {p.lastName}</div>
                                            </div>
                                        ))}
                                        <div>
                                            <span className="text-slate-500 text-xs block">Contact Info</span>
                                            <div className="font-medium text-slate-900 truncate">{passengers[0].email}</div>
                                            <div className="font-medium text-slate-900">{passengers[0].phone}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Services */}
                                <div className="bg-white border rounded-xl p-4 shadow-sm">
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                        Selected Services
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                                            <span className="text-slate-600">Seat Selection</span>
                                            <span className="font-medium text-slate-900">{seats.seatNumber || "Random"}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                                            <span className="text-slate-600">Baggage</span>
                                            <span className="font-medium text-slate-900 text-right">
                                                {passengers.filter(p => p.baggage === "add").length} Checked (+23kg)
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                                            <span className="text-slate-600">Flexible Ticket</span>
                                            <span className="font-medium text-slate-900">{addons.flexibleTicket ? "Yes" : "No"}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                                            <span className="text-slate-600">Cancellation</span>
                                            <span className="font-medium text-slate-900 capitalize">{addons.cancellation.replace("_", " ")}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Premium Service</span>
                                            <span className="font-medium text-slate-900">{addons.premiumService ? "Included" : "Not Selected"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Important Info / Disclaimer */}
                            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex gap-2 items-start">
                                <div className="mt-0.5 min-w-[16px]">ℹ️</div>
                                <p>
                                    By clicking "Continue", you agree to the airline's Fare Rules and our Terms & Conditions.
                                    Please ensure your passport is valid for at least 6 months beyond your travel date.
                                    Visa requirements are the passenger's responsibility.
                                </p>
                            </div>

                            <div className="flex justify-center py-2">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACDad5fMdvn-A7YA"}
                                    onSuccess={(token) => setToken(token)}
                                />
                            </div>
                        </div>
                    )}
                    {step === 5 && <StepPayment details={payment} onChange={setPayment} />}
                </div>

                {error && (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mt-4 text-center mx-4">
                        {error}
                    </div>
                )}

                <div className="mt-4 pt-4 px-4 md:px-8 border-t flex justify-between shrink-0">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 5 ? (
                        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                            Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                                </>
                            ) : (
                                "Confirm & Submit"
                            )}
                        </Button>
                    )}
                </div>
            </div>

            <div className="hidden lg:flex w-96 bg-slate-50 border-l flex-col h-full overflow-y-auto overscroll-contain" data-lenis-prevent="true">
                <div className="p-6 space-y-6 pb-32">
                    <div className="bg-blue-100 text-blue-800 p-4 rounded-xl text-center">
                        <div className="text-2xl mb-1">🎉</div>
                        <h3 className="font-bold text-lg">You've struck gold!</h3>
                        <p className="text-xs mt-1">Cabin and fare confirmed.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-3">Price Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Base Fare x {passengers.length}</span>
                                <span>${flight.price * passengers.length}</span>
                            </div>

                            {/* Seat Selection */}
                            {seats.price > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Seat Selection</span>
                                    <span>${seats.price}</span>
                                </div>
                            )}

                            {/* Baggage */}
                            {passengers.some(p => p.baggage === "add") && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Extra Baggage x {passengers.filter(p => p.baggage === "add").length}</span>
                                    <span>${passengers.filter(p => p.baggage === "add").length * 50}</span>
                                </div>
                            )}

                            {/* Ticket Exchange */}
                            {passengers.some(p => p.ticketExchange) && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Ticket Exchange x {passengers.filter(p => p.ticketExchange).length}</span>
                                    <span>${passengers.filter(p => p.ticketExchange).length * 54}</span>
                                </div>
                            )}

                            {/* SMS Updates */}
                            {passengers.some(p => p.smsUpdates) && (
                                <div className="flex justify-between text-slate-600">
                                    <span>SMS Updates x {passengers.filter(p => p.smsUpdates).length}</span>
                                    <span>${passengers.filter(p => p.smsUpdates).length * 6}</span>
                                </div>
                            )}

                            {/* Flexible Ticket */}
                            {addons.flexibleTicket && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Flexible Ticket x {passengers.length}</span>
                                    <span>${45 * passengers.length}</span>
                                </div>
                            )}

                            {/* Cancellation Insurance */}
                            {addons.cancellation !== "none" && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Cancellation ({addons.cancellation === "any_reason" ? "Any Reason" : "Flexible"}) x {passengers.length}</span>
                                    <span>${(addons.cancellation === "any_reason" ? 65 : 37) * passengers.length}</span>
                                </div>
                            )}

                            {/* Premium Service */}
                            {addons.premiumService && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Premium Service x {passengers.length}</span>
                                    <span>${12 * passengers.length}</span>
                                </div>
                            )}

                            {/* Visual Coupon Section */}
                            <div className="border-t pt-3 mt-3">
                                <label className="text-xs font-semibold text-slate-700 mb-3 block flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                    {couponApplied ? 'Applied Coupon' : 'Available Coupons'}
                                </label>

                                {!couponApplied ? (
                                    <div className="space-y-2">
                                        {/* DOM10 Coupon Card */}
                                        <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-3">
                                            <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                                                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414l8.128-8.127a1 1 0 00-1.414-1.414L7.165 11.42a3.5 3.5 0 10-1.665-6.58zm0 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="pr-6">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono font-bold text-green-700 text-base">DOM10</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">10% OFF</span>
                                                </div>
                                                <p className="text-xs text-green-600 mb-2">For domestic flights</p>
                                                {isFlightDomestic() ? (
                                                    <button
                                                        onClick={() => {
                                                            setCouponCode("DOM10")
                                                            setTimeout(applyCoupon, 0)
                                                        }}
                                                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-semibold transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Not applicable</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* INT20 Coupon Card */}
                                        <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                                            <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                                                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414l8.128-8.127a1 1 0 00-1.414-1.414L7.165 11.42a3.5 3.5 0 10-1.665-6.58zm0 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="pr-6">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono font-bold text-blue-700 text-base">INT20</span>
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">20% OFF</span>
                                                </div>
                                                <p className="text-xs text-blue-600 mb-2">For international flights</p>
                                                {!isFlightDomestic() ? (
                                                    <button
                                                        onClick={() => {
                                                            setCouponCode("INT20")
                                                            setTimeout(applyCoupon, 0)
                                                        }}
                                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-semibold transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Not applicable</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`relative overflow-hidden rounded-lg border-2 border-dashed p-3 ${couponCode === 'DOM10'
                                        ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50'
                                        : 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50'
                                        }`}>
                                        <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                                            <svg className={`w-5 h-5 ${couponCode === 'DOM10' ? 'text-green-400' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414l8.128-8.127a1 1 0 00-1.414-1.414L7.165 11.42a3.5 3.5 0 10-1.665-6.58zm0 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="pr-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className={`font-mono font-bold text-base ${couponCode === 'DOM10' ? 'text-green-700' : 'text-blue-700'}`}>
                                                    {couponCode}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${couponCode === 'DOM10' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {discount * 100}% OFF Applied
                                                </span>
                                            </div>
                                            <button
                                                onClick={removeCoupon}
                                                className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                                            >
                                                Remove Coupon
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {couponApplied && discount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount ({discount * 100}%)</span>
                                    <span>-${Math.round((flight.price * passengers.length) * discount)}</span>
                                </div>
                            )}

                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-slate-900">
                                <span>Total</span>
                                <span className="text-blue-600">${calculateTotal()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
