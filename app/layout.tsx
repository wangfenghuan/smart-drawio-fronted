import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import "./globals.css"
import "../styles/markdown.css"

export const viewport: Viewport = {
    themeColor: "#1677ff",
    width: "device-width",
    initialScale: 1,
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://47.95.35.178"

export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: {
        template: "%s | IntelliDraw 智能绘图",
        default: "IntelliDraw - AI 驱动的无尽创意绘图平台",
    },
    description:
        "IntelliDraw 是新一代在线绘图工具，支持流程图、思维导图、UML、网络拓扑图、原型设计等多种图形。集成了 AI 辅助生成、实时团队协作、海量模板库，让创意即刻落地。",
    keywords: [
        "IntelliDraw",
        "draw.io",
        "diagram",
        "flowchart",
        "mind map",
        "UML",
        "AI drawing",
        "online whiteboard",
        "online diagram",
        "流程图",
        "思维导图",
        "在线绘图",
        "AI绘图",
        "UML工具",
        "ER图",
        "架构图",
        "原型设计",
    ],
    authors: [{ name: "IntelliDraw Team" }],
    creator: "IntelliDraw",
    publisher: "IntelliDraw",
    alternates: {
        canonical: "/",
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
    openGraph: {
        type: "website",
        locale: "zh_CN",
        url: appUrl,
        siteName: "IntelliDraw 智能绘图",
        title: "IntelliDraw - AI 驱动的无尽创意绘图平台",
        description:
            "新一代在线绘图工具，支持流程图、思维导图、UML 等多种图形。AI 辅助生成，实时团队协作。",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "IntelliDraw Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "IntelliDraw - AI 驱动的无尽创意绘图平台",
        description:
            "新一代在线绘图工具，支持流程图、思维导图、UML 等多种图形。AI 辅助生成，实时团队协作。",
        images: ["/og-image.png"],
    },
    icons: {
        icon: "/favicon.ico?v=2",
        shortcut: "/favicon.ico?v=2",
    },
    manifest: "/site.webmanifest",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "IntelliDraw",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CNY",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "1250",
        },
    }

    return (
        <html lang="zh">
            <body>
                <Providers>{children}</Providers>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </body>
        </html>
    )
}
