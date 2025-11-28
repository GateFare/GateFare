"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react"
import { ConcentricCircles } from "@/components/concentric-circles"
import { Navbar } from "@/components/navbar"
import Turnstile from "react-turnstile"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    })

    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [token, setToken] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (!token) {
            setError("Please complete the security check")
            setLoading(false)
            return
        }

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, token }),
            })

            if (!response.ok) {
                throw new Error("Failed to submit message")
            }

            setSubmitted(true)
            setFormData({ name: "", email: "", subject: "", message: "" })
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-white">
            <Navbar />

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                <ConcentricCircles />
                <div className="relative z-10 w-full px-4 sm:px-8 max-w-6xl mx-auto animate-fade-in-up py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-4">Get in Touch</h1>
                        <p className="text-lg text-slate-600">We'd love to hear from you. Send us a message or visit our office.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 backdrop-blur-sm">
                            {submitted ? (
                                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                                    <p className="text-slate-600">Thank you for contacting us. We'll reply shortly.</p>
                                    <Button
                                        onClick={() => setSubmitted(false)}
                                        variant="outline"
                                        className="mt-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name *</label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address *</label>
                                        <Input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Subject *</label>
                                        <Input
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="How can we help?"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Message *</label>
                                        <textarea
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Your message here..."
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 h-32 resize-none"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <Turnstile
                                            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACDad5fMdvn-A7YA"}
                                            onVerify={(token) => setToken(token)}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8 flex flex-col justify-center">
                            {[
                                {
                                    icon: <Mail className="w-6 h-6" />,
                                    title: "Email Us",
                                    content: "support@gatefare.com",
                                    sub: "We reply within 24 hours",
                                },
                                {
                                    icon: <Phone className="w-6 h-6" />,
                                    title: "Call Us",
                                    content: "+1 (555) 123-4567",
                                    sub: "Mon-Fri, 9am-6pm EST",
                                },
                                {
                                    icon: <MapPin className="w-6 h-6" />,
                                    title: "Visit Us",
                                    content: "30 N Gould St Ste R, Sheridan, WY 82801, USA",
                                    sub: "Come say hello at our office",
                                },
                            ].map((info, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-blue-100 hover:shadow-lg transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-start gap-6">
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full text-blue-600 shrink-0">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{info.title}</h3>
                                            <p className="text-lg text-blue-700 font-medium mb-1">{info.content}</p>
                                            <p className="text-slate-500">{info.sub}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section >

            <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3 className="text-2xl font-bold text-blue-400 mb-4">Gatefare</h3>
                            <p className="text-slate-400 text-sm">Your premium gateway to world-class travel experiences</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                                <li><Link href="/enquiry" className="hover:text-blue-400 transition-colors">Enquiry</Link></li>
                                <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Support</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                                <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Contact</h4>
                            <div className="space-y-3 text-slate-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                    <span>support@gatefare.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-400" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8">
                        <p className="text-center text-slate-400 text-sm">© 2025 Gatefare. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div >
    )
}
