/**
 * React Hook for WebSocket Collaboration (带协议头版本)
 *
 * 提供：
 * 1. 自动初始化和清理 WebSocket 协作实例
 * 2. 连接状态管理
 * 3. 在线用户数统计
 * 4. 远程更改回调
 * 5. 光标位置同步
 * 6. 权限控制（view/edit）
 */

import { useEffect, useRef, useState } from "react"
import {
    createWebSocketCollaboration,
    type WebSocketCollaboration,
} from "./websocket-collab"
import { UserRole, PointerData } from "./collab-protocol"

export interface UseWebSocketCollaborationOptions {
    roomName: string
    secretKey: string // 密钥,用于加密/解密
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名
    enabled?: boolean
    onRemoteChange?: (xml: string) => void
    onPointerMove?: (pointer: PointerData) => void
}

export function useWebSocketCollaboration({
    roomName,
    secretKey,
    userRole,
    userId,
    userName,
    enabled = true,
    onRemoteChange,
    onPointerMove,
}: UseWebSocketCollaborationOptions) {
    const [isConnected, setIsConnected] = useState(false)
    const [userCount, setUserCount] = useState(0)
    const collabRef = useRef<WebSocketCollaboration | null>(null)

    console.log("[useWebSocketCollaboration] Render with:", {
        roomName,
        enabled,
        hasSecretKey: !!secretKey,
        userRole,
        userId,
    })

    useEffect(() => {
        console.log("[useWebSocketCollaboration] useEffect triggered:", {
            enabled,
            roomName,
            hasSecretKey: !!secretKey,
            userRole,
            userId,
        })

        if (!enabled || !roomName || !secretKey || !userId) {
            console.log(
                "[useWebSocketCollaboration] Skipping (missing required params)",
            )
            return
        }

        console.log(
            "[useWebSocketCollaboration] Creating WebSocket collaboration instance...",
        )

        // 创建协作实例
        const collab = createWebSocketCollaboration({
            roomName,
            secretKey,
            userRole,
            userId,
            userName,
            onRemoteChange: (xml) => {
                console.log(
                    "[useWebSocketCollaboration] onRemoteChange callback, XML length:",
                    xml?.length,
                )
                onRemoteChange?.(xml)
            },
            onPointerMove: (pointer) => {
                console.log(
                    "[useWebSocketCollaboration] onPointerMove callback:",
                    pointer.userName,
                )
                onPointerMove?.(pointer)
            },
            onConnectionStatusChange: (status) => {
                console.log(
                    "[useWebSocketCollaboration] Connection status changed:",
                    status,
                )
                setIsConnected(status === "connected")
            },
            onUserCountChange: (count) => {
                console.log(
                    "[useWebSocketCollaboration] User count changed:",
                    count,
                )
                setUserCount(count)
            },
        })

        collabRef.current = collab
        console.log(
            "[useWebSocketCollaboration] WebSocket collaboration instance created",
        )

        // 清理函数
        return () => {
            console.log(
                "[useWebSocketCollaboration] Cleaning up WebSocket collaboration instance",
            )
            collab.dispose()
            collabRef.current = null
        }
        // 只依赖 roomName、enabled 和 userRole
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomName, enabled, userRole])

    /**
     * 推送本地更新到协作服务器
     */
    const pushUpdate = (xml: string) => {
        console.log(
            "[useWebSocketCollaboration] pushUpdate called, XML length:",
            xml.length,
        )
        console.log(
            "[useWebSocketCollaboration] collabRef.current:",
            collabRef.current,
        )
        console.log(
            "[useWebSocketCollaboration] isReadyToPush:",
            collabRef.current?.isReadyToPush(),
        )

        const readyToPush = collabRef.current?.isReadyToPush() || false

        if (collabRef.current && readyToPush) {
            console.log(
                "[useWebSocketCollaboration] ✅ Pushing update to WebSocket server",
            )
            collabRef.current.pushUpdate(xml)
        } else {
            console.log("[useWebSocketCollaboration] ❌ Cannot push:", {
                hasCollab: !!collabRef.current,
                readyToPush,
            })
        }
    }

    /**
     * 获取当前文档内容（WebSocket 方式不维护文档状态）
     */
    const getDocument = (): string => {
        return collabRef.current?.getDocument() || ""
    }

    /**
     * 发送光标位置
     */
    const sendPointer = (x: number, y: number) => {
        if (collabRef.current && collabRef.current.isConnected()) {
            collabRef.current.sendPointer(x, y)
        }
    }

    /**
     * 请求全量同步
     */
    const requestFullSync = () => {
        if (collabRef.current && collabRef.current.isConnected()) {
            collabRef.current.requestFullSync()
        }
    }

    return {
        isConnected,
        userCount,
        pushUpdate,
        sendPointer,
        requestFullSync,
        getDocument,
        collaboration: collabRef.current,
        isReadyToPush: () => collabRef.current?.isReadyToPush() || false,
    }
}
