#!/usr/bin/env node

/**
 * Convert Next AI Drawio to Electron Desktop App
 *
 * This script:
 * 1. Checks for required icons
 * 2. Provides step-by-step instructions
 * 3. Installs dependencies
 * 4. Builds the desktop app
 */

import { execSync } from "child_process"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, "..")

console.log("🔧 W-Next AI Drawio Electron Converter")
console.log("========================================\n")

console.log("📋 Pre-flight checks...\n")

const checks = [
    {
        name: "Electron config files",
        test: () =>
            existsSync(join(projectRoot, "electron/main.ts")) &&
            existsSync(join(projectRoot, "electron/preload.ts")),
        message: "✅ Electron config files found",
    },
    {
        name: "Build resources directory",
        test: () => existsSync(join(projectRoot, "build")),
        message: "✅ Build directory found (or will be created)",
    },
    {
        name: "Application icons",
        test: () =>
            existsSync(join(projectRoot, "build/icon.icns")) ||
            existsSync(join(projectRoot, "build/icon.png")),
        message: "⚠️  App icons not found (will use placeholder)",
    },
    {
        name: "Next.js build output",
        test: () => existsSync(join(projectRoot, "out/index.html")),
        message: "❌ Next.js build not found. Run 'npm run build' first.",
    },
]

let hasErrors = false
for (const check of checks) {
    const pass = check.test()
    console.log(pass ? `✅ ${check.name}` : check.message)
    if (!pass && check.name === "Next.js build output") {
        hasErrors = true
    }
}

if (hasErrors) {
    console.log("\n❌ Fix the errors above and run this script again.")
    console.log("\n💡 Quick fix:")
    console.log("   npm run build")
    process.exit(1)
}

console.log("\n🎨 Creating placeholder icons (if needed)...")

const buildDir = join(projectRoot, "build")
if (!existsSync(buildDir)) {
    mkdirSync(buildDir, { recursive: true })
}

const iconPath = join(buildDir, "icon.png")
if (!existsSync(iconPath)) {
    console.log("   Creating 1024x1024 placeholder icon...")

    // Simple SVG-based icon generation using data URL
    // In production, replace with your actual icon
    const placeholderIcon =
        '<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="1024" height="1024" fill="#3b82f6"/>' +
        '<text x="512" y="550" font-family="Arial" font-size="200" fill="white" text-anchor="middle">AI</text>' +
        "</svg>"

    writeFileSync(iconPath, placeholderIcon)
    console.log("   ✅ Created build/icon.png (replace with your logo!)")
}

console.log("\n📦 Installing additional dependencies...")

try {
    execSync("npm install", { stdio: "inherit", cwd: projectRoot })
} catch (error) {
    console.error("❌ Failed to install dependencies:", error)
    process.exit(1)
}

console.log("\n✅ Setup complete!")
console.log("\n🚀 Next steps:")
console.log("\n1. For development (hot reload):")
console.log("   $ npm run electron:dev")
console.log("\n2. For production build:")
console.log("   $ npm run electron:build:mac:universal")
console.log("\n3. Your app will be in: dist/W-Next AI Drawio-*.dmg")
console.log("\n📚 Read full instructions: ELECTRON_BUILD.md")
console.log("\n💡 Pro tips:")
console.log("   - Replace build/icon.png with your logo (1024x1024)")
console.log("   - For code signing, see ELECTRON_BUILD.md")
console.log("   - Use 'npm run electron:build:dir' for quick test build")
console.log("")

console.log("❓ Need help? Open an issue at:")
console.log("   https://github.com/wangfenghuan/w-next-ai-drawio/issues\n")
