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

import { unpackMessage } from "./collab-packet"
import {
    canSend,
    getOpCodeName,
    type PointerData,
    type UserRole,
} from "./collab-protocol"

export interface WebSocketCollaborationOptions {
    roomName: string
    secretKey: string // 密钥,用于加密/解密
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名（可选）
    onRemoteChange?: (xml: string | Uint8Array) => void // 支持 XML 字符串或二进制数据
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

            this.ws.onclose = (event) => {
                console.log("[WebSocketCollab] Connection closed", {
                    wasClean: event.wasClean,
                    code: event.code,
                    reason: event.reason,
                    isDisposed: this.isDisposed,
                })
                this.options.onConnectionStatusChange?.("disconnected")

                // 只有在非主动关闭时才重连
                if (!this.isDisposed) {
                    this.scheduleReconnect()
                } else {
                    console.log(
                        "[WebSocketCollab] Instance disposed, not reconnecting",
                    )
                }
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
     * 支持三种格式:
     * 1. 二进制数据 (ArrayBuffer) - 带协议头的加密消息
     * 2. Uint8Array - 后端直接发送的二进制数据
     * 3. JSON 文本 - 元数据(如用户数)
     */
    private async handleMessage(data: any) {
        if (this.isDisposed) return

        try {
            let buffer: ArrayBuffer

            // 处理不同的数据类型
            if (data instanceof ArrayBuffer) {
                buffer = data
                console.log(
                    "[WebSocketCollab] 📨 Received ArrayBuffer, size:",
                    data.byteLength,
                )
            } else if (data instanceof Uint8Array) {
                // 创建一个新的 ArrayBuffer 来避免 SharedArrayBuffer 问题
                buffer = new ArrayBuffer(data.byteLength)
                new Uint8Array(buffer).set(data)
                console.log(
                    "[WebSocketCollab] 📨 Received Uint8Array, size:",
                    data.byteLength,
                )
            } else if (typeof data === "string") {
                // JSON 文本,处理元数据
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
                return
            } else {
                console.warn(
                    "[WebSocketCollab] ⚠️ Unknown data type:",
                    typeof data,
                )
                return
            }

            // 检查数据长度是否合法（至少需要 1 字节 OpCode）
            if (buffer.byteLength < 1) {
                console.warn("[WebSocketCollab] ⚠️ Received empty binary data")
                return
            }

            // 解包消息（解析协议头）
            const { opcode, payload } = unpackMessage(buffer)

            console.log(
                "[WebSocketCollab] 📦 Unpacked message: OpCode=",
                opcode.toString(16),
                "Payload size:",
                payload.length,
            )

            // 根据 OpCode 分发到不同的处理器
            await this.handleProtocolMessage(opcode, payload)
        } catch (error) {
            console.error(
                "[WebSocketCollab] ❌ Failed to handle message:",
                error,
            )

            // 打印更详细的错误信息
            if (error instanceof Error) {
                console.error("[WebSocketCollab] Error name:", error.name)
                console.error("[WebSocketCollab] Error message:", error.message)
                console.error("[WebSocketCollab] Error stack:", error.stack)
            }
        }
    }

    /**
     * 根据 OpCode 处理不同类型的协议消息
     */
    private async handleProtocolMessage(opcode: number, payload: Uint8Array) {
        const opcodeName = getOpCodeName(opcode)
        console.log(
            `[WebSocketCollab] 🔍 Processing ${opcodeName}, payload size:`,
            payload.length,
        )

        try {
            switch (opcode) {
                case 0x00: // FULL_SYNC
                    {
                        console.log("[WebSocketCollab] 📥 Processing FULL_SYNC")

                        // 检查 payload 是否为空
                        if (payload.length === 0) {
                            console.log(
                                "[WebSocketCollab] ⚠️ Full sync payload is empty",
                            )
                            return
                        }

                        console.log(
                            "[WebSocketCollab] 📦 Full sync payload size:",
                            payload.length,
                        )

                        // FULL_SYNC 数据是 Yjs 二进制更新
                        // 传递 Uint8Array 给上层处理
                        this.options.onRemoteChange?.(payload)
                    }
                    break

                case 0x01: // POINTER
                    {
                        // POINTER 数据是明文 JSON 字符串（UTF-8 编码）
                        const jsonStr = new TextDecoder().decode(payload)
                        const pointer = JSON.parse(jsonStr) as PointerData
                        // console.log(
                        //     `[WebSocketCollab] ✅ Pointer: ${pointer.userName} (${pointer.x}, ${pointer.y})`,
                        // )
                        this.options.onPointerMove?.(pointer)
                    }
                    break

                case 0x02: // ELEMENTS_UPDATE
                    {
                        console.log(
                            "[WebSocketCollab] 🎨 Processing ELEMENTS_UPDATE",
                        )
                        // ELEMENTS_UPDATE 数据是 Yjs 二进制更新
                        // 传递 Uint8Array 给上层处理
                        this.options.onRemoteChange?.(payload)
                    }
                    break

                default:
                    console.warn(
                        `[WebSocketCollab] ⚠️ Unknown OpCode: 0x${opcode.toString(16)}`,
                    )
            }
        } catch (error) {
            console.error(
                `[WebSocketCollab] ❌ Failed to process ${opcodeName}:`,
                error,
            )

            if (error instanceof Error) {
                console.error("[WebSocketCollab] Error details:", {
                    name: error.name,
                    message: error.message,
                })

                // 如果是 OperationError，通常是解密失败
                if (error.name === "OperationError") {
                    console.error(
                        "[WebSocketCollab] 🔐 Decryption failed! Possible causes:",
                    )
                    console.error("  1. Secret key mismatch")
                    console.error("  2. Data corruption during transmission")
                    console.error("  3. Payload size:", payload.length)
                    console.error(
                        "  4. Secret key length:",
                        this.secretKey.length,
                    )
                }
            }
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
     * 推送二进制数据到服务器（OpCode: 0x02）
     * @param data Uint8Array Yjs 二进制更新
     */
    async pushBinaryUpdate(data: Uint8Array) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn(
                "[WebSocketCollab] ⚠️ WebSocket not connected, skipping push",
            )
            return
        }

        // 权限检查
        const permission = canSend(0x02, this.userRole)
        if (!permission.allowed) {
            console.warn(`[WebSocketCollab] ❌ ${permission.reason}`)
            return
        }

        try {
            // 构造协议包: opcode(1 byte) + payload
            const packet = new Uint8Array(1 + data.length)
            packet[0] = 0x02 // ELEMENTS_UPDATE
            packet.set(data, 1)

            console.log(
                `[WebSocketCollab] 📤 Sending binary ELEMENTS_UPDATE, data size: ${data.length}, total: ${packet.length} bytes`,
            )

            // 发送二进制数据
            this.ws.send(packet)
        } catch (error) {
            console.error(
                "[WebSocketCollab] Failed to send binary data:",
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
            console.warn(`[WebSocketCollab] ❌ ${permission.reason}`)
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

            // 将指针数据序列化为 JSON 字符串
            const jsonStr = JSON.stringify(pointer)
            const jsonBytes = new TextEncoder().encode(jsonStr)

            // 构造协议包: opcode(1 byte) + payload
            const packet = new Uint8Array(1 + jsonBytes.length)
            packet[0] = 0x01 // POINTER
            packet.set(jsonBytes, 1)

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
            console.warn(`[WebSocketCollab] ❌ ${permission.reason}`)
            return
        }

        try {
            const syncRequest = {
                type: "sync_request" as const,
                userId: this.userId,
                timestamp: Date.now(),
            }

            // 将同步请求序列化为 JSON 字符串
            const jsonStr = JSON.stringify(syncRequest)
            const jsonBytes = new TextEncoder().encode(jsonStr)

            // 构造协议包: opcode(1 byte) + payload
            const packet = new Uint8Array(1 + jsonBytes.length)
            packet[0] = 0x00 // FULL_SYNC
            packet.set(jsonBytes, 1)

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
        console.log("[WebSocketCollab] Disposing instance...")
        this.isDisposed = true

        // 清除重连定时器
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = null
        }

        // 关闭 WebSocket 连接
        if (this.ws) {
            // 移除事件监听器，防止触发重连
            this.ws.onclose = null
            this.ws.onerror = null
            this.ws.onopen = null
            this.ws.onmessage = null

            if (
                this.ws.readyState === WebSocket.OPEN ||
                this.ws.readyState === WebSocket.CONNECTING
            ) {
                this.ws.close(1000, "Client closing") // 使用正常关闭码
            }
            this.ws = null
        }

        console.log("[WebSocketCollab] Instance disposed")
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
