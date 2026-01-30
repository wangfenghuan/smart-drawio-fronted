import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "素材广场",
    description:
        "探索高质量的图表素材，激发您的创作灵感。提供流程图、思维导图、UML等多种模板。",
    openGraph: {
        title: "素材广场 | IntelliDraw 智能绘图",
        description: "探索高质量的图表素材，激发您的创作灵感。",
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
