import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    // eslint: {
    //     ignoreDuringBuilds: true,
    // },
    // typescript: {
    //     ignoreBuildErrors: true,
    // },
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
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                "fs/promises": false,
                module: false,
            }
        }
        
        // Enable async WebAssembly
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
        }

        // Force ignore these modules to prevent dynamic import errors in web-tree-sitter
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^fs\/promises$/,
            }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^module$/,
            })
        )

        return config
    },
}

export default nextConfig
