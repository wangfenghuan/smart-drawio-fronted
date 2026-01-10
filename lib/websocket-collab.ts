/**
 * WebSocket 协作实现（带协议头版本）
 *
 * 核心设计:
 * 1. 发送带协议头的加密二进制数据
 *    byte[0] = OpCode (0x00/0x01/0x02)
 *    byte[1...] = 加密的 Payload
 * 2. 接收并解析协议头，根据 OpCode 分发到不同的处理器
 * 3. 支持权限控制（view/edit）
 */

import {
    UserRole,
    PointerData,
    canSend,
    getOpCodeName,
} from "./collab-protocol"
import {
    packPointerMessage,
    packElementsMessage,
    packSyncMessage,
    unpackMessage,
    unpackPointerMessage,
    unpackElementsMessage,
    unpackSyncMessage,
} from "./collab-packet"

export interface WebSocketCollaborationOptions {
    roomName: string
    secretKey: string // 密钥,用于加密/解密
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名（可选）
    onRemoteChange?: (xml: string) => void
    onPointerMove?: (pointer: PointerData) => void
    onConnectionStatusChange?: (
        status: "connecting" | "connected" | "disconnected",
    ) => void
    onUserCountChange?: (count: number) => void
}

export class WebSocketCollaboration {
    private ws: WebSocket | null = null
    private roomName: string
    private secretKey: string
    private userRole: UserRole
    private userId: string
    private userName: string
    private options: WebSocketCollaborationOptions
    private isDisposed = false
    private reconnectTimeout: NodeJS.Timeout | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 10
    private reconnectInterval = 2000

    // 从环境变量获取 WebSocket URL
    private static getWSUrl(): string {
        const wsUrl =
            process.env.NEXT_PUBLIC_WS_URL ||
            "ws://localhost:8081/api/excalidraw"
        // 移除可能的 /yjs 后缀，直接使用基础 URL
        return wsUrl.replace(/\/yjs$/, "").replace(/\/$/, "")
    }

    constructor(options: WebSocketCollaborationOptions) {
        this.roomName = options.roomName
        this.secretKey = options.secretKey
        this.userRole = options.userRole
        this.userId = options.userId
        this.userName = options.userName || "Anonymous"
        this.options = options
        this.connect()
    }

    private async connect() {
        if (this.isDisposed) return

        // 拼接完整 URL: baseUrl/roomName
        // 例如: ws://localhost:8081/api/excalidraw/2007350794714034178
        const wsUrl = `${WebSocketCollaboration.getWSUrl()}/${this.roomName}`
        console.log("[WebSocketCollab] Connecting to:", wsUrl)

        this.options.onConnectionStatusChange?.("connecting")

        try {
            this.ws = new WebSocket(wsUrl)
            this.ws.binaryType = "arraybuffer" // 接收二进制数据

            this.ws.onopen = () => {
                console.log("[WebSocketCollab] ✅ Connected")
                this.options.onConnectionStatusChange?.("connected")
                this.reconnectAttempts = 0
            }

            this.ws.onmessage = async (event) => {
                await this.handleMessage(event.data)
            }

            this.ws.onclose = () => {
                console.log("[WebSocketCollab] Connection closed")
                this.options.onConnectionStatusChange?.("disconnected")
                this.scheduleReconnect()
            }

            this.ws.onerror = (error) => {
                console.error("[WebSocketCollab] Error:", error)
            }
        } catch (error) {
            console.error("[WebSocketCollab] Connection error:", error)
            this.scheduleReconnect()
        }
    }

    /**
     * 处理接收到的消息
     * 支持两种格式:
     * 1. 二进制数据 (ArrayBuffer) - 带协议头的加密消息
     * 2. JSON 文本 - 元数据(如用户数)
     */
    private async handleMessage(data: any) {
        if (this.isDisposed) return

        try {
            // 如果是二进制数据,解析协议头
            if (data instanceof ArrayBuffer) {
                console.log(
                    "[WebSocketCollab] 📨 Received binary data, size:",
                    data.byteLength,
                )

                // 解包消息（解析协议头）
                const { opcode, payload } = unpackMessage(data)

                // 根据 OpCode 分发到不同的处理器
                await this.handleProtocolMessage(opcode, payload)
            }
            // 如果是 JSON 文本,处理元数据
            else if (typeof data === "string") {
                const message = JSON.parse(data)
                console.log(
                    "[WebSocketCollab] 📨 Received JSON message:",
                    message.type,
                )

                if (message.type === "user_count") {
                    console.log(
                        "[WebSocketCollab] 👥 User count:",
                        message.count,
                    )
                    this.options.onUserCountChange?.(message.count)
                }
            }
        } catch (error) {
            console.error("[WebSocketCollab] Failed to handle message:", error)
        }
    }

    /**
     * 根据 OpCode 处理不同类型的协议消息
     */
    private async handleProtocolMessage(opcode: number, payload: Uint8Array) {
        const opcodeName = getOpCodeName(opcode)
        console.log(`[WebSocketCollab] Processing ${opcodeName}`)

        switch (opcode) {
            case 0x00: // FULL_SYNC
                {
                    const syncData = await unpackSyncMessage(payload, this.secretKey)
                    console.log("[WebSocketCollab] 📥 Full sync request received")
                    // 全量同步通常由服务器处理，客户端可能不需要处理
                    // 或者这里可以触发回调，让应用层决定如何响应
                }
                break

            case 0x01: // POINTER
                {
                    const pointer = await unpackPointerMessage(payload, this.secretKey)
                    console.log(
                        `[WebSocketCollab] 👆 Pointer: ${pointer.userName} (${pointer.x}, ${pointer.y})`,
                    )
                    this.options.onPointerMove?.(pointer)
                }
                break

            case 0x02: // ELEMENTS_UPDATE
                {
                    const xml = await unpackElementsMessage(payload, this.secretKey)
                    console.log(
                        "[WebSocketCollab] 📥 Elements update, XML length:",
                        xml.length,
                    )
                    this.options.onRemoteChange?.(xml)
                }
                break

            default:
                console.warn(`[WebSocketCollab] Unknown OpCode: 0x${opcode.toString(16)}`)
        }
    }

    private scheduleReconnect() {
        if (
            this.isDisposed ||
            this.reconnectAttempts >= this.maxReconnectAttempts
        ) {
            console.log("[WebSocketCollab] ❌ Max reconnect attempts reached")
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectInterval * this.reconnectAttempts

        console.log(
            `[WebSocketCollab] 🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
        )

        this.reconnectTimeout = setTimeout(() => {
            this.connect()
        }, delay)
    }

    /**
     * 推送绘图更新到服务器（OpCode: 0x02）
     * @param xml XML 字符串,会被加密后发送
     */
    async pushUpdate(xml: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn(
                "[WebSocketCollab] ⚠️ WebSocket not connected, skipping push",
            )
            return
        }

        // 权限检查
        const permission = canSend(0x02, this.userRole)
        if (!permission.allowed) {
            console.warn(
                `[WebSocketCollab] ❌ ${permission.reason}`,
            )
            return
        }

        try {
            // 打包消息（添加协议头）
            const packet = await packElementsMessage(xml, this.secretKey)

            console.log(
                `[WebSocketCollab] 📤 Sending ELEMENTS_UPDATE, original size: ${xml.length}, total: ${packet.length} bytes`,
            )

            // 发送二进制数据
            this.ws.send(packet)
        } catch (error) {
            console.error(
                "[WebSocketCollab] Failed to encrypt and send:",
                error,
            )
        }
    }

    /**
     * 发送光标位置（OpCode: 0x01）
     * @param x X坐标
     * @param y Y坐标
     */
    async sendPointer(x: number, y: number) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return // 静默失败，光标移动太频繁不需要警告
        }

        // 权限检查
        const permission = canSend(0x01, this.userRole)
        if (!permission.allowed) {
            console.warn(
                `[WebSocketCollab] ❌ ${permission.reason}`,
            )
            return
        }

        try {
            const pointer: PointerData = {
                type: "pointer",
                x,
                y,
                userId: this.userId,
                userName: this.userName,
                timestamp: Date.now(),
            }

            // 打包消息
            const packet = await packPointerMessage(pointer, this.secretKey)

            // 发送（不打印日志，避免刷屏）
            this.ws.send(packet)
        } catch (error) {
            console.error("[WebSocketCollab] Failed to send pointer:", error)
        }
    }

    /**
     * 请求全量同步（OpCode: 0x00）
     */
    async requestFullSync() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn(
                "[WebSocketCollab] ⚠️ WebSocket not connected, cannot request sync",
            )
            return
        }

        // 权限检查
        const permission = canSend(0x00, this.userRole)
        if (!permission.allowed) {
            console.warn(
                `[WebSocketCollab] ❌ ${permission.reason}`,
            )
            return
        }

        try {
            const syncRequest = {
                type: "sync_request" as const,
                userId: this.userId,
                timestamp: Date.now(),
            }

            // 打包消息
            const packet = await packSyncMessage(syncRequest, this.secretKey)

            console.log(
                `[WebSocketCollab] 📤 Requesting full sync, total: ${packet.length} bytes`,
            )

            // 发送
            this.ws.send(packet)
        } catch (error) {
            console.error("[WebSocketCollab] Failed to request sync:", error)
        }
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN
    }

    /**
     * 检查是否准备好推送
     */
    isReadyToPush(): boolean {
        return this.isConnected()
    }

    /**
     * 获取当前文档内容（从本地状态）
     */
    getDocument(): string {
        // WebSocket 方式不维护文档状态，返回空字符串
        return ""
    }

    /**
     * 获取在线用户数
     */
    getUserCount(): number {
        // 由服务器推送，这里返回 0
        return 0
    }

    /**
     * 销毁协作实例
     */
    dispose() {
        this.isDisposed = true
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
        }
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }
}

/**
 * 创建 WebSocket 协作实例的工厂函数
 */
export function createWebSocketCollaboration(
    options: WebSocketCollaborationOptions,
): WebSocketCollaboration {
    return new WebSocketCollaboration(options)
}
