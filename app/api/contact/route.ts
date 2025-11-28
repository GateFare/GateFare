import { NextResponse } from "next/server"
import { z } from "zod"
import nodemailer from "nodemailer"
import rateLimit from "@/lib/rate-limit"

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
})

const contactSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    subject: z.string().min(5),
    message: z.string().min(10),
    token: z.string().min(1, "Turnstile token is required"),
})

async function verifyTurnstile(token: string) {
    const secretKey = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAACDad3mEyl315NFl_24abjc4NMI';
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            secret: secretKey,
            response: token,
        }),
    });

    const data = await response.json();
    return data.success;
}

export async function POST(req: Request) {
    try {
        // Rate Limiting
        try {
            await limiter.check(5, "CACHE_TOKEN_CONTACT"); // 5 requests per minute
        } catch {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const body = await req.json()
        const validatedData = contactSchema.parse(body)

        // Verify Turnstile
        const isHuman = await verifyTurnstile(validatedData.token);
        if (!isHuman) {
            return NextResponse.json({ error: "Security check failed" }, { status: 400 });
        }

        // Send email using Nodemailer
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });

            const adminEmail = process.env.ADMIN_EMAIL || "support@gatefare.com";

            await transporter.sendMail({
                from: `"Gatefare Contact" <${process.env.GMAIL_USER}>`,
                to: adminEmail,
                subject: `New Contact Message: ${validatedData.subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #1e40af; margin-bottom: 20px;">New Contact Message</h2>
                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <p style="margin: 5px 0;"><strong>Name:</strong> ${validatedData.name}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${validatedData.email}</p>
                            <p style="margin: 5px 0;"><strong>Subject:</strong> ${validatedData.subject}</p>
                        </div>
                        <div style="margin-top: 20px;">
                            <h3 style="color: #334155; font-size: 16px;">Message:</h3>
                            <p style="white-space: pre-wrap; color: #475569; line-height: 1.6;">${validatedData.message}</p>
                        </div>
                    </div>
                `,
            });

            return NextResponse.json({ success: true })
        } else {
            console.log("Gmail credentials not configured. Logging contact message to console:");
            console.log("Contact Data:", validatedData);
            // Return success even if email not configured in dev, but warn
            return NextResponse.json({ success: true, warning: "Email not sent (credentials missing)" })
        }

    } catch (error) {
        console.error("Contact API Error:", error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
