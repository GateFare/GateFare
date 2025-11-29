"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Briefcase, Luggage } from "lucide-react"

export interface PassengerDetails {
    gender: "male" | "female"
    firstName: string
    lastName: string
    dobDay: string
    dobMonth: string
    dobYear: string
    passport: string
    email: string
    countryCode: string
    phone: string
    baggage: "none" | "add"
    ticketExchange: boolean
    smsUpdates: boolean
}

interface StepPassengerProps {
    passengers: PassengerDetails[]
    onChange: (index: number, details: PassengerDetails) => void
}

export function StepPassenger({ passengers, onChange }: StepPassengerProps) {
    const updatePassenger = (index: number, field: keyof PassengerDetails, value: any) => {
        onChange(index, { ...passengers[index], [field]: value })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {passengers.map((passenger, index) => (
                <div key={index} className="space-y-8">
                    {/* Passenger Details Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-slate-900">Passenger {index + 1}, {index === 0 ? "Adult (Primary)" : "Adult"}</h3>

                        <RadioGroup
                            value={passenger.gender}
                            onValueChange={(v) => updatePassenger(index, "gender", v)}
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id={`male-${index}`} className="text-blue-600 border-blue-600" />
                                <Label htmlFor={`male-${index}`} className="cursor-pointer">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id={`female-${index}`} className="text-blue-600 border-blue-600" />
                                <Label htmlFor={`female-${index}`} className="cursor-pointer">Female</Label>
                            </div>
                        </RadioGroup>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600">First Name <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Legal first name"
                                    value={passenger.firstName}
                                    onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Last Name <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Legal last name"
                                    value={passenger.lastName}
                                    onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Date of Birth <span className="text-red-500">*</span></Label>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="DD"
                                    className="w-20 bg-slate-50 border-slate-200"
                                    value={passenger.dobDay}
                                    onChange={(e) => updatePassenger(index, "dobDay", e.target.value)}
                                    required
                                />
                                <Select
                                    value={passenger.dobMonth}
                                    onValueChange={(v) => updatePassenger(index, "dobMonth", v)}
                                    required
                                >
                                    <SelectTrigger className="w-28 bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="YYYY"
                                    className="w-24 bg-slate-50 border-slate-200"
                                    value={passenger.dobYear}
                                    onChange={(e) => updatePassenger(index, "dobYear", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                                        <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">i</span>
                                        <span className="underline decoration-dotted">What about passport details?</span>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <p className="text-sm text-slate-600">Passport details are not required at the time of booking. You can add them later via 'Manage Booking' or during online check-in.</p>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`ticket-exchange-${index}`}
                                    checked={passenger.ticketExchange}
                                    onCheckedChange={(c) => updatePassenger(index, "ticketExchange", c === true)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label htmlFor={`ticket-exchange-${index}`} className="font-medium cursor-pointer">Ticket Exchange</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] cursor-help">i</span>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <p className="text-sm text-slate-600">Ticket Exchange allows you to change your flight dates or times for a reduced fee or free of charge, subject to airline availability and fare difference.</p>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <span className="font-bold text-slate-900">$54</span>
                        </div>
                    </div>

                    {/* Baggage Allowance Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Luggage className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Baggage Allowance</h3>
                        </div>

                        <p className="text-sm text-slate-600">
                            Review and manage the baggage allowance for Passenger {index + 1}; if the airline allows, add extra now to avoid higher costs later.
                        </p>

                        {/* Personal Item */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-900">Personal item</h4>
                            <div className="bg-slate-50 p-4 rounded-lg flex gap-4 items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600">A small bag that must fit under the seat in front of you.</p>
                                    <span className="text-xs font-bold text-blue-600 uppercase mt-1 block">Included</span>
                                </div>
                            </div>
                        </div>

                        {/* Hand Baggage */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-900">Hand baggage</h4>
                            <div className="bg-slate-50 p-4 rounded-lg flex gap-4 items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                                    <Luggage className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600">Your standard hand baggage, such as a roller bag or duffle, must fit within the overhead compartment.</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-blue-600 uppercase">Included</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="rotate-45">📎</span> 8 kg
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <div className="flex items-center gap-2 text-blue-700 font-medium text-sm bg-white px-3 py-1 rounded-full border border-blue-100">
                                        <span className="bg-blue-600 text-white rounded-sm p-0.5">✓</span>
                                        Free
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1 font-medium">1 piece (8 kg)</div>
                                </div>
                            </div>
                        </div>

                        {/* Checked Baggage */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900">Checked baggage</h4>
                            <div className="flex gap-4 items-start mb-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                                    <Luggage className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Regular suitcases or bags, not including sports equipment or other special items.</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                        <span className="text-orange-500 font-bold uppercase">Select Option</span>
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <span className="rotate-45">📎</span> 23 kg
                                        </span>
                                        <span className="text-slate-500">1 piece</span>
                                        <span className="text-blue-600 underline cursor-pointer">(Options)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-t-lg w-full">
                                Cheaper now than at the airport!
                            </div>
                            <RadioGroup
                                value={passenger.baggage}
                                onValueChange={(v) => updatePassenger(index, "baggage", v)}
                                className="border rounded-b-lg divide-y mt-0"
                            >
                                <div className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${passenger.baggage === 'add' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="add" id={`bag-add-${index}`} className="text-blue-600 border-blue-600" />
                                        <Label htmlFor={`bag-add-${index}`} className="cursor-pointer font-medium">Add it</Label>
                                    </div>
                                    <span className="font-bold text-slate-900">$99<span className="text-xs font-normal text-slate-500">/flight</span></span>
                                </div>
                                <div className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${passenger.baggage === 'none' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="none" id={`bag-none-${index}`} className="text-blue-600 border-blue-600" />
                                        <Label htmlFor={`bag-none-${index}`} className="cursor-pointer font-medium">No checked baggage</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>
            ))}

            {/* Contact Information (Only once) */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Contact information</h3>
                <p className="text-sm text-slate-600 -mt-4">
                    Enter the email address and phone number to which your confirmation and flight updates will be sent. Please make sure they are correct.
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-600">Email Address <span className="text-red-500">*</span></Label>
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={passengers[0].email}
                            onChange={(e) => updatePassenger(0, "email", e.target.value)}
                            className="bg-slate-50 border-slate-200 h-12"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Phone Number <span className="text-red-500">*</span></Label>
                        <div className="flex gap-0">
                            <Select
                                value={passengers[0].countryCode}
                                onValueChange={(v) => updatePassenger(0, "countryCode", v)}
                            >
                                <SelectTrigger className="w-[110px] h-[48px] bg-slate-50 border-slate-200 rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="+91" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                    <SelectItem value="+971">🇦🇪 +971</SelectItem>
                                    <SelectItem value="+61">🇦🇺 +61</SelectItem>
                                    <SelectItem value="+1-CA">🇨🇦 +1</SelectItem>
                                    <SelectItem value="+49">🇩🇪 +49</SelectItem>
                                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                                    <SelectItem value="+81">🇯🇵 +81</SelectItem>
                                    <SelectItem value="+86">🇨🇳 +86</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                type="tel"
                                placeholder="Mobile number"
                                value={passengers[0].phone}
                                onChange={(e) => updatePassenger(0, "phone", e.target.value)}
                                className="bg-slate-50 border-slate-200 rounded-l-none h-[48px]"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="sms"
                            checked={passengers[0].smsUpdates}
                            onCheckedChange={(c) => updatePassenger(0, "smsUpdates", c === true)}
                            className="data-[state=checked]:bg-blue-600 border-slate-300"
                        />
                        <Label htmlFor="sms" className="text-sm font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                            Flight updates via SMS
                            <Popover>
                                <PopoverTrigger asChild>
                                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">i</span>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <p className="text-sm text-slate-600">Receive real-time updates about your flight status, gate changes, and delays directly to your mobile phone.</p>
                                </PopoverContent>
                            </Popover>
                        </Label>
                    </div>
                    <span className="font-bold text-slate-900">$6</span>
                </div>
            </div>

            <div className="text-xs text-slate-500 px-2">
                Before proceeding, <span className="font-bold text-slate-700">double-check that your details match your passport.</span> If available, please consider <span className="text-blue-600 font-medium">adding checked baggage</span> now to avoid higher fees later.
            </div>
        </div>
    )
}
