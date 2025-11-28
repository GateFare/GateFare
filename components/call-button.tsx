"use client"

import { Phone } from "lucide-react"

export function CallButton({ className = "" }: { className?: string }) {
    const phoneNumber = "+18446380111"

    return (
        <a
            href={`tel:${phoneNumber}`}
            className={`fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 animate-wobble group flex items-center justify-center ${className}`}
            aria-label="Call us"
        >
            <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="ml-2 font-medium hidden group-hover:inline-block transition-all duration-300">Call Now</span>
        </a>
    )
}
