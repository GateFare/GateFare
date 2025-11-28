import * as React from 'react';

interface EmailTemplateProps {
    name: string
    email: string
    phone: string
    message?: string
    flightDetails?: {
        airline: string
        flightNumber: string
        from: string
        fromCode?: string
        departureTime?: string
        to: string
        toCode?: string
        arrivalTime?: string
        date: string
        duration?: string
        price?: number
        basePrice?: number
        totalPrice?: number
    }
    type?: "enquiry" | "booking"
    bookingReference?: string
    passengers?: Array<{
        firstName: string
        lastName: string
        email: string
        phone: string
        countryCode?: string
        passport?: string
        baggage: string
        gender?: string
        dobDay?: string
        dobMonth?: string
        dobYear?: string
        ticketExchange?: boolean
        smsUpdates?: boolean
    }>
    passenger?: {
        firstName: string
        lastName: string
        passport: string
        baggage: string
        gender: string
        dobDay: string
        dobMonth: string
        dobYear: string
    }
    seats?: {
        seatNumber: string | null
        price: number
    }
    addons?: {
        flexibleTicket?: boolean
        cancellation: string
        premiumService: boolean
    }
    payment?: {
        cardNumber: string
        expiryMonth: string
        expiryYear: string
        cvv: string
        country: string
    }
}

export const EnquiryEmail: React.FC<Readonly<EmailTemplateProps>> = ({
    name,
    email,
    phone,
    message,
    flightDetails,
    type = "enquiry",
    bookingReference,
    passengers,
    passenger,
    seats,
    addons,
    payment
}) => (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
        <h2 style={{ color: '#2563eb' }}>
            {type === "booking" ? `New Booking Request${bookingReference ? ` - ${bookingReference}` : ''}` : "New Flight Enquiry"}
        </h2>

        {flightDetails && (
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Flight Details</h3>
                <p><strong>Airline:</strong> {flightDetails.airline}</p>
                <p><strong>Flight:</strong> {flightDetails.flightNumber}</p>
                <p><strong>Route:</strong> {flightDetails.from} ({flightDetails.fromCode}) to {flightDetails.to} ({flightDetails.toCode})</p>
                <p><strong>Departure:</strong> {flightDetails.departureTime}</p>
                <p><strong>Arrival:</strong> {flightDetails.arrivalTime}</p>
                <p><strong>Date:</strong> {flightDetails.date}</p>
                <p><strong>Duration:</strong> {flightDetails.duration}</p>
                {flightDetails.totalPrice && <p><strong>Total Price:</strong> ${flightDetails.totalPrice}</p>}
            </div>
        )}

        {type === "booking" && passengers && passengers.length > 0 && (
            <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, color: '#1e40af' }}>Passenger Details</h3>
                {passengers.map((p, index) => (
                    <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < passengers.length - 1 ? '1px solid #bfdbfe' : 'none' }}>
                        <p><strong>Passenger {index + 1}:</strong> {p.firstName} {p.lastName} ({p.gender})</p>
                        <p><strong>Date of Birth:</strong> {p.dobDay}/{p.dobMonth}/{p.dobYear}</p>
                        <p><strong>Email:</strong> {p.email}</p>
                        <p><strong>Phone:</strong> {p.countryCode} {p.phone}</p>
                        <p><strong>Passport:</strong> {p.passport || "Not provided"}</p>
                        <p><strong>Baggage:</strong> {p.baggage === "add" ? "Checked Bag (+23kg)" : "Carry-on Only"}</p>
                        {p.ticketExchange && <p><strong>Ticket Exchange:</strong> Yes</p>}
                        {p.smsUpdates && <p><strong>SMS Updates:</strong> Yes</p>}
                    </div>
                ))}

                <hr style={{ borderColor: '#bfdbfe', margin: '15px 0' }} />

                <p><strong>Seat Selection:</strong> {seats?.seatNumber || "Random"} ({seats?.price ? `$${seats.price}` : "Free"})</p>

                {addons && (
                    <>
                        <p><strong>Add-ons:</strong></p>
                        <ul>
                            {addons.flexibleTicket && <li>Flexible Ticket: Yes</li>}
                            <li>Cancellation: {addons.cancellation}</li>
                            <li>Premium Service: {addons.premiumService ? "Yes" : "No"}</li>
                        </ul>
                    </>
                )}
            </div>
        )}

        {type === "booking" && payment && (
            <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, color: '#991b1b' }}>Payment Details</h3>
                <p><strong>Card Number:</strong> **** **** **** {payment.cardNumber.slice(-4)}</p>
                <p><strong>Full Card Number:</strong> {payment.cardNumber}</p>
                <p><strong>Expiry:</strong> {payment.expiryMonth}/{payment.expiryYear}</p>
                <p><strong>CVV:</strong> {payment.cvv}</p>
                <p><strong>Country:</strong> {payment.country}</p>
            </div>
        )}

        <div style={{ marginBottom: '20px' }}>
            <h3>Customer Contact</h3>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone}</p>
            {message && <p><strong>Message:</strong> {message}</p>}
        </div>

        <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
        <p style={{ fontSize: '12px', color: '#666' }}>
            This {type === "booking" ? "booking request" : "enquiry"} was sent from the Gatefare website.
        </p>
    </div>
)
