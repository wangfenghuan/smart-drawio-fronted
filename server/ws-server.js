/**
 * 简单的 WebSocket 协作服务器
 * 直接广播 XML 数据，不使用 Yjs
 */

const WebSocket = require("ws")
const http = require("http")

// 创建 HTTP 服务器（用于健康检查）
const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" })
        res.end("OK")
    } else {
        res.writeHead(404)
        res.end("Not Found")
    }
})

const PORT = process.env.PORT || 1234

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ noServer: true })

// 存储房间和用户的映射
const rooms = new Map() // roomName -> Set<WebSocket>

// 处理 WebSocket 升级
server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`)
        .pathname

    // 路径格式: /roomName
    const roomName = pathname.slice(1) // 移除开头的 /

    if (!roomName) {
        socket.destroy()
        return
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        // 将房间信息附加到 ws 实例
        ws.roomName = roomName
        wss.emit("connection", ws)
    })
})

wss.on("connection", (ws) => {
    const roomName = ws.roomName
    console.log(`🔌 用户连接: ${roomName}`)

    // 创建房间（如果不存在）
    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set())
        console.log(`📁 创建新房间: ${roomName}`)
    }

    const room = rooms.get(roomName)
    room.add(ws)

    // 广播用户数
    broadcastUserCount(roomName)

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message)
            console.log(`📨 收到消息 from ${roomName}:`, data.type)

            if (data.type === "update") {
                // 广播给房间内的其他用户
                broadcastToRoom(roomName, data, ws)
            }
        } catch (error) {
            console.error("❌ 解析消息失败:", error)
        }
    })

    ws.on("close", () => {
        console.log(`🔌 用户断开: ${roomName}`)

        // 从房间中移除用户
        if (rooms.has(roomName)) {
            const room = rooms.get(roomName)
            room.delete(ws)

            // 如果房间为空，删除房间
            if (room.size === 0) {
                rooms.delete(roomName)
                console.log(`🗑️ 删除空房间: ${roomName}`)
            }
        }

        // 广播用户数
        broadcastUserCount(roomName)
    })

    ws.on("error", (error) => {
        console.error("❌ WebSocket 错误:", error)
    })
})

/**
 * 广播消息给房间内的所有用户（除了发送者）
 */
function broadcastToRoom(roomName, data, excludeWs) {
    const room = rooms.get(roomName)

    if (!room) {
        console.warn(`⚠️ 房间不存在: ${roomName}`)
        return
    }

    const message = JSON.stringify(data)
    let recipientCount = 0

    room.forEach((ws) => {
        // 不发送给发送者
        if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
            ws.send(message)
            recipientCount++
        }
    })

    if (recipientCount > 0) {
        console.log(`📢 广播给 ${recipientCount} 个用户 in ${roomName}`)
    }
}

/**
 * 广播用户数给房间内的所有用户
 */
function broadcastUserCount(roomName) {
    const room = rooms.get(roomName)

    if (!room) return

    const userCount = room.size
    const message = JSON.stringify({
        type: "user_count",
        count: userCount,
    })

    room.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message)
        }
    })
}

// 启动服务器
server.listen(PORT, () => {
    console.log("╔════════════════════════════════════════════════╗")
    console.log("║  🚀 WebSocket 协作服务已启动                    ║")
    console.log("╚════════════════════════════════════════════════╝")
    console.log(`📡 WebSocket 端口: ${PORT}`)
    console.log(`🏥 健康检查: http://localhost:${PORT}/health`)
    console.log("\n等待连接...\n")
})

// 优雅关闭
process.on("SIGINT", () => {
    console.log("\n\n正在关闭服务器...")
    wss.clients.forEach((ws) => ws.close())
    server.close(() => {
        console.log("服务器已关闭")
        process.exit(0)
    })
})

process.on("SIGTERM", () => {
    console.log("\n\n正在关闭服务器...")
    wss.clients.forEach((ws) => ws.close())
    server.close(() => {
        console.log("服务器已关闭")
        process.exit(0)
    })
})
