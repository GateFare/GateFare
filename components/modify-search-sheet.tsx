"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plane, MapPin, Calendar, Search, ArrowLeftRight, Check, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { Airport } from "@/lib/mock-data"

export function ModifySearchSheet() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = React.useState(false)

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

    // Load search data from URL params on mount or when params change
    React.useEffect(() => {
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const date = searchParams.get('date')
        const passengers = searchParams.get('passengers')
        const tripType = searchParams.get('tripType')
        const returnDate = searchParams.get('returnDate')
        const classType = searchParams.get('classType')

        if (from || to || date) {
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
        setOpen(false)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-1 md:flex-none">
                    <Search className="w-4 h-4 mr-2" />
                    Modify Search
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold text-slate-900">Modify Search</SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Trip Type & Class */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Trip Type</label>
                            <Select value={searchData.tripType} onValueChange={(value) => setSearchData({ ...searchData, tripType: value })}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select trip type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Return">Return</SelectItem>
                                    <SelectItem value="One-way">One-way</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Class</label>
                            <Select value={searchData.classType} onValueChange={(value) => setSearchData({ ...searchData, classType: value })}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Economy">Economy</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="First">First Class</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* From */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Plane className="w-4 h-4 text-blue-600" /> From
                        </label>
                        <Popover open={fromOpen} onOpenChange={setFromOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={fromOpen}
                                    className="h-12 w-full justify-between text-base"
                                >
                                    {searchData.from || "Departure City"}
                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput placeholder="Search airport..." onValueChange={searchAirports} />
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
                                                    <Check className={cn("mr-2 h-4 w-4", searchData.from.includes(airport.code) ? "opacity-100" : "opacity-0")} />
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
                    <div className="flex justify-center -my-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full hover:bg-blue-50 border border-slate-200"
                            onClick={() => setSearchData({ ...searchData, from: searchData.to, to: searchData.from })}
                        >
                            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                        </Button>
                    </div>

                    {/* To */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" /> To
                        </label>
                        <Popover open={toOpen} onOpenChange={setToOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={toOpen}
                                    className="h-12 w-full justify-between text-base"
                                >
                                    {searchData.to || "Destination City"}
                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput placeholder="Search airport..." onValueChange={searchAirports} />
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
                                                    <Check className={cn("mr-2 h-4 w-4", searchData.to.includes(airport.code) ? "opacity-100" : "opacity-0")} />
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

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" /> Depart
                            </label>
                            <Input
                                type="date"
                                value={searchData.departDate}
                                onChange={(e) => setSearchData({ ...searchData, departDate: e.target.value })}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" /> Return
                            </label>
                            <Input
                                type="date"
                                value={searchData.returnDate}
                                onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                                className="h-12"
                                disabled={searchData.tripType === "One-way"}
                            />
                        </div>
                    </div>

                    {/* Passengers */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Passengers</label>
                        <Select value={searchData.passengers} onValueChange={(value) => setSearchData({ ...searchData, passengers: value })}>
                            <SelectTrigger className="h-12">
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
                    </div>

                    <Button
                        onClick={handleSearch}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold mt-4"
                    >
                        Search Flights
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
