"use client"

import { useCallback, useRef } from "react"
import type { DrawIoEmbedRef } from "react-drawio"
import { toast } from "sonner"
import { editDiagram } from "@/api/diagramController"

// 定义必要的接口
export interface SaveOptions {
    diagramId: string
    userId: string
    title: string
    xml: string
}

export interface DownloadOptions {
    diagramId: string
    filename: string
    format: "PNG" | "SVG" | "XML"
}

// 辅助函数：睡眠/延时，用于防止 iframe 操作过快
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useDiagramSave(drawioRef: React.Ref<DrawIoEmbedRef | null>) {
    // 用于暂存导出操作的 Promise 控制器
    const exportPromiseRef = useRef<{
        resolve: (data: string) => void
        reject: (error: Error) => void
        format: string
    } | null>(null)

    /**
     * 导出图表为指定格式（返回 Promise）
     * 这是一个异步操作，通过 postMessage 与 iframe 通信
     */
    const exportDiagram = useCallback(
        (format: "xml" | "png" | "svg"): Promise<string> => {
            return new Promise((resolve, reject) => {
                if (!drawioRef.current) {
                    reject(new Error("Draw.io 编辑器未就绪"))
                    return
                }

                // 如果上一次导出还没结束，直接拒绝新的请求，防止状态冲突
                if (exportPromiseRef.current) {
                    // 这种情况极少发生，因为我们在 saveDiagram 中使用了 await
                    console.warn("上一次导出尚未完成，正在重置...")
                    exportPromiseRef.current = null
                }

                // 保存 resolver 以在回调中使用
                exportPromiseRef.current = {
                    resolve,
                    reject,
                    format,
                }

                try {
                    // 调用 Draw.io 的导出方法
                    // xml: 使用 xmlsvg 格式 (包含 XML 数据的 SVG)
                    // png: 使用 png 格式
                    // svg: 使用 xmlsvg 格式
                    const drawioFormat =
                        format === "xml"
                            ? "xmlsvg"
                            : format === "png"
                              ? "png"
                              : "xmlsvg"

                    drawioRef.current.exportDiagram({
                        format: drawioFormat,
                    })
                } catch (error) {
                    exportPromiseRef.current = null
                    reject(error)
                }
            })
        },
        [drawioRef],
    )

    /**
     * 处理 Draw.io 导出回调（需要在组件中调用）
     * 必须绑定到 <DrawIoEmbed onExport={handleExportCallback} />
     */
    const handleExportCallback = useCallback((data: string) => {
        if (exportPromiseRef.current) {
            console.log(
                `[useDiagramSave] 接收到导出数据 (${exportPromiseRef.current.format})`,
            )
            exportPromiseRef.current.resolve(data)
            exportPromiseRef.current = null
        }
    }, [])

    /**
     * 上传文件到后端
     * 使用 FormData multipart/form-data 格式
     */
    const uploadFile = useCallback(
        async (
            file: File,
            diagramId: string,
            userId: string,
            bizType: "png" | "svg",
        ): Promise<string | null> => {
            try {
                // 创建 FormData
                const formData = new FormData()
                formData.append("file", file)

                // 创建 diagramUploadRequest JSON
                const diagramUploadRequest = {
                    biz: bizType,
                    diagramId: diagramId,
                    userId: userId,
                }

                // 添加为 JSON 字符串
                formData.append(
                    "diagramUploadRequest",
                    JSON.stringify(diagramUploadRequest),
                )

                console.log(
                    `[useDiagramSave] 开始上传 ${bizType.toUpperCase()} 文件:`,
                    {
                        fileName: file.name,
                        fileSize: file.size,
                        diagramId,
                    },
                )

                // 使用 fetch 直接发送 FormData
                const API_BASE_URL =
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8081/api"

                const response = await fetch(`${API_BASE_URL}/diagram/upload`, {
                    method: "POST",
                    headers: {
                        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data boundary
                    },
                    body: formData,
                    credentials: "include", // 携带 cookie
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json()

                if (result?.code === 0 && result?.data) {
                    console.log(
                        `[useDiagramSave] ${bizType.toUpperCase()} 上传成功:`,
                        result.data,
                    )
                    return result.data
                } else {
                    console.error(
                        `[useDiagramSave] ${bizType.toUpperCase()} 上传失败:`,
                        result,
                    )
                    return null
                }
            } catch (error) {
                console.error(
                    `[useDiagramSave] ${bizType.toUpperCase()} 上传异常:`,
                    error,
                )
                return null
            }
        },
        [],
    )

    /**
     * 保存图表到后端
     * 严格的串行流程：导出PNG -> 上传PNG -> 休息 -> 导出SVG -> 上传SVG -> 保存信息
     */
    const saveDiagram = useCallback(
        async ({
            diagramId,
            userId,
            title,
            xml,
        }: SaveOptions): Promise<boolean> => {
            try {
                toast.loading("正在保存图表...", { id: "save-diagram" })
                let pngUrl: string | null = null
                let svgUrl: string | null = null

                // --- 阶段 1: 处理 PNG ---
                try {
                    console.log("[useDiagramSave] 阶段1: 导出 PNG...")
                    const pngData = await exportDiagram("png")
                    const pngFile = base64ToFile(
                        pngData,
                        `${title}.png`,
                        "image/png",
                    )
                    // 立即上传 PNG
                    pngUrl = await uploadFile(pngFile, diagramId, userId, "png")
                } catch (e) {
                    console.error("PNG 导出/上传失败 (非致命错误):", e)
                }

                // --- 关键：休息一下 ---
                // 给 Draw.io iframe 一点时间喘息，防止连续 postMessage 导致死锁
                await sleep(100)

                // --- 阶段 2: 处理 SVG ---
                try {
                    console.log("[useDiagramSave] 阶段2: 导出 SVG...")
                    const svgData = await exportDiagram("svg")
                    const svgFile = base64ToFile(
                        svgData,
                        `${title}.svg`,
                        "image/svg+xml",
                    )
                    // 立即上传 SVG
                    svgUrl = await uploadFile(svgFile, diagramId, userId, "svg")
                } catch (e) {
                    console.error("SVG 导出/上传失败 (非致命错误):", e)
                }

                // --- 阶段 3: 保存图表元数据 ---
                console.log("[useDiagramSave] 阶段3: 保存图表信息...")

                // 只要 XML 还在，即使图片生成失败也允许保存，只是没有预览图
                const response = await editDiagram({
                    id: diagramId,
                    title: title,
                    diagramCode: xml,
                    pictureUrl: pngUrl || svgUrl || undefined, // 优先使用 PNG
                })

                if (response?.code === 0) {
                    toast.success("图表保存成功！", { id: "save-diagram" })
                    console.log("[useDiagramSave] 流程全部完成")
                    return true
                } else {
                    throw new Error(
                        response?.message ||
                            response?.msg ||
                            "保存接口返回错误",
                    )
                }
            } catch (error) {
                console.error("[useDiagramSave] 保存流程致命错误:", error)
                toast.error(
                    `保存失败: ${error instanceof Error ? error.message : "未知错误"}`,
                    {
                        id: "save-diagram",
                    },
                )
                return false
            }
        },
        [exportDiagram, uploadFile],
    )

    /**
     * 从后端下载图表
     */
    const downloadDiagram = useCallback(
        async ({
            diagramId,
            filename,
            format,
        }: DownloadOptions): Promise<void> => {
            try {
                toast.loading("正在准备下载...", { id: "download-diagram" })

                const API_BASE_URL =
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8081/api"

                const params = new URLSearchParams({
                    type: format.toUpperCase(),
                    diagramId: String(diagramId),
                    fileName: filename,
                })

                const response = await fetch(
                    `${API_BASE_URL}/diagram/stream-download?${params.toString()}`,
                    {
                        method: "GET",
                        credentials: "include",
                    },
                )

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const extension =
                    format === "xml" ? "drawio" : format.toLowerCase()
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${filename}.${extension}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                toast.success("下载完成！", { id: "download-diagram" })
            } catch (error) {
                console.error("[useDiagramSave] 下载失败:", error)
                toast.error(
                    `下载失败: ${error instanceof Error ? error.message : "未知错误"}`,
                    {
                        id: "download-diagram",
                    },
                )
            }
        },
        [],
    )

    return {
        exportDiagram,
        handleExportCallback,
        saveDiagram,
        downloadDiagram,
    }
}

function base64ToFile(
    base64: string,
    filename: string,
    mimeType: string,
): File {
    try {
        // 移除 data URL 前缀（如果有）
        const base64Data = base64.includes(",") ? base64.split(",")[1] : base64

        // 将 base64 转换为二进制
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)

        // 创建 Blob
        const blob = new Blob([byteArray], { type: mimeType })

        // 创建 File
        return new File([blob], filename, { type: mimeType })
    } catch (e) {
        console.error("Base64 conversion failed", e)
        return new File([""], filename, { type: mimeType })
    }
}
