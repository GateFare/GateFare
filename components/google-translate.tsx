"use client"

import { useEffect, useState } from "react"

declare global {
    interface Window {
        googleTranslateElementInit: () => void
        google: any
    }
}

export function GoogleTranslate() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        window.googleTranslateElementInit = () => {
            const target = document.getElementById("google_translate_element")
            if (target) target.innerHTML = ""
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: "en,ru,it,de,fr,es,nl,az,ja,zh-CN,ar",
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                "google_translate_element"
            )
        }

        const script = document.createElement("script")
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        script.async = true
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
            delete (window as any).googleTranslateElementInit
        }
    }, [])

    if (!mounted) return null

    return (
        <div className="google-translate-container">
            <div id="google_translate_element" />
        </div>
    )
}
