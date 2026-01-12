/**
 * React Hook for Yjs Collaboration
 *
 * 提供：
 * 1. 自动初始化和清理 Yjs 协作实例
 * 2. 连接状态管理
 * 3. 在线用户数统计
 * 4. 远程更改回调
 * 5. 光标位置同步
 * 6. 权限控制（view/edit）
 */

import { useEffect, useRef, useState } from "react"
import type { UserRole } from "./collab-protocol"
import { createYjsCollaboration, type YjsCollaboration } from "./yjs-collab"

export interface UseYjsCollaborationOptions {
    roomName: string
    serverUrl: string // WebSocket 服务器 URL
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名
    enabled?: boolean
    onRemoteChange?: (xml: string) => void
    onPointerMove?: (pointer: any) => void
}

export function useYjsCollaboration({
    roomName,
    serverUrl,
    userRole,
    userId,
    userName,
    enabled = true,
    onRemoteChange,
    onPointerMove,
}: UseYjsCollaborationOptions) {
    const [isConnected, setIsConnected] = useState(false)
    const [userCount, setUserCount] = useState(0)
    const collabRef = useRef<YjsCollaboration | null>(null)

    console.log("[useYjsCollaboration] Render with:", {
        roomName,
        serverUrl,
        enabled,
        userRole,
        userId,
    })

    useEffect(() => {
        console.log("[useYjsCollaboration] useEffect triggered:", {
            enabled,
            roomName,
            serverUrl,
            userRole,
            userId,
        })

        if (!enabled || !roomName || !serverUrl || !userId) {
            console.log(
                "[useYjsCollaboration] Skipping (missing required params)",
            )
            return
        }

        console.log(
            "[useYjsCollaboration] Creating Yjs collaboration instance...",
        )

        // 创建协作实例
        const collab = createYjsCollaboration({
            roomName,
            serverUrl,
            userRole,
            userId,
            userName,
            onRemoteChange: (xml) => {
                console.log(
                    "[useYjsCollaboration] onRemoteChange callback, XML length:",
                    xml?.length,
                )
                onRemoteChange?.(xml)
            },
            onPointerMove: (pointer) => {
                console.log(
                    "[useYjsCollaboration] onPointerMove callback:",
                    pointer.userName,
                )
                onPointerMove?.(pointer)
            },
            onConnectionStatusChange: (status) => {
                console.log(
                    "[useYjsCollaboration] Connection status changed:",
                    status,
                )
                setIsConnected(status === "connected")
            },
            onUserCountChange: (count) => {
                console.log("[useYjsCollaboration] User count changed:", count)
                setUserCount(count)
            },
        })

        // 注册光标移动监听
        if (onPointerMove) {
            collab.onPointerMove(onPointerMove)
        }

        collabRef.current = collab
        console.log("[useYjsCollaboration] Yjs collaboration instance created")

        // 清理函数
        return () => {
            console.log(
                "[useYjsCollaboration] Cleaning up Yjs collaboration instance",
            )
            collab.dispose()
            collabRef.current = null
        }
    }, [roomName, serverUrl, enabled, userRole])

    /**
     * 推送本地更新到协作服务器
     */
    const pushUpdate = (xml: string) => {
        console.log(
            "[useYjsCollaboration] pushUpdate called, XML length:",
            xml.length,
        )
        console.log(
            "[useYjsCollaboration] collabRef.current:",
            collabRef.current,
        )
        console.log(
            "[useYjsCollaboration] isReadyToPush:",
            collabRef.current?.isReadyToPush(),
        )

        const readyToPush = collabRef.current?.isReadyToPush() || false

        if (collabRef.current && readyToPush) {
            console.log("[useYjsCollaboration] ✅ Pushing update to Yjs server")
            collabRef.current.pushUpdate(xml)
        } else {
            console.log("[useYjsCollaboration] ❌ Cannot push:", {
                hasCollab: !!collabRef.current,
                readyToPush,
            })
        }
    }

    /**
     * 获取当前文档内容
     */
    const getDocument = (): string => {
        return collabRef.current?.getDocument() || ""
    }

    /**
     * 发送光标位置
     */
    const sendPointer = (x: number, y: number) => {
        if (collabRef.current?.isConnected()) {
            collabRef.current.sendPointer(x, y)
        }
    }

    return {
        isConnected,
        userCount,
        pushUpdate,
        sendPointer,
        getDocument,
        collaboration: collabRef.current,
        isReadyToPush: () => collabRef.current?.isReadyToPush() || false,
    }
}
