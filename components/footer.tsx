import Link from "next/link"
import { Mail, Phone, Facebook, Instagram, MapPin } from "lucide-react"
import { GoogleTranslate } from "./google-translate"

export function Footer() {
    return (
        <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-blue-400 mb-4">Gatefare</h3>
                        <p className="text-slate-400 text-sm mb-6">Your premium gateway to world-class travel experiences</p>

                        {/* Language Selector */}
                        <GoogleTranslate />

                        {/* Flexible Payment Options */}
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-3">Payment Options</h5>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center w-12">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 object-contain" />
                            </div>
                            <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center w-12">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 object-contain" />
                            </div>
                            <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center w-12">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="Amex" className="h-4 object-contain" />
                            </div>
                            <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center w-12">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" className="h-4 object-contain" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Navigation</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li>
                                <Link href="/" className="hover:text-blue-400 transition-colors">
                                    Flights
                                </Link>
                            </li>
                            <li>
                                <Link href="/enquiry" className="hover:text-blue-400 transition-colors">
                                    Enquiry
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-blue-400 transition-colors">
                                    About
                                </Link>
                            </li>
                        </ul>

                        {/* Secured By */}
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-3">Secured By</h5>
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 border border-slate-700">
                                <span className="text-xs font-bold text-white">VISA</span>
                                <span className="text-[10px] text-slate-400">SECURE</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 border border-slate-700">
                                <div className="w-4 h-4 rounded-full bg-red-500 opacity-80"></div>
                                <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80 -ml-2"></div>
                                <span className="text-xs text-slate-300 ml-1">ID Check</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-serif italic text-slate-300">SafeKey</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li>
                                <Link href="/help" className="hover:text-blue-400 transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                                    Terms of Service
                                </Link>
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
                                <span>+1-844-638-0111</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-blue-400 mt-1" />
                                <span>30 N Gould St Ste R,<br />Sheridan, WY 82801, USA</span>
                            </div>
                        </div>

                        <h4 className="font-semibold text-white mt-6 mb-4">Follow Us</h4>
                        <div className="flex gap-4">
                            <Link href="https://www.facebook.com/profile.php?id=61584546320338" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-colors text-white">
                                <Facebook className="w-4 h-4" />
                            </Link>
                            <Link href="https://www.instagram.com/gatefareusllc?igsh=MWJkNWU1d3dxMHhhZA==" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-pink-600 transition-colors text-white">
                                <Instagram className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
                <p className="text-center text-slate-400 text-sm">
                    © 2025 Gatefare. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
