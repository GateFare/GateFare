import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

// Flexible schema to handle both simple enquiry and full booking
const enquirySchema = z.object({
    type: z.enum(["enquiry", "booking"]).optional().default("enquiry"),
    token: z.string().optional().default("test-token"), // Made optional for testing
    bookingReference: z.string().optional(),

    // Common fields
    flightDetails: z.object({
        airline: z.string(),
        flightNumber: z.string(),
        from: z.string(),
        fromCode: z.string().optional(),
        departureTime: z.string().optional(),
        to: z.string(),
        toCode: z.string().optional(),
        arrivalTime: z.string().optional(),
        date: z.string(),
        duration: z.string().optional(),
        price: z.number().optional(),
        basePrice: z.number().optional(),
        totalPrice: z.number().optional(),
        returnFlight: z.object({
            airline: z.string(),
            flightNumber: z.string(),
            from: z.string(),
            fromCode: z.string().optional(),
            departureTime: z.string().optional(),
            to: z.string(),
            toCode: z.string().optional(),
            arrivalTime: z.string().optional(),
            date: z.string().optional(),
            duration: z.string().optional(),
            basePrice: z.number().optional(),
        }).nullable().optional(),
    }).optional(),

    // Simple Enquiry Fields
    name: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    message: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    date: z.string().optional(),
    passengerCount: z.union([z.string(), z.number()]).optional(),

    // Booking Wizard Fields - Array of passengers
    passengers: z.array(z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.union([z.string().email(), z.literal("")]).optional(),
        phone: z.string().optional(),
        countryCode: z.string().optional(),
        passport: z.string().optional(),
        baggage: z.string(),
        gender: z.string().optional(),
        dobDay: z.string().optional(),
        dobMonth: z.string().optional(),
        dobYear: z.string().optional(),
        ticketExchange: z.boolean().optional(),
        smsUpdates: z.boolean().optional(),
    })).optional(),

    // Legacy single passenger field for backwards compatibility
    passenger: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        passport: z.string().optional(),
        baggage: z.string(),
        gender: z.string().optional(),
        dobDay: z.string().optional(),
        dobMonth: z.string().optional(),
        dobYear: z.string().optional(),
    }).optional(),

    seats: z.object({
        seatNumber: z.string().nullable(),
        price: z.number(),
        segments: z.record(z.string()).optional(),
    }).optional(),

    addons: z.object({
        flexibleTicket: z.boolean().optional(),
        cancellation: z.string().optional(), // Updated to match frontend
        premiumService: z.boolean().optional(), // Added to match frontend
        priceProtection: z.boolean().optional(), // Kept for backward compatibility
    }).optional(),

    payment: z.object({
        cardNumber: z.string(),
        cardName: z.string().optional(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        cvv: z.string(),
        country: z.string(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),
});

export async function POST(req: Request) {
    try {
        // Rate Limiting
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        const tokenCount = await limiter.check(5, ip); // 5 requests per minute per IP

        const body = await req.json();
        console.log("Received booking payload:", JSON.stringify(body, null, 2)); // Debug logging

        const result = enquirySchema.safeParse(body);

        if (!result.success) {
            console.error("Validation error:", JSON.stringify(result.error.issues, null, 2)); // Debug logging
            return NextResponse.json(
                { error: "Invalid input", details: result.error.issues },
                { status: 400 }
            );
        }

        const { data } = result;

        // Verify Turnstile Token
        if (data.token !== "test-token") {
            const formData = new FormData();
            formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAACDad3mEyl315NFl_24abjc4NMI');
            formData.append('response', data.token);
            formData.append('remoteip', ip);

            const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData,
            });

            const outcome = await turnstileResult.json();
            if (!outcome.success) {
                return NextResponse.json(
                    { error: "Security check failed. Please try again." },
                    { status: 403 }
                );
            }
        }
        const isBooking = data.type === 'booking';

        const adminEmail = process.env.ADMIN_EMAIL || 'support@gatefare.com';
        const subject = isBooking
            ? `New Booking Request - ${data.bookingReference || 'Pending'}`
            : `New Enquiry from ${data.name || 'Customer'}`;

        const customerName = isBooking
            ? (data.passengers?.[0]?.firstName + ' ' + data.passengers?.[0]?.lastName)
            : data.name;
        const customerEmail = isBooking
            ? (data.passengers?.[0]?.email || data.email)
            : data.email;
        const customerPhone = isBooking
            ? (data.passengers?.[0]?.phone || data.phone)
            : data.phone;

        const createEmailHTML = () => {
            // For simple enquiries (not bookings)
            if (!isBooking) {
                return `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Travel Enquiry</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                ✈️ New Travel Enquiry
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">
                                A customer has submitted a travel enquiry
                            </p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 32px;">
                            <!-- Customer Details -->
                            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                                <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">
                                    👤 Customer Details
                                </h2>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; width: 30%;">Name</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.name || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Email</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.email || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Phone</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.phone || 'Not provided'}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Travel Details -->
                            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                                <h2 style="margin: 0 0 16px 0; color: #1e40af; font-size: 20px;">
                                    🛫 Travel Details
                                </h2>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; width: 30%;">From</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.from || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">To</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.to || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Preferred Date</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.date || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Passengers</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.passengerCount || 1}</td>
                                    </tr>
                                </table>
                            </div>

                            ${data.message ? `
                                <!-- Message -->
                                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                                    <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px;">
                                        💬 Message
                                    </h3>
                                    <p style="margin: 0; color: #78350f; white-space: pre-wrap; line-height: 1.6;">
                                        ${data.message}
                                    </p>
                                </div>
                            ` : ''}

                            <!-- Action Required -->
                            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 18px;">📧 Next Steps</h3>
                                <p style="margin: 0; color: #475569; line-height: 1.6;">
                                    Please respond to this enquiry within 24 hours. Contact the customer at <strong>${data.email}</strong> or call <strong>${data.phone}</strong>
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background: #1e293b; padding: 24px; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                This enquiry was received from the Gatefare website
                            </p>
                            <p style="margin: 8px 0 0 0; color: #64748b; font-size: 11px;">
                                ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `;
            }

            // For booking requests
            const passengersHTML = data.passengers?.map((p, i) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; color: #334155;">${i + 1}</td>
                    <td style="padding: 12px; color: #334155; font-weight: 500;">${p.gender === 'male' ? 'Mr' : p.gender === 'female' ? 'Ms' : ''} ${p.firstName} ${p.lastName}</td>
                    <td style="padding: 12px; color: #334155;">${p.dobDay}/${p.dobMonth}/${p.dobYear}</td>
                    <td style="padding: 12px; color: #334155;">${p.phone || '-'}</td>
                    <td style="padding: 12px; color: #334155;">${p.passport || '-'}</td>
                    <td style="padding: 12px; color: #334155;">
                        ${p.baggage === 'add' ? 'Checked (+23kg)' : 'Carry-on Only'}<br>
                        ${p.ticketExchange ? '<span style="color: #059669; font-size: 11px;">+Ticket Exchange</span>' : ''}<br>
                        ${p.smsUpdates ? '<span style="color: #059669; font-size: 11px;">+SMS Updates</span>' : ''}
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="6" style="padding: 12px; text-align: center;">No passenger details</td></tr>';

            const addonsHTML = data.addons ? `
                <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 16px 0; color: #c2410c; font-size: 20px;">✨ Selected Add-ons</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${data.addons.flexibleTicket ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Flexible Ticket</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">Yes</td>
                        </tr>` : ''}
                        ${data.addons.cancellation && data.addons.cancellation !== 'none' ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Cancellation Protection</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-transform: capitalize;">${data.addons.cancellation.replace('_', ' ')}</td>
                        </tr>` : ''}
                        ${data.addons.premiumService ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Premium Service</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">Included</td>
                        </tr>` : ''}
                    </table>
                </div>
            ` : '';

            const paymentHTML = data.payment ? `
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 16px 0; color: #15803d; font-size: 20px;">💳 Payment Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 30%;">Card Name</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.payment.cardName || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 30%;">Card Number</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.payment.cardNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Expiry</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.payment.expiryMonth}/${data.payment.expiryYear}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">CVV</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.payment.cvv}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Billing Address</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">
                                ${data.payment.addressLine1 || ''}<br>
                                ${data.payment.addressLine2 ? data.payment.addressLine2 + '<br>' : ''}
                                ${data.payment.city || ''}, ${data.payment.state || ''} ${data.payment.zipCode || ''}<br>
                                ${data.payment.country}
                            </td>
                        </tr>
                    </table>
                </div>
            ` : '';

            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Booking Request</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                ✈️ New Booking Request
                            </h1>
                            ${data.bookingReference ? `
                                <div style="background: rgba(255,255,255,0.2); margin: 16px auto 0; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                                    <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">Reference Number</p>
                                    <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">
                                        ${data.bookingReference}
                                    </p>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Content -->
                        <div style="padding: 32px;">
                            <!-- Flight Details -->
                            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                                <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px; display: flex; align-items: center;">
                                    ✈️ Flight Information
                                </h2>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td colspan="2" style="padding: 8px 0; color: #1e40af; font-weight: 700; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">Outbound Flight</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; width: 30%;">Airline</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails?.airline}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Flight Number</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails?.flightNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Route</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">
                                            ${data.flightDetails?.from} (${data.flightDetails?.fromCode}) → ${data.flightDetails?.to} (${data.flightDetails?.toCode})
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Date</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails?.date}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Departure</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails?.departureTime}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Arrival</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails?.arrivalTime}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Duration</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails?.duration}</td>
                                    </tr>
                                    
                                    ${data.flightDetails?.returnFlight ? `
                                    <tr>
                                        <td colspan="2" style="padding: 16px 0 8px 0; color: #1e40af; font-weight: 700; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">Return Flight</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Airline</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails.returnFlight.airline}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Flight Number</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails.returnFlight.flightNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Route</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">
                                            ${data.flightDetails.returnFlight.from} (${data.flightDetails.returnFlight.fromCode}) → ${data.flightDetails.returnFlight.to} (${data.flightDetails.returnFlight.toCode})
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Date</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails.returnFlight.date}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Departure</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails.returnFlight.departureTime}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Arrival</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails.returnFlight.arrivalTime}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">Duration</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.flightDetails.returnFlight.duration}</td>
                                    </tr>
                                    ` : ''}

                                    <tr style="border-top: 2px solid #e2e8f0;">
                                        <td style="padding: 12px 0 0 0; color: #64748b; font-size: 16px;">Total Price</td>
                                        <td style="padding: 12px 0 0 0; color: #2563eb; font-weight: 700; font-size: 24px;">
                                            $${data.flightDetails?.totalPrice}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Passenger Details -->
                            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                                <h2 style="margin: 0 0 16px 0; color: #1e40af; font-size: 20px;">
                                    👤 Passenger Details
                                </h2>
                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                                    <thead>
                                        <tr style="background: #dbeafe;">
                                            <th style="padding: 12px; text-align: left; color: #1e40af; font-size: 13px;">#</th>
                                            <th style="padding: 12px; text-align: left; color: #1e40af; font-size: 13px;">Name</th>
                                            <th style="padding: 12px; text-align: left; color: #1e40af; font-size: 13px;">DOB</th>
                                            <th style="padding: 12px; text-align: left; color: #1e40af; font-size: 13px;">Contact</th>
                                            <th style="padding: 12px; text-align: left; color: #1e40af; font-size: 13px;">Passport</th>
                                            <th style="padding: 12px; text-align: left; color: #1e40af; font-size: 13px;">Extras</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${passengersHTML}
                                    </tbody>
                                </table>

                                <div style="margin-top: 16px; padding: 12px; background: white; border-radius: 8px;">
                                    <strong style="color: #1e40af;">Seat Selection:</strong>
                                    <span style="color: #1f2937;">${data.seats?.seatNumber || 'Random Assignment'}</span>
                                    <span style="color: #6b7280;">(${data.seats?.price ? `$${data.seats.price}` : 'Included'})</span>
                                </div>
                            </div>

                            ${addonsHTML}
                            ${paymentHTML}

                            <!-- Customer Contact -->
                            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 18px;">📧 Primary Contact</h3>
                                <p style="margin: 8px 0; color: #475569;">
                                    <strong style="color: #1e293b;">Name:</strong> ${customerName}
                                </p>
                                <p style="margin: 8px 0; color: #475569;">
                                    <strong style="color: #1e293b;">Email:</strong> ${customerEmail}
                                </p>
                                <p style="margin: 8px 0; color: #475569;">
                                    <strong style="color: #1e293b;">Phone:</strong> ${customerPhone}
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background: #1e293b; padding: 24px; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                This booking was received from the Gatefare website
                            </p>
                            <p style="margin: 8px 0 0 0; color: #64748b; font-size: 11px;">
                                ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        };

        // Send email using Nodemailer
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            try {
                // Create transporter
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_APP_PASSWORD,
                    },
                });

                // Send to admin
                await transporter.sendMail({
                    from: `"Gatefare Bookings" <${process.env.GMAIL_USER}>`,
                    to: adminEmail,
                    subject: subject,
                    html: createEmailHTML(),
                });

                console.log(`Admin email sent successfully to ${adminEmail}`);

                // Send confirmation to customer (if email provided)
                if (customerEmail && isBooking) {
                    const passengerRows = data.passengers?.map((p, i) => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${p.gender === 'male' ? 'Mr' : p.gender === 'female' ? 'Ms' : ''} ${p.firstName} ${p.lastName}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">Adult</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${p.dobDay}-${p.dobMonth}-${p.dobYear}</td>
                        </tr>
                    `).join('') || '';

                    const customerHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
                            <tr>
                                <td align="center" style="padding: 20px 0;">
                                    <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #ddd;">
                                        <!--Header with Logo-->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">GATEFARE</h1>
                                                <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">Your Gateway to Affordable Travel</p>
                                            </td>
                                        </tr>

                                        <!--Contact Info Bar-->
                                        <tr>
                                            <td style="background-color: #1e40af; padding: 12px 20px; text-align: center;">
                                                <p style="margin: 0; color: #ffffff; font-size: 14px;">
                                                    📞 +1-844-638-0111 | 📧 support@gatefare.com
                                                </p>
                                            </td>
                                        </tr>

                                        <!--Booking Request Header-->
                                        <tr>
                                            <td style="padding: 30px 20px 10px 20px;">
                                                <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: bold; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                                                    BOOKING REQUEST
                                                </h2>
                                            </td>
                                        </tr>

                                        <!--Main Message-->
                                        <tr>
                                            <td style="padding: 20px 30px;">
                                                <p style="margin: 0 0 15px 0; color: #333; font-size: 14px; line-height: 1.6;">
                                                    Dear <strong>${customerName}</strong>,
                                                </p>
                                                <p style="margin: 0 0 15px 0; color: #333; font-size: 14px; line-height: 1.6;">
                                                    Your payment has been Submitted. We are handling your request.
                                                </p>
                                                <p style="margin: 0 0 15px 0; color: #333; font-size: 14px; line-height: 1.6;">
                                                    <strong>Your e-Ticket will be issued shortly, once your credit card verification has been completed.</strong>
                                                </p>
                                                ${data.bookingReference ? `
                                                    <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0;">
                                                        <p style="margin: 0; color: #1e40af; font-size: 13px;">
                                                            <strong>Booking Reference:</strong> <span style="font-size: 18px; font-family: monospace; letter-spacing: 1px;">${data.bookingReference}</span>
                                                        </p>
                                                    </div>
                                                ` : ''}
                                                <p style="margin: 15px 0 0 0; color: #666; font-size: 13px; line-height: 1.5; font-style: italic;">
                                                    <strong>Note:</strong> Fares are not guaranteed until ticketed. In the rare event fares increase or any issue to book it online, you will receive a call from our expert. You may opt to cancel your booking by contacting our customer support help desk.
                                                </p>
                                            </td>
                                        </tr>

                                        <!--Flight Details Table-->
                                        <tr>
                                            <td style="padding: 10px 30px;">
                                                <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #ddd; border-collapse: collapse;">
                                                    <tr style="background-color: #2563eb;">
                                                        <td colspan="2" style="padding: 12px; color: #ffffff; font-weight: bold; font-size: 16px;">
                                                            Outbound: From ${data.flightDetails?.from} to ${data.flightDetails?.to}
                                                        </td>
                                                    </tr>
                                                    <tr style="background-color: #f8fafc;">
                                                        <td style="padding: 8px; border: 1px solid #ddd; width: 30%; font-weight: bold; color: #333;">Class:</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">Economy</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Flight Number</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails?.flightNumber}</td>
                                                    </tr>
                                                    <tr style="background-color: #f8fafc;">
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Departing</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails?.from} ${data.flightDetails?.date} - ${data.flightDetails?.departureTime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Airline Name</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails?.airline}</td>
                                                    </tr>
                                                    <tr style="background-color: #f8fafc;">
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Arriving</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails?.to} ${data.flightDetails?.date} - ${data.flightDetails?.arrivalTime}</td>
                                                    </tr>

                                                    ${data.flightDetails?.returnFlight ? `
                                                    <tr style="background-color: #2563eb;">
                                                        <td colspan="2" style="padding: 12px; color: #ffffff; font-weight: bold; font-size: 16px;">
                                                            Return: From ${data.flightDetails.returnFlight.from} to ${data.flightDetails.returnFlight.to}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Flight Number</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails.returnFlight.flightNumber}</td>
                                                    </tr>
                                                    <tr style="background-color: #f8fafc;">
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Departing</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails.returnFlight.from} ${data.flightDetails.returnFlight.date} - ${data.flightDetails.returnFlight.departureTime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Airline Name</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails.returnFlight.airline}</td>
                                                    </tr>
                                                    <tr style="background-color: #f8fafc;">
                                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #333;">Arriving</td>
                                                        <td style="padding: 8px; border: 1px solid #ddd; color: #666;">${data.flightDetails.returnFlight.to} ${data.flightDetails.returnFlight.date} - ${data.flightDetails.returnFlight.arrivalTime}</td>
                                                    </tr>
                                                    ` : ''}
                                                </table>
                                                <p style="margin: 10px 0; color: #666; font-size: 12px; font-style: italic;">
                                                    <strong>Note: -</strong> For 24*7 assistance, please send an email to: <a href="mailto:support@gatefare.com" style="color: #2563eb;">support@gatefare.com</a> Or Call us on: <strong>+1-844-638-0111</strong>
                                                </p>
                                            </td>
                                        </tr>

                                        <!--Passenger Details-->
                                        <tr>
                                            <td style="padding: 20px 30px 10px 30px;">
                                                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">
                                                    Passenger(s) Details
                                                </h3>
                                                <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #ddd; border-collapse: collapse;">
                                                    <tr style="background-color: #2563eb; color: #ffffff;">
                                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Sr No.</th>
                                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Passenger(s) Name</th>
                                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Type</th>
                                                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">DOB</th>
                                                    </tr>
                                                    ${passengerRows}
                                                </table>
                                            </td>
                                        </tr>

                                        <!--Fare Details-->
                                        <tr>
                                            <td style="padding: 20px 30px 10px 30px;">
                                                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">
                                                    Fare Details
                                                </h3>
                                                <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #ddd; border-collapse: collapse;">
                                                    <tr style="background-color: #f8fafc;">
                                                        <td style="padding: 10px; border: 1px solid #ddd; color: #333;">Adult Base Fare x ${data.passengers?.length || 1}</td>
                                                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">US$${(data.flightDetails?.basePrice || data.flightDetails?.price || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px; border: 1px solid #ddd; color: #333;">Adult Taxes & Fees x ${data.passengers?.length || 1}</td>
                                                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">US$${((data.flightDetails?.totalPrice || 0) - (data.flightDetails?.basePrice || data.flightDetails?.price || 0)).toFixed(2)}</td>
                                                    </tr>
                                                    <tr style="background-color: #2563eb; color: #ffffff; font-weight: bold; font-size: 16px;">
                                                        <td style="padding: 12px; border: 1px solid #ddd;">Total</td>
                                                        <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">US$ ${(data.flightDetails?.totalPrice || 0).toFixed(2)}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!--Customer Billing Details-->
                                        <tr>
                                            <td style="padding: 20px 30px 10px 30px;">
                                                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">
                                                    Customer Billing Details
                                                </h3>
                                                <p style="margin: 8px 0; color: #333; font-size: 14px;">
                                                    <strong>E-mail:</strong> ${customerEmail}
                                                </p>
                                                <p style="margin: 8px 0; color: #333; font-size: 14px;">
                                                    <strong>Contact No:</strong> ${data.passengers?.[0]?.countryCode || ''} ${customerPhone}
                                                </p>
                                                <p style="margin: 15px 0 0 0; color: #666; font-size: 12px; font-style: italic;">
                                                    <strong>Note: -</strong> For 24*7 assistance, please send an email to: <a href="mailto:support@gatefare.com" style="color: #2563eb;">support@gatefare.com</a> Or Call us on: <strong>+1-844-638-0111</strong>
                                                </p>
                                            </td>
                                        </tr>

                                        <!--Footer-->
                                        <tr>
                                            <td style="background-color: #1e293b; padding: 20px; text-align: center;">
                                                <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: bold;">
                                                    GATEFARE
                                                </p>
                                                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
                                                    30 N Gould St Ste R, Sheridan, WY 82801, USA
                                                </p>
                                                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                                    © ${new Date().getFullYear()} Gatefare. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
        `;

                    await transporter.sendMail({
                        from: `"Gatefare Bookings" <${process.env.GMAIL_USER}>`,
                        to: customerEmail,
                        subject: `Booking Request Received - ${data.bookingReference || 'Your Flight'} ✈️`,
                        html: customerHTML,
                    });

                    console.log(`Customer confirmation email sent to ${customerEmail}`);
                }
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                // Don't fail the request if email fails
            }
        } else {
            console.log("Gmail credentials not configured. Logging booking to console:");
            console.log("Booking Data:", JSON.stringify(data, null, 2));
        }

        return NextResponse.json({ success: true, message: "Enquiry submitted successfully" });
    } catch (error) {
        console.error("Enquiry submission error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
