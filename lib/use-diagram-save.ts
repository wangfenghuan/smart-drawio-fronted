"use client"

import { useCallback, useRef } from "react"
import type { DrawIoEmbedRef } from "react-drawio"
import { toast } from "sonner"
import {
    downloadRemoteFile,
    editDiagram,
    uploadDiagram,
} from "@/api/diagramController"
import type { API } from "@/api/typings"

export interface SaveOptions {
    diagramId: number
    userId: number
    title: string
    xml: string
}

export interface DownloadOptions {
    diagramId: number
    filename: string
    format: "png" | "svg" | "xml"
}

export function useDiagramSave(drawioRef: React.Ref<DrawIoEmbedRef | null>) {
    const exportPromiseRef = useRef<{
        resolve: (data: string) => void
        reject: (error: Error) => void
        format: string
    } | null>(null)

    /**
     * 导出图表为指定格式（返回 Promise）
     */
    const exportDiagram = useCallback(
        (format: "xml" | "png" | "svg"): Promise<string> => {
            return new Promise((resolve, reject) => {
                if (!drawioRef.current) {
                    reject(new Error("Draw.io 编辑器未就绪"))
                    return
                }

                // 保存 resolver 以在回调中使用
                exportPromiseRef.current = {
                    resolve,
                    reject,
                    format,
                }

                try {
                    // 调用 Draw.io 的导出方法
                    // xml: 使用 xmlsvg 格式
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
                    reject(error)
                }
            })
        },
        [drawioRef],
    )

    /**
     * 处理 Draw.io 导出回调（需要在组件中调用）
     */
    const handleExportCallback = useCallback((data: string) => {
        if (exportPromiseRef.current) {
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
            diagramId: number,
            userId: number,
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
                        userId,
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
     * 1. 导出 PNG 和 SVG
     * 2. 上传这两个文件
     * 3. 保存图表信息（包含 XML）
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

                // 1. 导出 PNG
                console.log("[useDiagramSave] 开始导出 PNG...")
                const pngData = await exportDiagram("png")
                const pngFile = base64ToFile(
                    pngData,
                    `${title}.png`,
                    "image/png",
                )

                // 2. 导出 SVG
                console.log("[useDiagramSave] 开始导出 SVG...")
                const svgData = await exportDiagram("svg")
                const svgFile = base64ToFile(
                    svgData,
                    `${title}.svg`,
                    "image/svg+xml",
                )

                // 3. 上传 PNG 和 SVG（并行上传）
                console.log("[useDiagramSave] 开始上传文件...")
                const [pngUrl, svgUrl] = await Promise.all([
                    uploadFile(pngFile, diagramId, userId, "png"),
                    uploadFile(svgFile, diagramId, userId, "svg"),
                ])

                // 4. 保存图表信息
                console.log("[useDiagramSave] 开始保存图表信息...")
                const response = await editDiagram({
                    body: {
                        id: diagramId,
                        title: title,
                        diagramCode: xml,
                        pictureUrl: pngUrl || svgUrl || undefined, // 优先使用 PNG，其次 SVG
                    },
                })

                if (response?.code === 0) {
                    toast.success("图表保存成功！", { id: "save-diagram" })
                    console.log("[useDiagramSave] 保存成功")
                    return true
                } else {
                    toast.error(`保存失败: ${response?.msg || "未知错误"}`, {
                        id: "save-diagram",
                    })
                    return false
                }
            } catch (error) {
                console.error("[useDiagramSave] 保存失败:", error)
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
     * 后端接口需要：type (必需)、diagramId (必需)、fileName (可选)
     */
    const downloadDiagram = useCallback(
        async ({
            diagramId,
            filename,
            format,
        }: DownloadOptions): Promise<void> => {
            try {
                toast.loading("正在准备下载...", { id: "download-diagram" })

                // 使用 fetch 直接下载，处理流式响应
                const API_BASE_URL =
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8081/api"

                // 构建 URL 参数
                const params = new URLSearchParams({
                    type: format.toUpperCase(), // 后端需要大写：SVG, PNG, XML
                    diagramId: String(diagramId),
                    fileName: filename,
                })

                const response = await fetch(
                    `${API_BASE_URL}/diagram/stream-download?${params.toString()}`,
                    {
                        method: "GET",
                        credentials: "include", // 携带 cookie
                    },
                )

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                // 获取文件扩展名
                const extension = format === "xml" ? "drawio" : format

                // 创建下载链接
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

/**
 * 将 Base64 数据转换为 File 对象
 */
function base64ToFile(
    base64: string,
    filename: string,
    mimeType: string,
): File {
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
}
