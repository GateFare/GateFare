"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin } from "lucide-react"
import Image from "next/image"

import Link from "next/link"

const packages = [
    {
        id: 1,
        city: "Dubai",
        country: "UAE",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1920&auto=format&fit=crop", // Updated Dubai Image
        price: "$149",
        description: "Experience luxury in the desert. Visit the Burj Khalifa and Palm Jumeirah."
    },
    {
        id: 2,
        city: "Jerusalem",
        country: "Israel",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1920&auto=format&fit=crop",
        price: "$139",
        description: "Explore ancient history and vibrant culture in the heart of the Middle East."
    },
    {
        id: 3,
        city: "New York",
        country: "USA",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1920&auto=format&fit=crop",
        price: "$129",
        description: "The city that never sleeps. Times Square, Central Park, and Broadway await."
    },
    {
        id: 4,
        city: "Paris",
        country: "France",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1920&auto=format&fit=crop",
        price: "$119",
        description: "Romance, art, and cuisine. See the Eiffel Tower and Louvre Museum."
    }
]

export function PackagesCarousel() {
    const [emblaRef] = useEmblaCarousel({ loop: true, duration: 60 }, [Autoplay({ delay: 5000, stopOnInteraction: false })])

    return (
        <section className="relative w-full h-screen overflow-hidden bg-slate-900">
            <div className="absolute inset-0" ref={emblaRef}>
                <div className="flex h-full">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="relative flex-[0_0_100%] h-full min-w-0">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={pkg.image}
                                    alt={pkg.city}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 flex flex-col items-start justify-end h-full">
                                <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="flex items-center gap-2 text-blue-400 text-lg font-bold mb-4 uppercase tracking-wider">
                                        <MapPin className="w-5 h-5" />
                                        {pkg.country}
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                        {pkg.city}
                                    </h2>
                                    <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
                                        {pkg.description}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        <Link href={(function () {
                                            const nextYear = new Date();
                                            nextYear.setFullYear(nextYear.getFullYear() + 1);
                                            const dateStr = nextYear.toISOString().split('T')[0];
                                            const params = new URLSearchParams({
                                                from: "JFK", // Default origin
                                                to: pkg.city,
                                                date: dateStr,
                                                passengers: "1",
                                                maxPrice: "150"
                                            });
                                            return `/flights?${params.toString()}`;
                                        })()}>
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-900/20 transition-all hover:scale-105">
                                                Book Now <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </Link>
                                        <div className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20">
                                            <span className="text-sm text-slate-300 mr-2">Starting from</span>
                                            <span className="text-xl font-bold">{pkg.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
