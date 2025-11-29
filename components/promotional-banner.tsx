import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, ShieldCheck, CreditCard, Sparkles } from "lucide-react"

interface PromotionalBannerProps {
    variant?: "sidebar" | "inline" | "hero"
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    image?: string
    icon?: "phone" | "shield" | "card" | "sparkles"
    color?: "blue" | "indigo" | "amber" | "emerald"
}

export function PromotionalBanner({
    variant = "sidebar",
    title,
    description,
    actionLabel = "Learn More",
    onAction,
    image,
    icon,
    color = "blue"
}: PromotionalBannerProps) {

    const getIcon = () => {
        switch (icon) {
            case "phone": return <Phone className="w-6 h-6" />
            case "shield": return <ShieldCheck className="w-6 h-6" />
            case "card": return <CreditCard className="w-6 h-6" />
            case "sparkles": return <Sparkles className="w-6 h-6" />
            default: return null
        }
    }

    const colorStyles = {
        blue: "from-blue-500 to-blue-600 text-white",
        indigo: "from-indigo-500 to-purple-600 text-white",
        amber: "from-amber-400 to-orange-500 text-white",
        emerald: "from-emerald-400 to-teal-500 text-white",
    }

    const bgStyles = {
        blue: "bg-blue-50 border-blue-100",
        indigo: "bg-indigo-50 border-indigo-100",
        amber: "bg-amber-50 border-amber-100",
        emerald: "bg-emerald-50 border-emerald-100",
    }

    if (variant === "sidebar") {
        return (
            <div className={`rounded-xl border p-5 ${bgStyles[color]} mb-4 overflow-hidden relative group`}>
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${colorStyles[color]} opacity-10 group-hover:scale-150 transition-transform duration-500`} />

                <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorStyles[color]} flex items-center justify-center mb-3 shadow-sm`}>
                        {getIcon()}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{description}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white hover:bg-white/80 border-slate-200"
                        onClick={onAction}
                    >
                        {actionLabel}
                    </Button>
                </div>
            </div>
        )
    }

    if (variant === "inline") {
        return (
            <div className="relative rounded-xl overflow-hidden mb-4 group">
                {/* Background Image or Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colorStyles[color]}`}>
                    {image && (
                        <>
                            <div className="absolute inset-0 bg-black/20" />
                            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                        </>
                    )}
                </div>

                <div className="relative z-10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                            {getIcon()}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{title}</h3>
                            <p className="text-blue-50/90 text-sm max-w-md">{description}</p>
                        </div>
                    </div>
                    <Button
                        className="bg-white text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                        onClick={onAction}
                    >
                        {actionLabel} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        )
    }

    return null
}
