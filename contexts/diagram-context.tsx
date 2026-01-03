"use client"

import type React from "react"
import { createContext, useCallback, useContext, useRef, useState } from "react"
import type { DrawIoEmbedRef } from "react-drawio"
import { STORAGE_DIAGRAM_XML_KEY } from "@/components/chat-panel"
import type { ExportFormat } from "@/components/save-dialog"
import { useYjsCollaboration } from "../lib/use-yjs-collaboration"
import { extractDiagramXML, validateAndFixXml } from "../lib/utils"

interface DiagramContextType {
    chartXML: string
    latestSvg: string
    diagramHistory: { svg: string; xml: string }[]
    loadDiagram: (chart: string, skipValidation?: boolean) => string | null
    handleExport: () => void
    handleExportWithoutHistory: () => void
    resolverRef: React.Ref<((value: string) => void) | null>
    drawioRef: React.Ref<DrawIoEmbedRef | null>
    handleDiagramExport: (data: any) => void
    clearDiagram: () => void
    saveDiagramToFile: (
        filename: string,
        format: ExportFormat,
        sessionId?: string,
    ) => void
    isDrawioReady: boolean
    onDrawioLoad: () => void
    resetDrawioReady: () => void
    // 新增：注册外部导出回调处理器
    registerExportCallback: (callback: ((data: string) => void) | null) => void
    // Yjs 协作相关
    collaborationEnabled: boolean
    collaborationConnected: boolean
    collaborationUserCount: number
    toggleCollaboration: (
        enabled: boolean,
        roomName?: string,
        isReadOnly?: boolean,
    ) => void
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined)

export function DiagramProvider({ children }: { children: React.ReactNode }) {
    const [chartXML, setChartXML] = useState<string>("")
    const [latestSvg, setLatestSvg] = useState<string>("")
    const [diagramHistory, setDiagramHistory] = useState<
        { svg: string; xml: string }[]
    >([])
    const [isDrawioReady, setIsDrawioReady] = useState(false)
    const hasCalledOnLoadRef = useRef(false)
    const drawioRef = useRef<DrawIoEmbedRef | null>(null)
    const resolverRef = useRef<((value: string) => void) | null>(null)
    // Track if we're expecting an export for history (user-initiated)
    const expectHistoryExportRef = useRef<boolean>(false)

    // Yjs 协作状态
    const [collaborationEnabled, setCollaborationEnabled] = useState(false)
    const [collaborationRoomName, setCollaborationRoomName] =
        useState<string>("")
    const [collaborationIsReadOnly, setCollaborationIsReadOnly] =
        useState(false)
    const isUpdatingFromRemoteRef = useRef(false) // 防止循环更新

    // 初始化 Yjs 协作 Hook
    const {
        isConnected: collaborationConnected,
        userCount: collaborationUserCount,
        pushUpdate,
        getDocument,
    } = useYjsCollaboration({
        roomName: collaborationRoomName,
        diagramId: collaborationRoomName, // 简化处理，使用 roomName 作为 diagramId
        enabled: collaborationEnabled && !!collaborationRoomName, // 确保同时满足两个条件
        isReadOnly: collaborationIsReadOnly,
        onRemoteChange: (xml) => {
            // 远程更新：应用到 Draw.io
            console.log(
                "[DiagramContext] onRemoteChange called, xml length:",
                xml?.length,
            )
            console.log(
                "[DiagramContext] isUpdatingFromRemote:",
                isUpdatingFromRemoteRef.current,
            )

            if (!isUpdatingFromRemoteRef.current && xml) {
                console.log(
                    "[DiagramContext] Applying remote update to Draw.io",
                )
                isUpdatingFromRemoteRef.current = true
                // 直接加载到 Draw.io，不触发 Yjs 推送
                setChartXML(xml)

                if (drawioRef.current) {
                    console.log("[DiagramContext] Loading XML into Draw.io...")
                    try {
                        drawioRef.current.load({
                            xml: xml,
                        })
                        console.log(
                            "[DiagramContext] XML load command sent, waiting for render...",
                        )

                        // 延迟重置标志，确保 Draw.io 完成渲染
                        setTimeout(() => {
                            isUpdatingFromRemoteRef.current = false
                            console.log(
                                "[DiagramContext] Reset isUpdatingFromRemote flag after 500ms",
                            )
                        }, 500)
                    } catch (error) {
                        console.error(
                            "[DiagramContext] Failed to load XML:",
                            error,
                        )
                        isUpdatingFromRemoteRef.current = false
                    }
                } else {
                    console.warn(
                        "[DiagramContext] drawioRef.current is null, cannot load XML",
                    )
                    isUpdatingFromRemoteRef.current = false
                }
            } else {
                console.log(
                    "[DiagramContext] Skipping remote update - isUpdating:",
                    isUpdatingFromRemoteRef.current,
                    ", hasXml:",
                    !!xml,
                )
            }
        },
    })

    const onDrawioLoad = () => {
        // Only set ready state once to prevent infinite loops
        if (hasCalledOnLoadRef.current) return
        hasCalledOnLoadRef.current = true
        // console.log("[DiagramContext] DrawIO loaded, setting ready state")
        setIsDrawioReady(true)
    }

    const resetDrawioReady = () => {
        // console.log("[DiagramContext] Resetting DrawIO ready state")
        hasCalledOnLoadRef.current = false
        setIsDrawioReady(false)
    }

    // Track if we're expecting an export for file save (stores raw export data)
    const saveResolverRef = useRef<{
        resolver: ((data: string) => void) | null
        format: ExportFormat | null
    }>({ resolver: null, format: null })

    // 外部导出回调（用于 useDiagramSave 等其他模块）
    const externalExportCallbackRef = useRef<((data: string) => void) | null>(
        null,
    )

    // 注册外部导出回调
    const registerExportCallback = useCallback(
        (callback: ((data: string) => void) | null) => {
            externalExportCallbackRef.current = callback
        },
        [],
    )

    const handleExport = () => {
        if (drawioRef.current) {
            // Mark that this export should be saved to history
            expectHistoryExportRef.current = true
            drawioRef.current.exportDiagram({
                format: "xmlsvg",
            })
        }
    }

    const handleExportWithoutHistory = () => {
        if (drawioRef.current) {
            // Export without saving to history (for edit_diagram fetching current state)
            drawioRef.current.exportDiagram({
                format: "xmlsvg",
            })
        }
    }

    const loadDiagram = (
        chart: string,
        skipValidation?: boolean,
    ): string | null => {
        console.time("perf:loadDiagram")
        let xmlToLoad = chart

        // Validate XML structure before loading (unless skipped for internal use)
        if (!skipValidation) {
            console.time("perf:loadDiagram-validation")
            const validation = validateAndFixXml(chart)
            console.timeEnd("perf:loadDiagram-validation")
            if (!validation.valid) {
                console.warn(
                    "[loadDiagram] Validation error:",
                    validation.error,
                )
                console.timeEnd("perf:loadDiagram")
                return validation.error
            }
            // Use fixed XML if auto-fix was applied
            if (validation.fixed) {
                console.log(
                    "[loadDiagram] Auto-fixed XML issues:",
                    validation.fixes,
                )
                xmlToLoad = validation.fixed
            }
        }

        // Keep chartXML in sync even when diagrams are injected (e.g., display_diagram tool)
        setChartXML(xmlToLoad)

        if (drawioRef.current) {
            console.time("perf:drawio-iframe-load")
            drawioRef.current.load({
                xml: xmlToLoad,
            })
            console.timeEnd("perf:drawio-iframe-load")
        }

        console.timeEnd("perf:loadDiagram")
        return null
    }

    const handleDiagramExport = (data: any) => {
        // 首先调用外部回调（useDiagramSave 等）
        if (externalExportCallbackRef.current) {
            externalExportCallbackRef.current(data.data)
        }

        // Handle save to file if requested (process raw data before extraction)
        if (saveResolverRef.current.resolver) {
            const format = saveResolverRef.current.format
            saveResolverRef.current.resolver(data.data)
            saveResolverRef.current = { resolver: null, format: null }
            // For non-xmlsvg formats, skip XML extraction as it will fail
            // Only drawio (which uses xmlsvg internally) has the content attribute
            if (format === "png" || format === "svg") {
                return
            }
        }

        // Check if the data is PNG or SVG (not xmlsvg), skip XML extraction
        // PNG starts with data:image/png
        // SVG starts with <svg or data:image/svg+xml but doesn't have content attribute
        const dataStr = data.data || ""
        if (
            dataStr.startsWith("data:image/png") ||
            (dataStr.startsWith("<svg") && !dataStr.includes("content="))
        ) {
            // This is a raw PNG or SVG export, don't try to extract XML
            console.log(
                "[handleDiagramExport] Skipping XML extraction for raw PNG/SVG export",
            )
            return
        }

        const extractedXML = extractDiagramXML(data.data)
        setChartXML(extractedXML)
        setLatestSvg(data.data)

        // Yjs 协作：推送本地更新到服务器（如果不是远程更新触发的）
        console.log("[handleDiagramExport] Checking if should push to Yjs:", {
            collaborationEnabled,
            collaborationConnected,
            isUpdatingFromRemote: isUpdatingFromRemoteRef.current,
            xmlLength: extractedXML?.length,
        })

        if (
            collaborationEnabled &&
            collaborationConnected &&
            !isUpdatingFromRemoteRef.current
        ) {
            console.log(
                "[DiagramContext] Pushing local update to Yjs, XML length:",
                extractedXML.length,
            )
            pushUpdate(extractedXML)
        } else {
            console.log(
                "[DiagramContext] Skipping Yjs push - collaboration disabled or remote update in progress",
            )
        }

        // Only add to history if this was a user-initiated export
        // Limit to 20 entries to prevent memory leaks during long sessions
        const MAX_HISTORY_SIZE = 20
        if (expectHistoryExportRef.current) {
            setDiagramHistory((prev) => {
                const newHistory = [
                    ...prev,
                    {
                        svg: data.data,
                        xml: extractedXML,
                    },
                ]
                // Keep only the last MAX_HISTORY_SIZE entries (circular buffer)
                return newHistory.slice(-MAX_HISTORY_SIZE)
            })
            expectHistoryExportRef.current = false
        }

        if (resolverRef.current) {
            resolverRef.current(extractedXML)
            resolverRef.current = null
        }
    }

    const clearDiagram = () => {
        const emptyDiagram = `<mxfile><diagram name="Page-1" id="page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`
        // Skip validation for trusted internal template (loadDiagram also sets chartXML)
        loadDiagram(emptyDiagram, true)
        setLatestSvg("")
        setDiagramHistory([])
    }

    const saveDiagramToFile = (
        filename: string,
        format: ExportFormat,
        sessionId?: string,
    ) => {
        if (!drawioRef.current) {
            console.warn("Draw.io editor not ready")
            return
        }

        // Map format to draw.io export format
        const drawioFormat = format === "drawio" ? "xmlsvg" : format

        // Set up the resolver before triggering export
        saveResolverRef.current = {
            resolver: (exportData: string) => {
                let fileContent: string | Blob
                let mimeType: string
                let extension: string

                if (format === "drawio") {
                    // Extract XML from SVG for .drawio format
                    const xml = extractDiagramXML(exportData)
                    let xmlContent = xml
                    if (!xml.includes("<mxfile")) {
                        xmlContent = `<mxfile><diagram name="Page-1" id="page-1">${xml}</diagram></mxfile>`
                    }
                    fileContent = xmlContent
                    mimeType = "application/xml"
                    extension = ".drawio"

                    // Save to localStorage when user manually saves
                    localStorage.setItem(STORAGE_DIAGRAM_XML_KEY, xmlContent)
                } else if (format === "png") {
                    // PNG data comes as base64 data URL
                    fileContent = exportData
                    mimeType = "image/png"
                    extension = ".png"
                } else {
                    // SVG format
                    fileContent = exportData
                    mimeType = "image/svg+xml"
                    extension = ".svg"
                }

                // Log save event to Langfuse (flags the trace)
                logSaveToLangfuse(filename, format, sessionId)

                // Handle download
                let url: string
                if (
                    typeof fileContent === "string" &&
                    fileContent.startsWith("data:")
                ) {
                    // Already a data URL (PNG)
                    url = fileContent
                } else {
                    const blob = new Blob([fileContent], { type: mimeType })
                    url = URL.createObjectURL(blob)
                }

                const a = document.createElement("a")
                a.href = url
                a.download = `${filename}${extension}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)

                // Delay URL revocation to ensure download completes
                if (!url.startsWith("data:")) {
                    setTimeout(() => URL.revokeObjectURL(url), 100)
                }
            },
            format,
        }

        // Export diagram - callback will be handled in handleDiagramExport
        drawioRef.current.exportDiagram({ format: drawioFormat })
    }

    // Log save event to Langfuse (just flags the trace, doesn't send content)
    const logSaveToLangfuse = async (
        filename: string,
        format: string,
        sessionId?: string,
    ) => {
        try {
            await fetch("/api/log-save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename, format, sessionId }),
            })
        } catch (error) {
            console.warn("Failed to log save to Langfuse:", error)
        }
    }

    // 切换协作模式
    const toggleCollaboration = useCallback(
        (enabled: boolean, roomName?: string, isReadOnly?: boolean) => {
            if (enabled && !roomName) {
                console.warn(
                    "[DiagramContext] Cannot enable collaboration without roomName",
                )
                return
            }

            console.log("[DiagramContext] Toggling collaboration:", {
                enabled,
                roomName,
                isReadOnly,
            })
            setCollaborationEnabled(enabled)
            setCollaborationRoomName(roomName || "")
            setCollaborationIsReadOnly(isReadOnly || false)
        },
        [],
    )

    return (
        <DiagramContext.Provider
            value={{
                chartXML,
                latestSvg,
                diagramHistory,
                loadDiagram,
                handleExport,
                handleExportWithoutHistory,
                resolverRef,
                drawioRef,
                handleDiagramExport,
                clearDiagram,
                saveDiagramToFile,
                isDrawioReady,
                onDrawioLoad,
                resetDrawioReady,
                registerExportCallback,
                // Yjs 协作
                collaborationEnabled,
                collaborationConnected,
                collaborationUserCount,
                toggleCollaboration,
            }}
        >
            {children}
        </DiagramContext.Provider>
    )
}

export function useDiagram() {
    const context = useContext(DiagramContext)
    if (context === undefined) {
        throw new Error("useDiagram must be used within a DiagramProvider")
    }
    return context
}
