/**
 * Yjs 实时协作模块
 *
 * 核心功能：
 * 1. WebSocket 连接管理
 * 2. Draw.io XML 与 Yjs 文本类型的双向同步
 * 3. 感知其他用户光标位置（可选）
 * 4. 快照检测与上传
 */

import { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"
import { checkLock, uploadSnapshot } from "@/api/diagramController"

// 配置常量
export const YJS_CONFIG = {
    // WebSocket 服务器地址（从环境变量获取，默认使用本地后端）
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/api",

    // 快照上传阈值：当 update 计数超过此值时触发快照
    SNAPSHOT_THRESHOLD: 500,

    // 快照上传分布式锁超时时间（毫秒）
    LOCK_TIMEOUT: 5 * 60 * 1000, // 5 分钟

    // WebSocket 重连配置
    RECONNECT: true,
    RECONNECT_INTERVAL: 1000, // 1 秒
    RECONNECT_MAX_ATTEMPTS: 10,
}

export interface YjsCollaborationOptions {
    roomName: string
    diagramId: string
    onRemoteChange?: (xml: string) => void
    onConnectionStatusChange?: (
        status: "connecting" | "connected" | "disconnected",
    ) => void
    onUserCountChange?: (count: number) => void
    isReadOnly?: boolean
}

export class YjsCollaboration {
    private ydoc: Y.Doc
    private provider: WebsocketProvider | null = null
    private ytext: Y.Text
    private roomName: string
    private options: YjsCollaborationOptions
    private updateCount = 0
    private isDisposed = false
    private lastXML = ""
    private syncTimeout: NodeJS.Timeout | null = null

    constructor(options: YjsCollaborationOptions) {
        this.roomName = options.roomName
        this.options = options

        // 初始化 Yjs 文档
        this.ydoc = new Y.Doc()

        // 获取或创建 Y.Text 实例（用于存储 XML）
        this.ytext = this.ydoc.getText("diagram-xml")

        this.initialize()
    }

    private async initialize() {
        try {
            // 建立 WebSocket 连接
            // 注意：WebsocketProvider 会自动在 URL 后面添加 roomName，所以基础 URL 不需要包含 roomName
            const wsUrl = `${YJS_CONFIG.WS_URL}/yjs`

            this.provider = new WebsocketProvider(
                wsUrl,
                this.roomName,
                this.ydoc,
                {
                    connect: YJS_CONFIG.RECONNECT,
                    reconnect: YJS_CONFIG.RECONNECT,
                    reconnectInterval: YJS_CONFIG.RECONNECT_INTERVAL,
                    maxReconnectAttempts: YJS_CONFIG.RECONNECT_MAX_ATTEMPTS,
                    // 只读模式通过 URL 参数传递
                    params: this.options.isReadOnly
                        ? { mode: "readonly" }
                        : undefined,
                },
            )

            // 监听连接状态
            this.provider.on("status", (event: { status: string }) => {
                console.log("[Yjs] WebSocket status:", event.status)
                this.options.onConnectionStatusChange?.(
                    event.status as "connecting" | "connected" | "disconnected",
                )
            })

            // 监听同步状态
            this.provider.on("sync", (event: { status: boolean }) => {
                if (event.status) {
                    console.log(
                        "[Yjs] Document synced, initial content:",
                        this.ytext.toString(),
                    )
                    // 同步完成后，如果本地有内容，发送出去
                    if (this.lastXML) {
                        this.pushLocalUpdate(this.lastXML)
                    }
                }
            })

            // 监听在线用户数
            this.provider.awareness.on("change", () => {
                const userCount = this.provider?.awareness.getStates().size || 0
                this.options.onUserCountChange?.(userCount)
            })

            // 监听远程更新
            this.ytext.observe((event) => {
                if (this.isDisposed) return

                // 检查是否是本地更新（通过 transaction.origin 判断）
                const isLocalUpdate = event.transaction.origin === this.provider

                // 只处理远程更新
                if (!isLocalUpdate) {
                    const newXML = this.ytext.toString()
                    console.log(
                        "[Yjs] Remote update received, length:",
                        newXML.length,
                    )

                    // 防抖处理，避免频繁更新
                    if (this.syncTimeout) {
                        clearTimeout(this.syncTimeout)
                    }

                    this.syncTimeout = setTimeout(() => {
                        this.lastXML = newXML
                        this.options.onRemoteChange?.(newXML)
                    }, 100)
                }

                // 增加更新计数（用于快照检测）
                this.updateCount++
                this.checkAndUploadSnapshot()
            })

            console.log(
                "[Yjs] Collaboration initialized for room:",
                this.roomName,
            )
        } catch (error) {
            console.error("[Yjs] Initialization error:", error)
        }
    }

    /**
     * 推送本地更新到 Yjs
     */
    pushLocalUpdate(xml: string) {
        if (this.isDisposed) return

        this.lastXML = xml

        // 只有在内容真正改变时才推送
        const currentContent = this.ytext.toString()
        if (currentContent !== xml) {
            this.ydoc.transact(() => {
                this.ytext.delete(0, this.ytext.length)
                this.ytext.insert(0, xml)
            }, this.provider)
        }
    }

    /**
     * 检查是否需要上传快照
     */
    private async checkAndUploadSnapshot() {
        if (this.updateCount >= YJS_CONFIG.SNAPSHOT_THRESHOLD) {
            console.log(
                "[Yjs] Update count reached threshold, checking snapshot lock...",
            )
            const success = await this.tryUploadSnapshot()
            if (success) {
                this.updateCount = 0
            }
        }
    }

    /**
     * 尝试上传快照（带分布式锁）
     */
    private async tryUploadSnapshot(): Promise<boolean> {
        try {
            // 1. 先尝试获取分布式锁（使用现有的后端接口）
            const lockResult = await checkLock({
                roomId: this.roomName, // 直接使用字符串，避免精度丢失
            })

            if (!lockResult) {
                console.log(
                    "[Yjs] Another client is uploading snapshot, skipping...",
                )
                return false
            }

            console.log("[Yjs] Acquired snapshot lock, uploading...")

            // 2. 获取当前文档状态（Yjs 状态向量）
            const state = Y.encodeStateAsUpdate(this.ydoc)
            const base64Data = btoa(
                String.fromCharCode(...new Uint8Array(state)),
            )

            // 3. 上传快照（使用现有的后端接口）
            const uploadResult = await uploadSnapshot(
                { roomId: this.roomName }, // 直接使用字符串，避免精度丢失
                base64Data,
            )

            if (uploadResult) {
                console.log("[Yjs] Snapshot uploaded successfully")
                return true
            } else {
                console.error("[Yjs] Snapshot upload failed")
                return false
            }
        } catch (error) {
            console.error("[Yjs] Snapshot upload error:", error)
            return false
        }
    }

    /**
     * 获取当前文档内容
     */
    getDocument(): string {
        return this.ytext.toString()
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.provider?.wsconnected === true
    }

    /**
     * 获取在线用户数
     */
    getUserCount(): number {
        return this.provider?.awareness.getStates().size || 0
    }

    /**
     * 销毁协作实例
     */
    dispose() {
        this.isDisposed = true
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout)
        }
        if (this.provider) {
            this.provider.destroy()
        }
        this.ydoc.destroy()
        console.log("[Yjs] Collaboration disposed")
    }
}

/**
 * 创建协作实例的工厂函数
 */
export function createCollaboration(
    options: YjsCollaborationOptions,
): YjsCollaboration {
    return new YjsCollaboration(options)
}
