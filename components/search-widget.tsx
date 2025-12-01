
"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plane, MapPin, Calendar, Search, ArrowLeftRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Airport } from "@/lib/mock-data"

function SearchWidgetContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchData, setSearchData] = React.useState({
        tripType: "Return",
        passengers: "1",
        classType: "Economy",
        from: "",
        to: "",
        departDate: "",
        returnDate: "",
    })

    const [fromOpen, setFromOpen] = React.useState(false)
    const [toOpen, setToOpen] = React.useState(false)
    const [airports, setAirports] = React.useState<Airport[]>([])
    const [loading, setLoading] = React.useState(false)

    // Load search data from URL params on mount
    React.useEffect(() => {
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const date = searchParams.get('date')
        const passengers = searchParams.get('passengers')
        const tripType = searchParams.get('tripType')
        const returnDate = searchParams.get('returnDate')
        const classType = searchParams.get('classType')

        if (from || to || date || passengers) {
            setSearchData(prev => ({
                ...prev,
                from: from || prev.from,
                to: to || prev.to,
                departDate: date || prev.departDate,
                passengers: passengers || prev.passengers,
                tripType: tripType || prev.tripType,
                returnDate: returnDate || prev.returnDate,
                classType: classType || prev.classType,
            }))
        }
    }, [searchParams])

    const searchAirports = async (query: string) => {
        if (query.length < 2) {
            setAirports([])
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`/api/flights/autocomplete?query=${query}`)
            const data = await res.json()
            setAirports(data.airports || [])
        } catch (error) {
            console.error("Failed to search airports", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        if (searchData.tripType === "Return" && !searchData.returnDate) {
            // You might want to show an error state here, but for now we'll just return
            // or maybe default to one-way? Better to enforce date selection.
            // Let's just alert for now or set a visual error if possible.
            // Since we don't have a toast/error state ready, let's just not search.
            // Or better, switch to One-way if they really want to search without date?
            // No, that's confusing.
            // Let's assume the user must pick a date.
            const input = document.querySelector('input[type="date"]:nth-of-type(2)') as HTMLInputElement;
            if (input) input.focus();
            return;
        }

        const params = new URLSearchParams({
            from: searchData.from,
            to: searchData.to,
            date: searchData.departDate,
            passengers: searchData.passengers,
            tripType: searchData.tripType,
            classType: searchData.classType,
        })
        if (searchData.returnDate) {
            params.set('returnDate', searchData.returnDate)
        }
        router.push(`/flights?${params.toString()}`)
    }


    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-5 sm:p-8 md:p-10 max-w-5xl mx-auto border border-blue-100 backdrop-blur-sm">
            {/* Row 1: Trip Type, Passengers, Class */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
                <Select value={searchData.tripType} onValueChange={(value) => setSearchData({ ...searchData, tripType: value })}>
                    <SelectTrigger className="h-12 sm:h-12 border-blue-200 focus:border-blue-500 text-base font-medium">
                        <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Return">Return</SelectItem>
                        <SelectItem value="One-way">One-way</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={searchData.passengers} onValueChange={(value) => setSearchData({ ...searchData, passengers: value })}>
                    <SelectTrigger className="h-12 sm:h-12 border-blue-200 focus:border-blue-500 text-base font-medium">
                        <SelectValue placeholder="Passengers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 passenger</SelectItem>
                        <SelectItem value="2">2 passengers</SelectItem>
                        <SelectItem value="3">3 passengers</SelectItem>
                        <SelectItem value="4">4 passengers</SelectItem>
                        <SelectItem value="5">5+ passengers</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={searchData.classType} onValueChange={(value) => setSearchData({ ...searchData, classType: value })}>
                    <SelectTrigger className="h-12 sm:h-12 border-blue-200 focus:border-blue-500 text-base font-medium">
                        <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Economy">Economy</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="First">First Class</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Row 2: From, Swap, To, Depart, Return, Search */}
            <div className="grid grid-cols-1 lg:grid-cols-13 gap-4 sm:gap-5 items-end">
                {/* From Input with Autocomplete */}
                <div className="lg:col-span-3 flex flex-col gap-2.5 sm:gap-3">
                    <label className="text-sm sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Plane className="w-4 sm:w-4 h-4 sm:h-4 text-blue-600" />
                        From
                    </label>
                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={fromOpen}
                                className="h-12 sm:h-12 border-blue-200 focus:border-blue-500 text-base font-medium justify-between w-full"
                            >
                                {searchData.from || "Departure City"}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command shouldFilter={false}>
                                <CommandInput
                                    placeholder="Search airport..."
                                    onValueChange={searchAirports}
                                />
                                <CommandList>
                                    <CommandEmpty>{loading ? "Searching..." : "No airport found."}</CommandEmpty>
                                    <CommandGroup>
                                        {airports.map((airport, index) => (
                                            <CommandItem
                                                key={`${airport.code}-${index}`}
                                                value={airport.code}
                                                onSelect={() => {
                                                    setSearchData({ ...searchData, from: `${airport.city} (${airport.code})` })
                                                    setFromOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        searchData.from.includes(airport.code) ? "opacity-100" : "opacity-0"
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

                {/* Swap Button */}
                <div className="lg:col-span-1 flex items-center justify-center pb-0 lg:pb-1 -my-2 lg:my-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 sm:h-10 sm:w-10 rounded-full hover:bg-blue-50 transition-colors"
                        onClick={() => setSearchData({ ...searchData, from: searchData.to, to: searchData.from })}
                    >
                        <ArrowLeftRight className="w-5 sm:w-5 h-5 sm:h-5 text-blue-600" />
                    </Button>
                </div>

                {/* To Input with Autocomplete */}
                <div className="lg:col-span-3 flex flex-col gap-2.5 sm:gap-3">
                    <label className="text-sm sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-4 sm:w-4 h-4 sm:h-4 text-blue-600" />
                        To
                    </label>
                    <Popover open={toOpen} onOpenChange={setToOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={toOpen}
                                className="h-12 sm:h-12 border-blue-200 focus:border-blue-500 text-base font-medium justify-between w-full"
                            >
                                {searchData.to || "Destination City"}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command shouldFilter={false}>
                                <CommandInput
                                    placeholder="Search airport..."
                                    onValueChange={searchAirports}
                                />
                                <CommandList>
                                    <CommandEmpty>{loading ? "Searching..." : "No airport found."}</CommandEmpty>
                                    <CommandGroup>
                                        {airports.map((airport, index) => (
                                            <CommandItem
                                                key={`${airport.code}-${index}`}
                                                value={airport.code}
                                                onSelect={() => {
                                                    setSearchData({ ...searchData, to: `${airport.city} (${airport.code})` })
                                                    setToOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        searchData.to.includes(airport.code) ? "opacity-100" : "opacity-0"
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

                {/* Date Inputs */}
                <div className="lg:col-span-2 flex flex-col gap-2.5 sm:gap-3">
                    <label className="text-sm sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-4 sm:w-4 h-4 sm:h-4 text-blue-600" />
                        Depart
                    </label>
                    <Input
                        type="date"
                        value={searchData.departDate}
                        onChange={(e) => setSearchData({ ...searchData, departDate: e.target.value })}
                        className="h-12 sm:h-12 border-blue-200 focus:border-blue-500 text-base font-medium"
                    />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-2.5 sm:gap-3">
                    <label className="text-sm sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-4 sm:w-4 h-4 sm:h-4 text-blue-600" />
                        Return
                    </label>
                    <Input
                        type="date"
                        value={searchData.returnDate}
                        onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                        className="h-12 sm:h-12 border-blue-200 focus:border-blue-500 text-base font-medium"
                        disabled={searchData.tripType === "One-way"}
                    />
                </div>

                {/* Search Button */}
                <div className="lg:col-span-2">
                    <Button
                        onClick={handleSearch}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 sm:h-12 px-6 sm:px-8 font-semibold flex items-center justify-center gap-2 rounded-lg sm:rounded-xl transition-all hover:shadow-lg text-base"
                    >
                        <Search className="w-5 sm:w-5 h-5 sm:h-5" />
                        Search
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function SearchWidget() {
    return (
        <Suspense fallback={
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-5 sm:p-8 md:p-10 max-w-5xl mx-auto border border-blue-100 backdrop-blur-sm">
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
                        <div className="h-12 bg-slate-200 rounded"></div>
                        <div className="h-12 bg-slate-200 rounded"></div>
                        <div className="h-12 bg-slate-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-13 gap-4 sm:gap-5">
                        <div className="lg:col-span-3 h-12 bg-slate-200 rounded"></div>
                        <div className="lg:col-span-1 h-12 bg-slate-200 rounded"></div>
                        <div className="lg:col-span-3 h-12 bg-slate-200 rounded"></div>
                        <div className="lg:col-span-2 h-12 bg-slate-200 rounded"></div>
                        <div className="lg:col-span-2 h-12 bg-slate-200 rounded"></div>
                        <div className="lg:col-span-2 h-12 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        }>
            <SearchWidgetContent />
        </Suspense>
    )
}
