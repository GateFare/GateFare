"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export interface FilterState {
    maxPrice: number
    airlines: string[]
    stops: string[]
    sortBy: string
    durationOutbound: [number, number]  // in hours
    durationInbound: [number, number]    // in hours
    departureTimeOutbound: [number, number]  // in hours (0-24)
    departureTimeInbound: [number, number]   // in hours (0-24)
}

interface FlightFiltersProps {
    minPrice: number
    maxPrice: number
    airlines: string[]
    filters: FilterState
    setFilters: (filters: FilterState) => void
    className?: string
}

export function FlightFilters({
    minPrice,
    maxPrice,
    airlines,
    filters,
    setFilters,
    className,
}: FlightFiltersProps) {
    const handleAirlineChange = (airline: string, checked: boolean) => {
        if (checked) {
            setFilters({ ...filters, airlines: [...filters.airlines, airline] })
        } else {
            setFilters({
                ...filters,
                airlines: filters.airlines.filter((a) => a !== airline),
            })
        }
    }

    const handleStopsChange = (stop: string, checked: boolean) => {
        if (checked) {
            setFilters({ ...filters, stops: [...filters.stops, stop] })
        } else {
            setFilters({
                ...filters,
                stops: filters.stops.filter((s) => s !== stop),
            })
        }
    }

    const formatHours = (hours: number) => {
        const h = Math.floor(hours)
        const m = Math.round((hours - h) * 60)
        return `${h}h ${m}m`
    }

    const formatTime = (hour: number) => {
        const h = Math.floor(hour)
        const period = h >= 12 ? 'PM' : 'AM'
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
        return `${displayHour}:00 ${period}`
    }

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 h-auto p-0 hover:bg-transparent hover:text-blue-700"
                    onClick={() =>
                        setFilters({
                            maxPrice: maxPrice,
                            airlines: [],
                            stops: [],
                            sortBy: "price_asc",
                            durationOutbound: [0, 24],
                            durationInbound: [0, 24],
                            departureTimeOutbound: [0, 24],
                            departureTimeInbound: [0, 24],
                        })
                    }
                >
                    Clear all
                </Button>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
                <Label>Sort By</Label>
                <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="price_asc">Cheapest First</SelectItem>
                        <SelectItem value="price_desc">Expensive First</SelectItem>
                        <SelectItem value="duration_asc">Shortest Duration</SelectItem>
                        <SelectItem value="departure_asc">Earliest Departure</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Max Price</Label>
                    <span className="text-sm font-medium text-blue-600">
                        ${filters.maxPrice}
                    </span>
                </div>
                <Slider
                    value={[filters.maxPrice]}
                    min={minPrice}
                    max={maxPrice}
                    step={10}
                    onValueChange={(value) =>
                        setFilters({ ...filters, maxPrice: value[0] })
                    }
                    className="py-4"
                />
            </div>

            {/* Duration Filter */}
            <details className="border-t pt-4" open>
                <summary className="font-medium cursor-pointer mb-4">Duration</summary>
                <div className="space-y-5 ml-2">
                    {/* Outbound Duration */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-slate-600">Outbound</Label>
                            <span className="text-xs font-medium text-blue-600">
                                {formatHours(filters.durationOutbound[0])} - {formatHours(filters.durationOutbound[1])}
                            </span>
                        </div>
                        <Slider
                            value={filters.durationOutbound}
                            min={0}
                            max={24}
                            step={0.5}
                            onValueChange={(value) =>
                                setFilters({ ...filters, durationOutbound: value as [number, number] })
                            }
                            className="py-2"
                        />
                    </div>

                    {/* Inbound Duration */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-slate-600">Inbound</Label>
                            <span className="text-xs font-medium text-blue-600">
                                {formatHours(filters.durationInbound[0])} - {formatHours(filters.durationInbound[1])}
                            </span>
                        </div>
                        <Slider
                            value={filters.durationInbound}
                            min={0}
                            max={24}
                            step={0.5}
                            onValueChange={(value) =>
                                setFilters({ ...filters, durationInbound: value as [number, number] })
                            }
                            className="py-2"
                        />
                    </div>
                </div>
            </details>

            {/* Departure Times Filter */}
            <details className="border-t pt-4" open>
                <summary className="font-medium cursor-pointer mb-4">Departure times</summary>
                <div className="space-y-5 ml-2">
                    {/* Outbound Departure Time */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-slate-600">Outbound</Label>
                            <span className="text-xs font-medium text-blue-600">
                                {formatTime(filters.departureTimeOutbound[0])} - {formatTime(filters.departureTimeOutbound[1])}
                            </span>
                        </div>
                        <Slider
                            value={filters.departureTimeOutbound}
                            min={0}
                            max={24}
                            step={1}
                            onValueChange={(value) =>
                                setFilters({ ...filters, departureTimeOutbound: value as [number, number] })
                            }
                            className="py-2"
                        />
                    </div>

                    {/* Inbound Departure Time */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-slate-600">Inbound</Label>
                            <span className="text-xs font-medium text-blue-600">
                                {formatTime(filters.departureTimeInbound[0])} - {formatTime(filters.departureTimeInbound[1])}
                            </span>
                        </div>
                        <Slider
                            value={filters.departureTimeInbound}
                            min={0}
                            max={24}
                            step={1}
                            onValueChange={(value) =>
                                setFilters({ ...filters, departureTimeInbound: value as [number, number] })
                            }
                            className="py-2"
                        />
                    </div>
                </div>
            </details>

            {/* Stops */}
            <div className="space-y-3 border-t pt-4">
                <Label>Stops</Label>
                <div className="space-y-2">
                    {["Non-stop", "1 Stop", "2+ Stops"].map((stop) => (
                        <div key={stop} className="flex items-center space-x-2">
                            <Checkbox
                                id={`stop-${stop}`}
                                checked={filters.stops.includes(stop)}
                                onCheckedChange={(checked) =>
                                    handleStopsChange(stop, checked as boolean)
                                }
                            />
                            <label
                                htmlFor={`stop-${stop}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {stop}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Airlines */}
            <div className="space-y-3 border-t pt-4">
                <Label>Airlines</Label>
                <div className="space-y-2">
                    {airlines.map((airline) => (
                        <div key={airline} className="flex items-center space-x-2">
                            <Checkbox
                                id={`airline-${airline}`}
                                checked={filters.airlines.includes(airline)}
                                onCheckedChange={(checked) =>
                                    handleAirlineChange(airline, checked as boolean)
                                }
                            />
                            <label
                                htmlFor={`airline-${airline}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {airline}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
