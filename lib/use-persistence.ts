/**
 * HTTP 持久化 Hook (Excalidraw 风格)
 *
 * 核心功能:
 * 1. 监听图表变化
 * 2. 防抖延迟(默认 2000ms)
 * 3. 加密数据
 * 4. 调用后端保存接口
 *
 * 与 handleAutoSave 的区别:
 * - handleAutoSave: 用于 WebSocket 实时广播
 * - usePersistence: 用于 HTTP 持久化到数据库
 */

import { useEffect, useRef } from "react"
import { save as saveRoom } from "@/api/roomController"
import { encryptData } from "./cryptoUtils"

export interface UsePersistenceOptions {
    /**
     * 房间 ID
     */
    roomId: string

    /**
     * 密钥(用于加密)
     */
    secretKey: string

    /**
     * 当前的图表数据 (XML 字符串)
     */
    xml: string

    /**
     * 是否启用持久化
     */
    enabled?: boolean

    /**
     * 防抖延迟(毫秒),默认 2000ms
     */
    debounceMs?: number

    /**
     * 保存成功回调
     */
    onSaveSuccess?: () => void

    /**
     * 保存失败回调
     */
    onSaveError?: (error: any) => void
}

export function usePersistence({
    roomId,
    secretKey,
    xml,
    enabled = true,
    debounceMs = 2000,
    onSaveSuccess,
    onSaveError,
}: UsePersistenceOptions) {
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedXmlRef = useRef<string>("")
    const isSavingRef = useRef<boolean>(false)

    useEffect(() => {
        // 如果未启用或没有数据,直接返回
        if (!enabled || !xml) {
            return
        }

        // 如果正在保存,跳过这次更新
        if (isSavingRef.current) {
            console.log("[usePersistence] ⏭️ Skipping, save in progress")
            return
        }

        // 如果数据没有变化,跳过
        if (xml === lastSavedXmlRef.current) {
            console.log("[usePersistence] ⏭️ Skipping, no changes")
            return
        }

        // 清除之前的定时器
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // 设置新的定时器
        saveTimeoutRef.current = setTimeout(async () => {
            console.log("[usePersistence] 💾 Saving to backend...")

            try {
                isSavingRef.current = true

                // 加密数据
                const encryptedData = await encryptData(xml, secretKey)
                console.log(
                    "[usePersistence] 🔒 Data encrypted, size:",
                    encryptedData.length,
                )

                // 将 Uint8Array 转换为 base64 字符串用于传输
                const binaryString = Array.from(encryptedData, (byte) =>
                    String.fromCharCode(byte),
                ).join("")
                const base64Data = btoa(binaryString)

                // 调用后端接口保存
                await saveRoom({ roomId: roomId }, base64Data)

                console.log("[usePersistence] ✅ Saved successfully")
                lastSavedXmlRef.current = xml
                onSaveSuccess?.()
            } catch (error) {
                console.error("[usePersistence] ❌ Save failed:", error)
                onSaveError?.(error)
            } finally {
                isSavingRef.current = false
            }
        }, debounceMs)

        // 清理函数
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [
        xml,
        roomId,
        secretKey,
        enabled,
        debounceMs,
        onSaveSuccess,
        onSaveError,
    ])

    /**
     * 手动触发保存(不受防抖限制)
     */
    const manualSave = async () => {
        if (!xml) {
            console.warn("[usePersistence] ⚠️ No data to save")
            return
        }

        console.log("[usePersistence] 💾 Manual save triggered...")

        try {
            isSavingRef.current = true

            // 加密数据
            const encryptedData = await encryptData(xml, secretKey)
            console.log(
                "[usePersistence] 🔒 Data encrypted, size:",
                encryptedData.length,
            )

            // 将 Uint8Array 转换为 base64 字符串用于传输
            const binaryString = Array.from(encryptedData, (byte) =>
                String.fromCharCode(byte),
            ).join("")
            const base64Data = btoa(binaryString)

            // 调用后端接口保存
            await saveRoom({ roomId: roomId }, base64Data)

            console.log("[usePersistence] ✅ Manual save succeeded")
            lastSavedXmlRef.current = xml
            onSaveSuccess?.()
        } catch (error) {
            console.error("[usePersistence] ❌ Manual save failed:", error)
            onSaveError?.(error)
        } finally {
            isSavingRef.current = false
        }
    }

    /**
     * 立即保存(如果有未保存的更改)
     */
    const flush = async () => {
        if (xml !== lastSavedXmlRef.current) {
            await manualSave()
        }
    }

    return {
        manualSave,
        flush,
        isSaving: isSavingRef.current,
    }
}
