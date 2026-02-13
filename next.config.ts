import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        const isDev = process.env.NODE_ENV === "development"
        return [
            {
                source: "/api/:path*",
                destination: isDev
                    ? "http://localhost:8081/api/:path*"
                    : "http://47.95.35.178:8081/api/:path*",
            },
        ]
    },
}

export default nextConfig
