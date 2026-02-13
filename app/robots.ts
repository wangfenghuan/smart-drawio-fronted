import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/admin/",
                "/my-diagrams/",
                "/my-spaces/",
                "/my-rooms/",
                "/team-spaces/",
                "/user/",
                "/diagram/edit/", // Prevent editor indexing
            ],
        },
        sitemap: `${appUrl}/sitemap.xml`,
    }
}
