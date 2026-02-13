import type { MetadataRoute } from "next"

// Simple interface for the API response
interface MaterialVO {
    id: string
    updateTime?: string
    createTime?: string
}

interface BaseResponsePageMaterialVO {
    code: number
    data?: {
        records: MaterialVO[]
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://47.95.35.178"

    // 1. Static Routes
    const routes = [
        "",
        "/about",
        "/templates",
        "/solutions/uml-diagram",
        "/solutions/flowchart",
        "/solutions/db-diagram",
        "/solutions/topology",
        "/solutions/mind-map",
        "/wiki/what-is-uml-diagram",
        "/wiki/how-to-draw-flowchart",
    ].map((route) => ({
        url: `${appUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }))

    // 2. Dynamic Template Routes
    let templateRoutes: MetadataRoute.Sitemap = []
    try {
        // Fetch latest templates (adjust pageSize as needed, e.g. 100 or 1000)
        // Using the same endpoint as the frontend
        const apiUrl =
            process.env.NODE_ENV === "development"
                ? "http://localhost:8081/api"
                : "http://47.95.35.178:8081/api"
        const response = await fetch(`${apiUrl}/material/list/page/vo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                current: 1,
                pageSize: 100, // Fetch top 100 for sitemap
                sortField: "createTime",
                sortOrder: "desc",
            }),
            next: { revalidate: 3600 }, // Revalidate every hour
        })

        if (response.ok) {
            const json: BaseResponsePageMaterialVO = await response.json()
            if (json.code === 0 && json.data?.records) {
                templateRoutes = json.data.records.map((item) => ({
                    url: `${appUrl}/templates/${item.id}`,
                    lastModified: item.updateTime ? new Date(item.updateTime) : new Date(),
                    changeFrequency: "weekly" as const,
                    priority: 0.7,
                }))
            }
        }
    } catch (error) {
        console.error("Sitemap generation failed to fetch templates:", error)
    }

    return [...routes, ...templateRoutes]
}
