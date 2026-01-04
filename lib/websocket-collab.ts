/**
 * Excalidraw 风格的 WebSocket 协作实现
 *
 * 核心设计:
 * 1. 发送加密的二进制数据 (Uint8Array)
 * 2. 接收加密的二进制数据
 * 3. 只用于广播,不负责持久化
 */

export interface WebSocketCollaborationOptions {
    roomName: string
    secretKey: string // 密钥,用于加密/解密
    onRemoteChange?: (xml: string) => void
    onConnectionStatusChange?: (
        status: "connecting" | "connected" | "disconnected",
    ) => void
    onUserCountChange?: (count: number) => void
}

export class WebSocketCollaboration {
    private ws: WebSocket | null = null
    private roomName: string
    private secretKey: string
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
     * 1. 二进制数据 (ArrayBuffer) - 加密的 XML
     * 2. JSON 文本 - 元数据(如用户数)
     */
    private async handleMessage(data: any) {
        if (this.isDisposed) return

        try {
            // 如果是二进制数据,解密后回调
            if (data instanceof ArrayBuffer) {
                console.log(
                    "[WebSocketCollab] 📨 Received binary data, size:",
                    data.byteLength,
                )

                // 解密数据
                const { decryptData } = await import("./cryptoUtils")
                const encryptedData = new Uint8Array(data)
                const xml = await decryptData(encryptedData, this.secretKey)

                console.log(
                    "[WebSocketCollab] 📥 Decrypted XML, length:",
                    xml.length,
                )
                this.options.onRemoteChange?.(xml)
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
     * 推送本地更新到服务器
     * @param xml XML 字符串,会被加密后发送
     */
    async pushUpdate(xml: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn(
                "[WebSocketCollab] ⚠️ WebSocket not connected, skipping push",
            )
            return
        }

        try {
            // 加密数据
            const { encryptData } = await import("./cryptoUtils")
            const encryptedData = await encryptData(xml, this.secretKey)

            console.log(
                "[WebSocketCollab] 📤 Sending encrypted update, original size:",
                xml.length,
                "encrypted size:",
                encryptedData.length,
            )

            // 发送二进制数据
            this.ws.send(encryptedData)
        } catch (error) {
            console.error(
                "[WebSocketCollab] Failed to encrypt and send:",
                error,
            )
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
