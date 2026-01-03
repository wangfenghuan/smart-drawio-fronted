/**
 * React Hook for Yjs Collaboration
 *
 * 提供：
 * 1. 自动初始化和清理 Yjs 协作实例
 * 2. 连接状态管理
 * 3. 在线用户数统计
 * 4. 远程更改回调
 */

import { useEffect, useRef, useState } from "react"
import {
    createCollaboration,
    type YjsCollaboration,
    type YjsCollaborationOptions,
} from "./yjs-collab"

export interface UseYjsCollaborationOptions {
    roomName: string
    diagramId: string
    enabled?: boolean
    isReadOnly?: boolean
    onRemoteChange?: (xml: string) => void
}

export function useYjsCollaboration({
    roomName,
    diagramId,
    enabled = true,
    isReadOnly = false,
    onRemoteChange,
}: UseYjsCollaborationOptions) {
    const [isConnected, setIsConnected] = useState(false)
    const [userCount, setUserCount] = useState(0)
    const collabRef = useRef<YjsCollaboration | null>(null)

    useEffect(() => {
        if (!enabled || !roomName) {
            return
        }

        // 创建协作实例
        const collab = createCollaboration({
            roomName,
            diagramId,
            isReadOnly,
            onRemoteChange: (xml) => {
                onRemoteChange?.(xml)
            },
            onConnectionStatusChange: (status) => {
                setIsConnected(status === "connected")
            },
            onUserCountChange: (count) => {
                setUserCount(count)
            },
        })

        collabRef.current = collab

        // 清理函数
        return () => {
            collab.dispose()
            collabRef.current = null
        }
    }, [roomName, diagramId, enabled, isReadOnly])

    /**
     * 推送本地更新到协作服务器
     */
    const pushUpdate = (xml: string) => {
        const readyToPush = collabRef.current?.isReadyToPush() || false

        if (collabRef.current && readyToPush) {
            collabRef.current.pushLocalUpdate(xml)
        }
    }

    /**
     * 获取当前文档内容
     */
    const getDocument = (): string => {
        return collabRef.current?.getDocument() || ""
    }

    return {
        isConnected,
        userCount,
        pushUpdate,
        getDocument,
        collaboration: collabRef.current,
        isReadyToPush: () => collabRef.current?.isReadyToPush() || false,
    }
}
