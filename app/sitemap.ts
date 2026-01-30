import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://47.95.35.178"

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
        "/templates/1",
        "/templates/2",
    ].map((route) => ({
        url: `${appUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }))

    return routes
}
