#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, "..")

console.log("🚀 Building W-Next AI Drawio for Desktop...")

console.log("📦 Step 1: Building Next.js application...")
try {
    execSync("npm run build", { stdio: "inherit", cwd: projectRoot })
} catch (error) {
    console.error("❌ Next.js build failed:", error)
    process.exit(1)
}

console.log("\n🔧 Step 2: Preparing Electron build...")
const outDir = join(projectRoot, "out")
const _electronDir = join(projectRoot, "electron")

if (!existsSync(outDir)) {
    console.error(
        "❌ Next.js output directory not found! Run 'npm run build' first.",
    )
    process.exit(1)
}

if (!existsSync(join(projectRoot, "build"))) {
    mkdirSync(join(projectRoot, "build"))
}

console.log("✅ Build preparation complete!")

console.log("\n📋 Step 3: Packaging Electron application...")
console.log("   For macOS (Apple Silicon + Intel):")
console.log("   $ npm run electron:build:mac")
console.log("")
console.log("   For macOS Universal binary:")
console.log("   $ npm run electron:build:mac:universal")
console.log("")
console.log("   For all platforms:")
console.log("   $ npm run electron:build")
console.log("\n🎯 Ready to build!")
