/**
 * React Hook for Yjs + 自定义协议混合协作
 */

import { useEffect, useRef, useState } from "react"
import type { UserRole } from "./collab-protocol"
import {
    createYjsCollaborationWrapper,
    type YjsCollaborationWrapper,
} from "./yjs-collab-wrapper"

export interface UseYjsCollaborationWrapperOptions {
    roomName: string
    secretKey: string // 密钥，用于加密/解密
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名
    enabled?: boolean
    onRemoteChange?: (xml: string) => void
    onPointerMove?: (pointer: any) => void
}

export function useYjsCollaborationWrapper({
    roomName,
    secretKey,
    userRole,
    userId,
    userName,
    enabled = true,
    onRemoteChange,
    onPointerMove,
}: UseYjsCollaborationWrapperOptions) {
    const [isConnected, setIsConnected] = useState(false)
    const [userCount, setUserCount] = useState(0)
    const collabRef = useRef<YjsCollaborationWrapper | null>(null)

    console.log("[useYjsCollaborationWrapper] Render with:", {
        roomName,
        enabled,
        hasSecretKey: !!secretKey,
        userRole,
        userId,
    })

    useEffect(() => {
        console.log("[useYjsCollaborationWrapper] useEffect triggered:", {
            enabled,
            roomName,
            hasSecretKey: !!secretKey,
            userRole,
            userId,
        })

        if (!enabled || !roomName || !secretKey || !userId) {
            console.log(
                "[useYjsCollaborationWrapper] Skipping (missing required params)",
            )
            return
        }

        // 延迟执行，避免在组件卸载时创建连接
        const timeoutId = setTimeout(() => {
            // 检查是否仍然启用（防止竞态条件）
            if (!enabled || !roomName || !secretKey) {
                console.log(
                    "[useYjsCollaborationWrapper] Conditions changed, aborting connection",
                )
                return
            }

            console.log(
                "[useYjsCollaborationWrapper] Creating Yjs wrapper collaboration instance...",
            )

            // 创建 Yjs 包装协作实例
            const collab = createYjsCollaborationWrapper({
                roomName,
                secretKey,
                userRole,
                userId,
                userName,
                onRemoteChange: (xml) => {
                    console.log(
                        "[useYjsCollaborationWrapper] onRemoteChange callback, XML length:",
                        xml?.length,
                    )
                    onRemoteChange?.(xml)
                },
                onConnectionStatusChange: (status) => {
                    console.log(
                        "[useYjsCollaborationWrapper] Connection status changed:",
                        status,
                    )
                    setIsConnected(status === "connected")
                },
                onUserCountChange: (count) => {
                    console.log(
                        "[useYjsCollaborationWrapper] User count changed:",
                        count,
                    )
                    setUserCount(count)
                },
            })

            collabRef.current = collab
            console.log(
                "[useYjsCollaborationWrapper] Yjs wrapper collaboration instance created",
            )
        }, 100) // 100ms 延迟，确保状态稳定

        // 清理函数
        return () => {
            clearTimeout(timeoutId) // 清除定时器
            if (collabRef.current) {
                console.log(
                    "[useYjsCollaborationWrapper] Cleaning up Yjs wrapper collaboration instance",
                )
                collabRef.current.dispose()
                collabRef.current = null
            }
        }
    }, [
        roomName,
        enabled,
        userRole,
        secretKey,
        userId,
        userName,
        onRemoteChange,
    ]) // 恢复完整依赖

    /**
     * 推送本地更新到协作服务器
     */
    const pushUpdate = (xml: string) => {
        console.log(
            "[useYjsCollaborationWrapper] pushUpdate called, XML length:",
            xml.length,
        )
        console.log(
            "[useYjsCollaborationWrapper] collabRef.current:",
            collabRef.current,
        )
        console.log(
            "[useYjsCollaborationWrapper] isReadyToPush:",
            collabRef.current?.isReadyToPush(),
        )

        const readyToPush = collabRef.current?.isReadyToPush() || false

        if (collabRef.current && readyToPush) {
            console.log(
                "[useYjsCollaborationWrapper] ✅ Pushing update via Yjs wrapper",
            )
            collabRef.current.pushUpdate(xml)
        } else {
            console.log("[useYjsCollaborationWrapper] ❌ Cannot push:", {
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

    /**
     * 请求全量同步
     */
    const requestFullSync = () => {
        if (collabRef.current?.isConnected()) {
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
