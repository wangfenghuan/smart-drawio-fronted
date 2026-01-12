/**
 * Yjs + 自定义协议混合实现
 *
 * 设计思路：
 * 1. 使用 Yjs 处理 CRDT 和冲突解决
 * 2. 拦截 Yjs 的二进制更新
 * 3. 包装成自定义协议（OpCode + 加密）
 * 4. 通过自定义 WebSocket 发送
 *
 * 优势：
 * - 保留 Yjs 的 CRDT 能力
 * - 保留现有的加密和权限控制
 * - 后端不需要改
 */

import * as Y from "yjs"
import type { UserRole } from "./collab-protocol"
import { WebSocketCollaboration } from "./websocket-collab"

export interface YjsWrapperOptions {
    roomName: string
    secretKey: string // 密钥，用于加密/解密
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名
    onRemoteChange?: (xml: string) => void
    onConnectionStatusChange?: (
        status: "connecting" | "connected" | "disconnected",
    ) => void
    onUserCountChange?: (count: number) => void
}

export class YjsCollaborationWrapper {
    private ydoc: Y.Doc
    private yXmlText: Y.Text
    private wsCollab: WebSocketCollaboration
    private roomName: string
    private secretKey: string
    private userRole: UserRole
    private userId: string
    private isUpdatingFromRemote = false

    constructor(options: YjsWrapperOptions) {
        this.roomName = options.roomName
        this.secretKey = options.secretKey
        this.userRole = options.userRole
        this.userId = options.userId

        console.log("[YjsWrapper] 初始化 Yjs + 自定义协议混合模式", {
            roomName: this.roomName,
            userRole: this.userRole,
            userId: this.userId,
        })

        // 1. 创建 Yjs 文档
        this.ydoc = new Y.Doc({
            guid: this.roomName,
        })

        // 2. 获取共享文本（立即初始化，确保类型存在于文档中）
        this.yXmlText = this.ydoc.getText("drawio-xml")

        // 3. 强制初始化 Y.Text 类型，确保其在 typeRefs 中注册
        // 这一步很关键！必须在监听 update 事件之前完成
        const initialLength = this.yXmlText.length
        console.log(
            "[YjsWrapper] ✅ Y.Text initialized, length:",
            initialLength,
        )

        // 4. 先注册一个空的 transaction，确保所有内部结构都初始化
        this.ydoc.transact(() => {
            // 空事务，强制 Yjs 初始化内部数据结构
            const _ = this.yXmlText.toString()
        }, "init")

        console.log("[YjsWrapper] ✅ Y.Doc internal structures initialized")

        // 5. 监听 Yjs 更新
        this.ydoc.on("update", (update: Uint8Array, origin: any) => {
            console.log("[YjsWrapper] 📦 Yjs update received", {
                updateSize: update.length,
                origin,
                isUpdatingFromRemote: this.isUpdatingFromRemote,
            })

            // 如果是远程更新，已经通过 WebSocket 处理了
            if (origin === "remote") {
                console.log("[YjsWrapper] ⏭️ Skipping remote update")
                return
            }

            // 如果是本地更新，需要通过 WebSocket 发送
            if (origin === this && !this.isUpdatingFromRemote) {
                console.log(
                    "[YjsWrapper] 📤 Local update, sending via WebSocket",
                )
                this.sendYjsUpdate(update)
            }
        })

        // 6. 监听 Y.Text 变化（通知外部）
        this.yXmlText.observe((event) => {
            console.log("[YjsWrapper] 📝 Y.Text changed", {
                isUpdatingFromRemote: this.isUpdatingFromRemote,
                delta: event.changes.delta,
            })

            // 无论本地还是远程更新，都需要通知外部更新 Draw.io
            const xml = this.yXmlText.toString()
            if (xml.length > 0) {
                console.log(
                    "[YjsWrapper] 🔔 Notifying external of XML change, length:",
                    xml.length,
                )
                options.onRemoteChange?.(xml)
            }
        })

        // 7. 创建自定义 WebSocket 协作实例
        this.wsCollab = new WebSocketCollaboration({
            roomName: options.roomName,
            secretKey: options.secretKey,
            userRole: options.userRole,
            userId: options.userId,
            userName: options.userName,
            onRemoteChange: (data) => {
                // 接收远程数据（Yjs 二进制更新）
                console.log("[YjsWrapper] 📨 Received data, type:", typeof data)

                // 处理 Uint8Array 数据（Yjs 二进制）
                if (data instanceof Uint8Array) {
                    if (data.length === 0) {
                        console.warn("[YjsWrapper] ⚠️ Received empty data")
                        return
                    }

                    console.log(
                        "[YjsWrapper] 📨 Received Yjs binary update, size:",
                        data.length,
                    )

                    // 打印文档状态（应用更新前）
                    console.log(
                        "[YjsWrapper] 📋 Document state BEFORE applying update:",
                        {
                            guid: this.ydoc.guid,
                            clientID: this.ydoc.clientID,
                            shareKeys: Array.from(this.ydoc.share.keys()),
                            textLength: this.yXmlText.length,
                        },
                    )

                    try {
                        this.isUpdatingFromRemote = true

                        // 打印前20字节用于调试
                        console.log(
                            "[YjsWrapper] 📋 First 20 bytes:",
                            Array.from(data.slice(0, 20))
                                .map(
                                    (b) =>
                                        "0x" + b.toString(16).padStart(2, "0"),
                                )
                                .join(" "),
                        )

                        // 应用远程 Yjs 更新
                        console.log("[YjsWrapper] 🔄 Applying Yjs update...")
                        Y.applyUpdate(this.ydoc, data, "remote")

                        console.log(
                            "[YjsWrapper] ✅ Yjs update applied successfully",
                        )

                        // 打印文档状态（应用更新后）
                        console.log(
                            "[YjsWrapper] 📋 Document state AFTER applying update:",
                            {
                                shareKeys: Array.from(this.ydoc.share.keys()),
                                textLength: this.yXmlText.length,
                                xmlPreview: this.yXmlText
                                    .toString()
                                    .substring(0, 100),
                            },
                        )

                        setTimeout(() => {
                            this.isUpdatingFromRemote = false
                        }, 100)
                    } catch (error) {
                        console.error(
                            "[YjsWrapper] ❌ Failed to apply Yjs update:",
                            error,
                        )
                        console.error("[YjsWrapper] Error details:", {
                            name: error?.name,
                            message: error?.message,
                        })
                        this.isUpdatingFromRemote = false
                    }
                } else {
                    console.warn(
                        "[YjsWrapper] ⚠️ Received unknown data type:",
                        typeof data,
                    )
                }
            },
            onConnectionStatusChange: options.onConnectionStatusChange,
            onUserCountChange: options.onUserCountChange,
        })

        console.log("[YjsWrapper] ✅ 初始化完成")
        console.log("[YjsWrapper] 📋 Y.Doc GUID:", this.ydoc.guid)
        console.log("[YjsWrapper] 📋 Y.Doc clientID:", this.ydoc.clientID)
    }

    /**
     * 发送 Yjs 更新（直接发送二进制数据）
     */
    private sendYjsUpdate(update: Uint8Array) {
        if (this.userRole !== "edit") {
            console.warn("[YjsWrapper] ❌ Read-only user cannot send updates")
            return
        }

        if (!this.wsCollab.isReadyToPush()) {
            console.warn("[YjsWrapper] ⚠️ WebSocket not ready")
            return
        }

        try {
            console.log(
                "[YjsWrapper] 📤 Sending Yjs binary update, size:",
                update.length,
            )

            // 直接发送 Yjs 二进制更新
            this.wsCollab.pushBinaryUpdate(update)

            console.log("[YjsWrapper] ✅ Yjs binary update sent")
        } catch (error) {
            console.error("[YjsWrapper] ❌ Failed to send Yjs update:", error)
        }
    }

    /**
     * 推送本地 XML 更新
     * @param xml 完整的 Draw.io XML
     */
    async pushUpdate(xml: string) {
        if (this.userRole !== "edit") {
            console.warn("[YjsWrapper] ❌ Read-only user cannot push updates")
            return
        }

        if (!this.wsCollab.isReadyToPush()) {
            console.warn("[YjsWrapper] ⚠️ Not ready to push")
            return
        }

        console.log(
            "[YjsWrapper] 📤 Pushing local XML update, length:",
            xml.length,
        )

        try {
            // 替换整个 Y.Text
            const currentLength = this.yXmlText.length
            this.ydoc.transact(() => {
                if (currentLength > 0) {
                    this.yXmlText.delete(0, currentLength)
                }
                this.yXmlText.insert(0, xml)
            }, this)

            console.log("[YjsWrapper] ✅ Local Yjs document updated")

            // Yjs 会触发 update 事件（origin = this），自动发送到远程
        } catch (error) {
            console.error(
                "[YjsWrapper] ❌ Failed to update Yjs document:",
                error,
            )
        }
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.wsCollab.isConnected()
    }

    /**
     * 检查是否准备好推送
     */
    isReadyToPush(): boolean {
        return this.wsCollab.isReadyToPush()
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
        return this.wsCollab.getUserCount()
    }

    /**
     * 发送光标位置（使用现有的 POINTER 协议）
     */
    sendPointer(x: number, y: number) {
        this.wsCollab.sendPointer(x, y)
    }

    /**
     * 请求全量同步（使用现有的 FULL_SYNC 协议）
     */
    requestFullSync() {
        this.wsCollab.requestFullSync()
    }

    /**
     * 销毁实例
     */
    dispose() {
        console.log("[YjsWrapper] 🧹 Disposing...")
        this.isDisposed = true

        if (this.wsCollab) {
            console.log("[YjsWrapper] Disposing WebSocket collaboration...")
            this.wsCollab.dispose()
            this.wsCollab = null
        }

        if (this.ydoc) {
            console.log("[YjsWrapper] Destroying Yjs document...")
            this.ydoc.destroy()
        }

        console.log("[YjsWrapper] ✅ Disposal complete")
    }
}

/**
 * 创建 Yjs 包装实例的工厂函数
 */
export function createYjsCollaborationWrapper(
    options: YjsWrapperOptions,
): YjsCollaborationWrapper {
    return new YjsCollaborationWrapper(options)
}
