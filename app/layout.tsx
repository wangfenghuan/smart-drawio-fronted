import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"
import { DiagramProvider } from "@/contexts/diagram-context"

import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
})

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export const metadata: Metadata = {
    title: "W-Next AI Drawio - AI-Driven Diagram Generator",
    description:
        "Multi-provider AI diagram generator supporting GLM, Qwen, Doubao, Qiniu, OpenAI, Anthropic, Google, and more. Create AWS architecture diagrams, flowcharts, and technical diagrams using natural language. Chinese-first interface with comprehensive AI model support.",
    keywords: [
        "AI diagram generator",
        "GLM",
        "Qwen",
        "Doubao",
        "Qiniu",
        "multi-provider AI",
        "AWS architecture",
        "flowchart creator",
        "draw.io",
        "AI drawing tool",
        "technical diagrams",
    ],
    authors: [{ name: "wangfenghuan" }],
    creator: "wangfenghuan",
    publisher: "wangfenghuan",
    openGraph: {
        title: "W-Next AI Drawio - Multi-Provider AI Diagram Generator",
        description:
            "Create professional diagrams with multi-provider AI support. Supports GLM, Qwen, Doubao, Qiniu, OpenAI, Anthropic, AWS, GCP, and Azure architecture diagrams.",
        type: "website",
        siteName: "W-Next AI Drawio",
        locale: "zh-CN",
        images: [
            {
                url: "/architecture.png",
                width: 1200,
                height: 630,
                alt: "W-Next AI Drawio - Multi-provider AI diagram creation tool",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "W-Next AI Drawio - Multi-Provider AI Diagram Generator",
        description:
            "AI-powered diagram generator with support for GLM, Qwen, Doubao, Qiniu, OpenAI, Anthropic, and more. Chinese-first interface.",
        images: ["/architecture.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "W-Next AI Drawio",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web Browser",
        description:
            "Multi-provider AI diagram generator with native support for Chinese AI models (GLM, Qwen, Doubao, Qiniu) and international providers (OpenAI, Anthropic, Google, Azure, AWS). Features natural language diagram creation, PDF upload support, diagram history, and targeted XML editing for professional diagrams.",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
    }

    return (
        <html lang="zh-CN" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body
                className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
            >
                <DiagramProvider>{children}</DiagramProvider>
            </body>
            {process.env.NEXT_PUBLIC_GA_ID && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
        </html>
    )
}
