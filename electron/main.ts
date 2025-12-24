import { spawn } from "child_process"
import { app, BrowserWindow } from "electron"
import { createRequire } from "module"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

let mainWindow: BrowserWindow | null = null
let nextjsProcess: any = null

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: join(__dirname, "preload.mjs"),
        },
        icon: join(__dirname, "../public/favicon.ico"),
    })

    const isDev = process.env.NODE_ENV === "development"
    if (isDev) {
        mainWindow.loadURL("http://localhost:6002")
        mainWindow.webContents.openDevTools()
    } else {
        // Start Next.js server in production
        const nextjsPort = 6001
        const appRoot = join(__dirname, "..")
        const standalonePath = join(appRoot, ".next", "standalone")

        console.log("Starting Next.js server from standalone build...")
        console.log(`App root: ${appRoot}`)

        nextjsProcess = spawn(process.execPath, ["server.js"], {
            cwd: standalonePath,
            stdio: "inherit",
            env: {
                ...process.env,
                NODE_ENV: "production",
                PORT: String(nextjsPort),
                HOSTNAME: "127.0.0.1",
            },
        })

        // Wait for server to start, then load
        setTimeout(() => {
            mainWindow?.loadURL(`http://localhost:${nextjsPort}`)
        }, 3000)

        // Show dev tools if there's an error
        nextjsProcess.on("error", (err: Error) => {
            console.error("Failed to start Next.js server:", err)
            mainWindow?.webContents.openDevTools()
        })
    }

    mainWindow.on("closed", () => {
        mainWindow = null
    })
}

app.whenReady().then(() => {
    createWindow()
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on("window-all-closed", () => {
    // Kill Next.js process when app closes
    if (nextjsProcess) {
        nextjsProcess.kill()
    }
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("before-quit", () => {
    // Clean up Next.js process on macOS
    if (nextjsProcess) {
        nextjsProcess.kill()
    }
})
