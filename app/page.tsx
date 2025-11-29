"use client"

import { useState, Suspense } from "react"
import { Menu, Plane, Users, ArrowRight, CheckCircle2, Mail, Phone, ArrowLeftRight, MapPin, Search, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchWidget } from "@/components/search-widget"
import { ConcentricCircles } from "@/components/concentric-circles"
import { Navbar } from "@/components/navbar";
import { PromoPopup } from "@/components/promo-popup";
import { Footer } from "@/components/footer";

import { PackagesCarousel } from "@/components/packages-carousel";



const flights = [
  {
    id: 1,
    airline: "United Airlines",
    airlineCode: "UA",
    from: "JFK",
    to: "DXB",
    departure: "14:30",
    arrival: "22:45",
    duration: "8h 15m",
    stops: "Non-stop",
    price: 145,
    rating: 4.8,
  },
  {
    id: 2,
    airline: "American Airlines",
    airlineCode: "AA",
    from: "JFK",
    to: "DXB",
    departure: "10:00",
    arrival: "18:30",
    duration: "8h 30m",
    stops: "Non-stop",
    price: 135,
    rating: 4.6,
  },
  {
    id: 3,
    airline: "Delta Air Lines",
    airlineCode: "DL",
    from: "JFK",
    to: "DXB",
    departure: "16:45",
    arrival: "23:59",
    duration: "9h 14m",
    stops: "1 stop in Frankfurt",
    price: 125,
    rating: 4.5,
  },
  {
    id: 4,
    airline: "Frontier Airlines",
    airlineCode: "F9",
    from: "JFK",
    to: "DXB",
    departure: "08:15",
    arrival: "16:30",
    duration: "8h 15m",
    stops: "Non-stop",
    price: 110,
    rating: 4.3,
  },
]





function HomeContent() {
  const router = useRouter()
  const [selectedFlight, setSelectedFlight] = useState<(typeof flights)[0] | null>(null)
  const [showInquiry, setShowInquiry] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    requests: "",
  })

  const handleSelectFlight = (flight: (typeof flights)[0]) => {
    // Calculate tomorrow's date for the search
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    // Navigate to search results
    const params = new URLSearchParams({
      from: flight.from,
      to: flight.to,
      date: dateStr,
      passengers: "1"
    })

    router.push(`/flights?${params.toString()}`)
  }

  const handleSubmit = () => {
    console.log("Inquiry submitted:", { ...formData, flight: selectedFlight })
    setShowInquiry(false)
    setFormData({ name: "", email: "", phone: "", requests: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section with Concentric Circle Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8">
        <ConcentricCircles />



        <div className="relative z-10 text-center px-3 sm:px-8 max-w-5xl mx-auto animate-fade-in-up w-full">
          <p className="text-lg sm:text-lg md:text-xl text-slate-600 mb-4 sm:mb-4 font-light">
            We create trips you never thought possible
          </p>
          <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-5 sm:mb-6 leading-tight">
            Your Gateway to <span className="text-blue-600">Premium Travel</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto font-light">
            Discover and book luxury flights with personalized service. Your journey to the world starts here.
          </p>

          {/* Search Widget */}
          <SearchWidget />
        </div>
      </section>

      {/* Destinations Gallery */}
      {/* Destinations Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Featured Destinations</h2>
          <p className="text-lg text-slate-600">Explore our curated selection of premium travel destinations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {[
            {
              name: "Bangkok",
              code: "BKK",
              image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800&auto=format&fit=crop",
              className: "md:col-span-2"
            },
            {
              name: "Seoul",
              code: "ICN",
              image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800&auto=format&fit=crop",
              className: "md:col-span-1"
            },
            {
              name: "Tokyo",
              code: "HND",
              image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
              className: "md:col-span-1"
            },
            {
              name: "New York",
              code: "JFK",
              origin: "LAX",
              image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop",
              className: "md:col-span-2"
            },
            {
              name: "Rome",
              code: "FCO",
              image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
              className: "md:col-span-2"
            },
            {
              name: "Israel",
              code: "TLV",
              image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?q=80&w=800&auto=format&fit=crop",
              className: "md:col-span-1"
            },
          ].map((dest, idx) => {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const dateStr = tomorrow.toISOString().split('T')[0]

            return (
              <Link
                key={dest.name}
                href={`/flights?from=${dest.origin || 'JFK'}&to=${dest.code}&date=${dateStr}&passengers=1`}
                className={`group relative overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 ${dest.className}`}
              >
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-bold mb-2">{dest.name}</h3>
                  <div className="flex items-center gap-2 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="text-sm font-medium uppercase tracking-wider">Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Flight Results */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Available Flights</h2>
          <div className="space-y-4">
            {flights.map((flight, idx) => (
              <div
                key={flight.id}
                className="bg-white rounded-xl p-6 border border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 relative rounded-full overflow-hidden border border-slate-100 bg-white shrink-0">
                        <Image
                          src={`https://pics.avs.io/200/200/${flight.airlineCode}.png`}
                          alt={flight.airline}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{flight.airline}</h3>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-slate-600 pl-[80px]">
                      <span className="font-semibold">{flight.from}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-semibold">{flight.to}</span>
                      <span className="text-sm">({flight.stops})</span>
                    </div>
                  </div>
                  <div className="flex-1 text-right md:text-center">
                    <p className="text-sm text-slate-600">
                      {flight.departure} - {flight.arrival} ({flight.duration})
                    </p>
                  </div>
                  <div className="flex items-center gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${flight.price}</p>
                      <p className="text-xs text-slate-600">★ {flight.rating}</p>
                    </div>
                    <Button
                      onClick={() => handleSelectFlight(flight)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Carousel */}
      <PackagesCarousel />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle2 className="w-8 h-8" />,
                title: "Verified Bookings",
                description: "All flights are verified and confirmed for your peace of mind",
              },
              {
                icon: <Mail className="w-8 h-8" />,
                title: "24/7 Support",
                description: "Our dedicated team is here to assist you around the clock",
              },
              {
                icon: <Plane className="w-8 h-8" />,
                title: "Best Prices",
                description: "Get the most competitive flight rates in the market",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-8 border border-blue-100 text-center hover:shadow-lg transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      <Footer />

      {/* Inquiry Dialog */}
      <Dialog open={showInquiry} onOpenChange={setShowInquiry}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Flight Inquiry</DialogTitle>
            <DialogDescription>
              {selectedFlight && `${selectedFlight.airline} - ${selectedFlight.from} → ${selectedFlight.to}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Special Requests"
              value={formData.requests}
              onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 h-24"
            />
            <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Submit Inquiry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PromoPopup />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-50 to-white"><div className="text-blue-600 text-lg">Loading...</div></div>}>
      <HomeContent />
    </Suspense>
  )
}
