"use client"

import type React from "react"

import { Mail, Phone, MapPin, CheckCircle2, Loader2, Search, Check, Plane } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ConcentricCircles } from "@/components/concentric-circles"
import { Navbar } from "@/components/navbar"
import Turnstile from "react-turnstile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Airport } from "@/lib/mock-data"

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

  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [airports, setAirports] = useState<Airport[]>([])
  const [loadingAirports, setLoadingAirports] = useState(false)

  const searchAirports = async (query: string) => {
    if (query.length < 2) {
      setAirports([])
      return
    }
    setLoadingAirports(true)
    try {
      const res = await fetch(`/api/flights/autocomplete?query=${query}`)
      const data = await res.json()
      setAirports(data.airports || [])
    } catch (error) {
      console.error("Failed to search airports", error)
    } finally {
      setLoadingAirports(false)
    }
  }

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
      // Exclude 'passengers' string from formData as API expects it to be an array
      const { passengers, ...submitData } = formData

      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...submitData,
          passengerCount: formData.passengers === "More" ? 6 : parseInt(formData.passengers),
          token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show validation errors
        if (data.details) {
          const errorMessages = data.details.map((err: any) => err.message).join(", ")
          setError(`Validation error: ${errorMessages}`)
        } else {
          setError(data.error || "Failed to submit enquiry")
        }
        setLoading(false)
        return
      }

      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", from: "", to: "", date: "", passengers: "1", message: "" })
    } catch (err) {
      console.error("Enquiry error:", err)
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
                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full h-12 border-blue-200 focus:border-blue-500 justify-start text-left font-normal"
                        >
                          <Plane className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className={cn(
                            "ml-2 truncate",
                            formData.from ? "text-slate-900" : "text-slate-500"
                          )}>
                            {formData.from || "Departure city"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search airport..."
                            onValueChange={searchAirports}
                          />
                          <CommandList>
                            <CommandEmpty>{loadingAirports ? "Searching..." : "No airport found."}</CommandEmpty>
                            <CommandGroup>
                              {airports.map((airport, index) => (
                                <CommandItem
                                  key={`${airport.code}-${index}`}
                                  value={airport.code}
                                  onSelect={() => {
                                    setFormData({ ...formData, from: `${airport.city} (${airport.code})` })
                                    setFromOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.from.includes(airport.code) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{airport.city}</span>
                                    <span className="text-xs text-muted-foreground">{airport.name} - {airport.code}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Destination City *</label>
                    <Popover open={toOpen} onOpenChange={setToOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full h-12 border-blue-200 focus:border-blue-500 justify-start text-left font-normal"
                        >
                          <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className={cn(
                            "ml-2 truncate",
                            formData.to ? "text-slate-900" : "text-slate-500"
                          )}>
                            {formData.to || "Destination city"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search airport..."
                            onValueChange={searchAirports}
                          />
                          <CommandList>
                            <CommandEmpty>{loadingAirports ? "Searching..." : "No airport found."}</CommandEmpty>
                            <CommandGroup>
                              {airports.map((airport, index) => (
                                <CommandItem
                                  key={`${airport.code}-${index}`}
                                  value={airport.code}
                                  onSelect={() => {
                                    setFormData({ ...formData, to: `${airport.city} (${airport.code})` })
                                    setToOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.to.includes(airport.code) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{airport.city}</span>
                                    <span className="text-xs text-muted-foreground">{airport.name} - {airport.code}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Preferred Date *</label>
                    <Input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-12 border-blue-200 focus:border-blue-500"
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
