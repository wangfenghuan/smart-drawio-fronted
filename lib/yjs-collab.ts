/**
 * Yjs 协作实现
 *
 * 核心设计:
 * 1. 使用 Y.Text 存储 Draw.io XML 文档
 * 2. 通过 y-websocket 连接到后端 WebSocket 服务器
 * 3. 后端 Spring Boot 作为透明代理，透传 Yjs 二进制协议
 * 4. 支持权限控制（view/edit）
 * 5. 保留加密功能（在 WebSocket 层实现）
 */

import { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"
import type { UserRole } from "./collab-protocol"

export interface YjsCollaborationOptions {
    roomName: string
    serverUrl: string // WebSocket 服务器 URL
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名（可选）
    onRemoteChange?: (xml: string) => void
    onConnectionStatusChange?: (
        status: "connecting" | "connected" | "disconnected",
    ) => void
    onUserCountChange?: (count: number) => void
}

export class YjsCollaboration {
    private ydoc: Y.Doc
    private yXmlText: Y.Text
    private wsProvider: WebsocketProvider | null = null
    private roomName: string
    private serverUrl: string
    private userRole: UserRole
    private userId: string
    private userName: string
    private options: YjsCollaborationOptions
    private isDisposed = false
    private isReady = false // 标记是否已准备好推送

    // 防止循环更新的标志
    private isUpdatingFromRemote = false

    constructor(options: YjsCollaborationOptions) {
        this.roomName = options.roomName
        this.serverUrl = options.serverUrl
        this.userRole = options.userRole
        this.userId = options.userId
        this.userName = options.userName || "Anonymous"
        this.options = options

        console.log("[YjsCollab] Initializing Yjs collaboration...", {
            roomName: this.roomName,
            serverUrl: this.serverUrl,
            userRole: this.userRole,
            userId: this.userId,
        })

        // 创建 Yjs 文档
        this.ydoc = new Y.Doc({
            guid: this.roomName, // 使用房间名作为文档 ID
        })

        // 获取或创建共享的 Y.Text 实例，用于存储 Draw.io XML
        this.yXmlText = this.ydoc.getText("drawio-xml")

        // 监听文档变化
        this.ydoc.on("update", (update: Uint8Array, origin: any) => {
            console.log("[YjsCollab] 📦 Yjs document update received", {
                updateSize: update.length,
                origin,
                isUpdatingFromRemote: this.isUpdatingFromRemote,
            })

            // 如果不是远程更新，则忽略（本地更新已经在 pushUpdate 中处理）
            if (origin === this) {
                console.log("[YjsCollab] ⏭️ Skipping local update")
                return
            }

            // 远程更新：通知外部
            this.handleRemoteUpdate()
        })

        // 监听 Y.Text 变化
        this.yXmlText.observe((event) => {
            console.log("[YjsCollab] 📝 Y.Text changed", {
                changes: event.changes.delta,
                isUpdatingFromRemote: this.isUpdatingFromRemote,
            })

            // 如果不是远程更新，则忽略
            if (this.isUpdatingFromRemote) {
                return
            }

            // 远程更新：通知外部
            this.handleRemoteUpdate()
        })

        // 连接到 WebSocket 服务器
        this.connect()
    }

    /**
     * 连接到 WebSocket 服务器
     */
    private connect() {
        if (this.isDisposed) return

        console.log("[YjsCollab] 🔄 Connecting to WebSocket server...", {
            url: `${this.serverUrl}/${this.roomName}`,
        })

        this.options.onConnectionStatusChange?.("connecting")

        try {
            // 创建 WebSocket Provider
            this.wsProvider = new WebsocketProvider(
                this.serverUrl,
                this.roomName,
                this.ydoc,
                {
                    connect: true,
                    // WebSocket 参数配置
                    params: {
                        userId: this.userId,
                        userName: this.userName,
                        role: this.userRole,
                    },
                },
            )

            // 监听连接状态
            this.wsProvider.on("status", (event: { status: string }) => {
                console.log("[YjsCollab] 📡 WebSocket status:", event.status)

                switch (event.status) {
                    case "connecting":
                        this.options.onConnectionStatusChange?.("connecting")
                        this.isReady = false
                        break
                    case "connected":
                        console.log(
                            "[YjsCollab] ✅ Connected to WebSocket server",
                        )
                        this.options.onConnectionStatusChange?.("connected")
                        this.isReady = true

                        // 连接成功后，检查是否有初始数据
                        this.checkInitialData()
                        break
                    case "disconnected":
                        console.log(
                            "[YjsCollab] ❌ Disconnected from WebSocket server",
                        )
                        this.options.onConnectionStatusChange?.("disconnected")
                        this.isReady = false
                        break
                }
            })

            // 监听同步状态
            this.wsProvider.on("sync", (event: { syncStep: number }) => {
                console.log("[YjsCollab] 🔄 Sync step:", event.syncStep)

                // syncStep 1 表示同步完成
                if (event.syncStep === 1) {
                    console.log("[YjsCollab] ✅ Initial sync completed")

                    // 同步完成后，检查是否有数据
                    this.checkInitialData()
                }
            })

            // 监听连接错误
            this.wsProvider.on("connection-error", (error: any) => {
                console.error("[YjsCollab] ❌ Connection error:", error)
                this.options.onConnectionStatusChange?.("disconnected")
                this.isReady = false
            })

            // 监听用户数量变化（如果后端支持）
            this.wsProvider.on("users", (event: any) => {
                console.log("[YjsCollab] 👥 Users event:", event)
                if (event?.users && Array.isArray(event.users)) {
                    const userCount = event.users.length
                    console.log("[YjsCollab] 👥 User count:", userCount)
                    this.options.onUserCountChange?.(userCount)
                }
            })
        } catch (error) {
            console.error("[YjsCollab] ❌ Failed to connect:", error)
            this.options.onConnectionStatusChange?.("disconnected")
        }
    }

    /**
     * 检查是否有初始数据
     */
    private checkInitialData() {
        const currentXml = this.yXmlText.toString()
        console.log("[YjsCollab] 📄 Current XML length:", currentXml.length)

        if (currentXml.length > 0) {
            console.log("[YjsCollab] 📥 Initial data found, notifying callback")
            this.options.onRemoteChange?.(currentXml)
        } else {
            console.log("[YjsCollab] 📭 No initial data, waiting for updates")
        }
    }

    /**
     * 处理远程更新
     */
    private handleRemoteUpdate() {
        const xml = this.yXmlText.toString()
        console.log(
            "[YjsCollab] 📨 Remote update received, XML length:",
            xml.length,
        )

        if (xml.length > 0) {
            this.options.onRemoteChange?.(xml)
        }
    }

    /**
     * 推送本地更新到 Yjs 文档
     * @param xml 完整的 Draw.io XML 字符串
     */
    async pushUpdate(xml: string) {
        // 权限检查：只读用户不能推送更新
        if (this.userRole !== "edit") {
            console.warn("[YjsCollab] ❌ Read-only user cannot push updates")
            return
        }

        if (!this.isReady) {
            console.warn("[YjsCollab] ⚠️ Not ready to push, skipping")
            return
        }

        console.log(
            "[YjsCollab] 📤 Pushing local update, XML length:",
            xml.length,
        )

        // 设置远程更新标志，防止触发回调
        this.isUpdatingFromRemote = true

        try {
            // 获取当前内容长度
            const currentLength = this.yXmlText.length

            // 替换整个文档（删除旧内容 + 插入新内容）
            this.ydoc.transact(() => {
                // 删除旧内容
                if (currentLength > 0) {
                    this.yXmlText.delete(0, currentLength)
                }
                // 插入新内容
                this.yXmlText.insert(0, xml)
            }, this) // origin 设置为 this，标记为本地更新

            console.log("[YjsCollab] ✅ Update pushed to Yjs document")

            // 延迟重置标志，确保 Yjs 完成同步
            setTimeout(() => {
                this.isUpdatingFromRemote = false
            }, 100)
        } catch (error) {
            console.error("[YjsCollab] ❌ Failed to push update:", error)
            this.isUpdatingFromRemote = false
        }
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.wsProvider?.wsconnected ?? false
    }

    /**
     * 检查是否准备好推送
     */
    isReadyToPush(): boolean {
        return this.isConnected() && this.isReady
    }

    /**
     * 获取当前文档内容
     */
    getDocument(): string {
        return this.yXmlText.toString()
    }

    /**
     * 获取在线用户数
     */
    getUserCount(): number {
        // 从 WebSocket Provider 获取当前连接的用户数
        if (this.wsProvider?.awareness) {
            return this.wsProvider.awareness.getStates().size
        }
        return 0
    }

    /**
     * 发送光标位置（使用 Yjs Awareness）
     * @param x X坐标
     * @param y Y坐标
     */
    sendPointer(x: number, y: number) {
        if (!this.wsProvider?.awareness) {
            return
        }

        // 更新当前用户的 awareness 状态
        this.wsProvider.awareness.setLocalStateField("cursor", {
            x,
            y,
            userId: this.userId,
            userName: this.userName,
            timestamp: Date.now(),
        })
    }

    /**
     * 监听其他用户的光标位置
     */
    onPointerMove(callback: (pointer: any) => void) {
        if (!this.wsProvider?.awareness) {
            return
        }

        // 监听 awareness 变化
        this.wsProvider.awareness.on("change", () => {
            const states = this.wsProvider?.awareness?.getStates()

            states.forEach((state: any, clientID: number) => {
                // 跳过本地用户
                if (clientID === this.wsProvider?.awareness?.clientID) {
                    return
                }

                // 检查是否有光标信息
                if (state?.cursor) {
                    callback({
                        ...state.cursor,
                        clientID,
                    })
                }
            })
        })
    }

    /**
     * 销毁协作实例
     */
    dispose() {
        console.log("[YjsCollab] 🧹 Disposing Yjs collaboration...")
        this.isDisposed = true

        if (this.wsProvider) {
            this.wsProvider.destroy()
            this.wsProvider = null
        }

        this.ydoc.destroy()
    }
}

/**
 * 创建 Yjs 协作实例的工厂函数
 */
export function createYjsCollaboration(
    options: YjsCollaborationOptions,
): YjsCollaboration {
    return new YjsCollaboration(options)
}
