"use client"

import { useEffect, useRef, useState } from "react"

interface MaterialViewerProps {
    xml?: string
    style?: React.CSSProperties
    className?: string
}

export default function MaterialViewer({
    xml,
    style,
    className,
}: MaterialViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isScriptLoaded, setIsScriptLoaded] = useState(false)

    useEffect(() => {
        // Load Draw.io viewer script if not present
        if ((window as any).GraphViewer) {
            setIsScriptLoaded(true)
        } else {
            // Check if script tag already exists to avoid duplicate
            if (
                !document.querySelector(
                    'script[src="https://viewer.diagrams.net/js/viewer-static.min.js"]',
                )
            ) {
                const script = document.createElement("script")
                script.src =
                    "https://viewer.diagrams.net/js/viewer-static.min.js"
                script.async = true
                script.onload = () => {
                    setIsScriptLoaded(true)
                }
                document.body.appendChild(script)
            } else {
                // If script exists but GraphViewer not ready, we might need to poll or wait for onload (but can't attach easily if already appended).
                // Usually it loads fast. We can check interval.
                const checkInterval = setInterval(() => {
                    if ((window as any).GraphViewer) {
                        setIsScriptLoaded(true)
                        clearInterval(checkInterval)
                    }
                }, 500)
                return () => clearInterval(checkInterval)
            }
        }
    }, [])

    useEffect(() => {
        if (
            isScriptLoaded &&
            (window as any).GraphViewer &&
            containerRef.current
        ) {
            containerRef.current.innerHTML = ""
            // Force process elements
            if (
                typeof (window as any).GraphViewer.processElements ===
                "function"
            ) {
                ;(window as any).GraphViewer.processElements()
            }
        }
    }, [isScriptLoaded, xml])

    if (!xml) return null

    // Configuration for the viewer
    const viewerConfig = {
        highlight: "#0000ff",
        nav: true,
        resize: true,
        toolbar: "zoom",
        edit: "_blank",
        xml: xml,
    }

    return (
        <div
            ref={containerRef}
            className={`mxgraph ${className || ""}`}
            style={{
                maxWidth: "100%",
                border: "1px solid transparent",
                ...style,
            }}
            data-mxgraph={JSON.stringify(viewerConfig)}
        ></div>
    )
}
