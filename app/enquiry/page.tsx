"use client"

import type React from "react"

import { Mail, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ConcentricCircles } from "@/components/concentric-circles"
import { Navbar } from "@/components/navbar"
import Turnstile from "react-turnstile"

export default function EnquiryPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    from: "",
    to: "",
    date: "",
    passengers: "1",
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

    setError("")

    if (!token) {
      setError("Please complete the security check")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          passengers: parseInt(formData.passengers),
          token,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit enquiry")
      }

      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", from: "", to: "", date: "", passengers: "1", message: "" })
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-white">
      {/* ... existing navigation ... */}
      <Navbar />

      {/* Hero Section with Half Concentric Circle Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <ConcentricCircles />



        <div className="relative z-10 w-full px-4 sm:px-8 max-w-2xl mx-auto animate-fade-in-up">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-4">Travel Enquiry</h1>
            <p className="text-lg text-slate-600">Tell us about your dream journey and we'll help make it happen</p>
          </div>

          {/* ... existing form code ... */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 backdrop-blur-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Enquiry Submitted!</h2>
                <p className="text-slate-600">We'll get back to you within 24 hours</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number *</label>
                    <Input
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Number of Passengers</label>
                    <select
                      value={formData.passengers}
                      onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, "More"].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Passenger" : "Passengers"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Departure City *</label>
                    <Input
                      required
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      placeholder="e.g., London (LHR)"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Destination City *</label>
                    <Input
                      required
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      placeholder="e.g., Dubai (DXB)"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Preferred Date *</label>
                    <Input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Special Requests & Notes</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about any special requirements, preferences, or questions..."
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 h-24 resize-none"
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
                    "Submit Enquiry"
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              {
                icon: <Mail className="w-6 h-6" />,
                title: "Email Us",
                content: "support@gatefare.com",
              },
              {
                icon: <Phone className="w-6 h-6" />,
                title: "Call Us",
                content: "+1 (555) 123-4567",
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Visit Us",
                content: "30 N Gould St Ste R, Sheridan, WY 82801, USA",
              },
            ].map((info, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-blue-100 text-center hover:shadow-lg transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 text-blue-600">
                  {info.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{info.title}</h3>
                <p className="text-sm text-slate-600">{info.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ... existing footer ... */}
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
                <li>
                  <Link href="/" className="hover:text-blue-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/enquiry" className="hover:text-blue-400 transition-colors">
                    Enquiry
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-blue-400 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    FAQ
                  </a>
                </li>
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
    </div>
  )
}
