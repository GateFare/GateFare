"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Lock, User, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PaymentDetails {
    cardNumber: string
    cardName: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    country: string
}

interface StepPaymentProps {
    details: PaymentDetails
    onChange: (details: PaymentDetails) => void
}

export function StepPayment({ details, onChange }: StepPaymentProps) {
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 16) value = value.slice(0, 16)

        // Format with spaces
        const formatted = value.match(/.{1,4}/g)?.join(' ') || value
        onChange({ ...details, cardNumber: formatted })

        // Auto-advance
        if (value.length === 16) {
            document.getElementById('card-name')?.focus()
        }
    }

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 2) value = value.slice(0, 2)
        if (parseInt(value) > 12) value = '12'
        if (value.length === 2 && parseInt(value) === 0) value = '01'

        onChange({ ...details, expiryMonth: value })

        if (value.length === 2) {
            document.getElementById('expiry-year')?.focus()
        }
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 2) value = value.slice(0, 2)

        onChange({ ...details, expiryYear: value })

        if (value.length === 2) {
            document.getElementById('cvv')?.focus()
        }
    }

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 4) value = value.slice(0, 4)
        onChange({ ...details, cvv: value })
    }

    // Determine card type for visual
    const getCardType = (number: string) => {
        if (number.startsWith('4')) return 'Visa'
        if (number.startsWith('5')) return 'Mastercard'
        if (number.startsWith('3')) return 'Amex'
        return 'Card'
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8 items-start">

                {/* Left Column: Form */}
                <div className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                            Secure Payment
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                            All transactions are secure and encrypted.
                        </p>
                    </div>

                    {/* Card Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            Card Number
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={details.cardNumber}
                                onChange={handleCardNumberChange}
                                className="pl-10 h-12 text-lg font-mono border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                maxLength={19}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                {/* Simple visual indicators for card types */}
                                <div className={cn("w-8 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 transition-colors", details.cardNumber.startsWith('4') && "bg-blue-600 text-white")}>VISA</div>
                                <div className={cn("w-8 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 transition-colors", details.cardNumber.startsWith('5') && "bg-orange-500 text-white")}>MC</div>
                            </div>
                        </div>
                    </div>

                    {/* Name on Card */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            Name on Card
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="card-name"
                                type="text"
                                placeholder="JOHN DOE"
                                value={details.cardName}
                                onChange={(e) => onChange({ ...details, cardName: e.target.value.toUpperCase() })}
                                className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Expiry */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                Expiry Date
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="expiry-month"
                                        placeholder="MM"
                                        value={details.expiryMonth}
                                        onChange={handleMonthChange}
                                        className="h-12 text-center border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        maxLength={2}
                                    />
                                </div>
                                <div className="flex items-center text-slate-400">/</div>
                                <div className="relative flex-1">
                                    <Input
                                        id="expiry-year"
                                        placeholder="YY"
                                        value={details.expiryYear}
                                        onChange={handleYearChange}
                                        className="h-12 text-center border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        maxLength={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CVV */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                CVV / CVC
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="cvv"
                                    type="text"
                                    placeholder="123"
                                    value={details.cvv}
                                    onChange={handleCvvChange}
                                    className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    maxLength={4}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Billing Country</label>
                        <Select value={details.country} onValueChange={(value) => onChange({ ...details, country: value })}>
                            <SelectTrigger className="h-12 border-slate-300">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="US">🇺🇸 United States</SelectItem>
                                <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                                <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                                <SelectItem value="IN">🇮🇳 India</SelectItem>
                                <SelectItem value="AE">🇦🇪 United Arab Emirates</SelectItem>
                                <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                                <SelectItem value="FR">🇫🇷 France</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Right Column: Visual Card & Trust */}
                <div className="space-y-8">
                    {/* Visual Credit Card */}
                    <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.02] duration-300">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

                        {/* Decorative Circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>

                        {/* Card Content */}
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-8 bg-yellow-400/80 rounded-md flex items-center justify-center">
                                    <div className="w-8 h-5 border border-yellow-600/50 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                                        <div className="border border-yellow-600/30 rounded-[1px]"></div>
                                        <div className="border border-yellow-600/30 rounded-[1px]"></div>
                                        <div className="border border-yellow-600/30 rounded-[1px]"></div>
                                        <div className="border border-yellow-600/30 rounded-[1px]"></div>
                                    </div>
                                </div>
                                <div className="text-lg font-bold tracking-wider opacity-80">
                                    {getCardType(details.cardNumber)}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="font-mono text-2xl tracking-widest drop-shadow-md">
                                    {details.cardNumber || "0000 0000 0000 0000"}
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Card Holder</div>
                                        <div className="font-medium tracking-wide uppercase truncate max-w-[200px]">
                                            {details.cardName || "YOUR NAME"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Expires</div>
                                        <div className="font-mono font-medium">
                                            {details.expiryMonth || "MM"}/{details.expiryYear || "YY"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-full shrink-0">
                                <Lock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Booking Request Process</h4>
                                <p className="text-xs text-slate-600">Your information is securely transmitted for booking confirmation</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-2 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-slate-900">Secure Data Transmission:</span>
                                    <span className="text-slate-600"> Your details are encrypted when sent to us</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-slate-900">Manual Verification:</span>
                                    <span className="text-slate-600"> Our team reviews each booking request personally</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-slate-900">Confirmation Email:</span>
                                    <span className="text-slate-600"> You'll receive booking confirmation and next steps via email</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-slate-900">Payment Processing:</span>
                                    <span className="text-slate-600"> Card details are collected for booking confirmation only</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-blue-200 pt-4 mt-4">
                            <p className="text-xs text-center text-slate-500 mb-3">We accept all major credit cards</p>
                            <div className="flex justify-center gap-4">
                                <div className="bg-white px-3 py-1.5 rounded border border-slate-200 font-bold text-xs text-slate-700">VISA</div>
                                <div className="bg-white px-3 py-1.5 rounded border border-slate-200 font-bold text-xs text-slate-700">Mastercard</div>
                                <div className="bg-white px-3 py-1.5 rounded border border-slate-200 font-bold text-xs text-slate-700">AMEX</div>
                                <div className="bg-white px-3 py-1.5 rounded border border-slate-200 font-bold text-xs text-slate-700">Discover</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
