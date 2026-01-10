"use client"
import { Maximize2, Minimize2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { DrawIoEmbed } from "react-drawio"
import { useSelector } from "react-redux"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { toast } from "sonner"
import { getDiagramVoById } from "@/api/diagramController"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { DiagramToolbar } from "@/components/diagram-toolbar"
import { STORAGE_CLOSE_PROTECTION_KEY } from "@/components/settings-dialog"
import SimpleChatPanel from "@/components/simple-chat-panel"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useDiagram } from "@/contexts/diagram-context"
import { useDiagramSave } from "@/lib/use-diagram-save"
import type { RootState } from "@/stores"

const drawioBaseUrl =
    process.env.NEXT_PUBLIC_DRAWIO_BASE_URL || "https://embed.diagrams.net"

export default function DrawioHome() {
    // 获取路由参数中的图表 ID（保持为字符串以避免精度丢失）
    const params = useParams()
    const diagramId = params.id as string

    // 从 Redux store 中获取登录用户信息
    const loginUser = useSelector((state: RootState) => state.loginUser)
    const userId = loginUser?.id

    const {
        drawioRef,
        handleDiagramExport,
        handleAutoSave,
        onDrawioLoad,
        resetDrawioReady,
        chartXML,
        loadDiagram,
        isDrawioReady,
    } = useDiagram()
    const { saveDiagram, downloadDiagram, handleExportCallback } =
        useDiagramSave(drawioRef)

    const [isMobile, setIsMobile] = useState(false)
    const [isChatVisible, setIsChatVisible] = useState(true)
    const [drawioUi, setDrawioUi] = useState<"min" | "sketch">("min")
    const [darkMode, setDarkMode] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [closeProtection, setCloseProtection] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [diagramTitle, setDiagramTitle] = useState(`图表_${diagramId}`)
    const [currentSpaceId, setCurrentSpaceId] = useState<number | undefined>(undefined) // 当前图表所属的空间ID

    const chatPanelRef = useRef<ImperativePanelHandle>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // 当 diagramId 改变时，重置 DrawIo 状态
    // 这确保了切换图表时能重新触发 onLoad
    useEffect(() => {
        console.log(
            "[编辑页面] diagramId 变化，重置 DrawIo ready 状态:",
            diagramId,
        )
        resetDrawioReady()
    }, [diagramId])

    // 当 diagramId 改变时，从后端加载对应的图表数据
    useEffect(() => {
        const loadDiagramData = async () => {
            if (!diagramId) return

            try {
                console.log("[1/3] 正在从后端获取图表数据，ID:", diagramId)
                const response = await getDiagramVoById({ id: diagramId })

                if (response?.code === 0 && response?.data) {
                    const diagramData = response.data

                    // 保存 spaceId 到状态中
                    if (diagramData.spaceId !== undefined) {
                        console.log("[编辑页面] 当前图表所属空间ID:", diagramData.spaceId)
                        setCurrentSpaceId(diagramData.spaceId)
                    }

                    // 更新图表标题
                    if (diagramData.name) {
                        setDiagramTitle(diagramData.name)
                    }

                    // 确定要加载的图表代码
                    const diagramCode =
                        diagramData.diagramCode ||
                        `<mxfile><diagram name="Page-1" id="page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`

                    if (!diagramData.diagramCode) {
                        console.warn("图表代码为空，将使用空白画布")
                    }

                    console.log(
                        "[2/3] 数据获取成功，检查 DrawIo ref 是否可用...",
                    )
                    console.log("当前状态:", {
                        isDrawioReady,
                        hasRef: !!drawioRef.current,
                    })

                    // 简化逻辑：只要 ref 存在就直接加载，不等待 isDrawioReady
                    // 因为 ref 存在说明 DrawIo 组件已经渲染完成
                    if (!drawioRef.current) {
                        console.warn(
                            "⚠️ DrawIo ref 不存在，等待 500ms 后重试...",
                        )
                        // 如果 ref 不存在，等待一小段时间
                        await new Promise((resolve) => setTimeout(resolve, 500))

                        if (!drawioRef.current) {
                            console.error("❌ DrawIo ref 仍然不存在，跳过加载")
                            toast.error("DrawIo 未就绪，请刷新页面重试")
                            return
                        }
                    }

                    console.log("✅ DrawIo ref 可用，准备加载图表")

                    console.log("[3/3] 正在渲染图表到画布...")
                    console.log(
                        "调用 loadDiagram 前，ref 状态:",
                        !!drawioRef.current,
                    )

                    const error = loadDiagram(diagramCode)

                    if (error) {
                        console.error("加载图表失败:", error)
                        toast.error("加载图表失败: " + error)
                    } else {
                        console.log("✅ 图表加载成功!")
                        toast.success("图表加载成功")
                    }
                } else {
                    console.error("获取图表信息失败:", response?.message)
                    toast.error(
                        "获取图表信息失败: " +
                            (response?.message || "未知错误"),
                    )
                }
            } catch (error) {
                console.error("加载图表数据失败:", error)
                toast.error("加载图表数据失败，请稍后重试")
            }
        }

        loadDiagramData()
    }, [diagramId, isDrawioReady, drawioRef])

    // Load preferences from localStorage after mount
    useEffect(() => {
        const savedUi = localStorage.getItem("drawio-theme")
        if (savedUi === "min" || savedUi === "sketch") {
            setDrawioUi(savedUi)
        }

        const savedDarkMode = localStorage.getItem("next-ai-draw-io-dark-mode")
        if (savedDarkMode !== null) {
            // Use saved preference
            const isDark = savedDarkMode === "true"
            setDarkMode(isDark)
            document.documentElement.classList.toggle("dark", isDark)
        } else {
            // First visit: match browser preference
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches
            setDarkMode(prefersDark)
            document.documentElement.classList.toggle("dark", prefersDark)
        }

        const savedCloseProtection = localStorage.getItem(
            STORAGE_CLOSE_PROTECTION_KEY,
        )
        if (savedCloseProtection === "true") {
            setCloseProtection(true)
        }

        setIsLoaded(true)
    }, [])

    const _toggleDarkMode = () => {
        const newValue = !darkMode
        setDarkMode(newValue)
        localStorage.setItem("next-ai-draw-io-dark-mode", String(newValue))
        document.documentElement.classList.toggle("dark", newValue)
        // Reset so onDrawioLoad fires again after remount
        resetDrawioReady()
    }

    // Check mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const toggleChatPanel = () => {
        const panel = chatPanelRef.current
        if (panel) {
            if (panel.isCollapsed()) {
                panel.expand()
                setIsChatVisible(true)
            } else {
                panel.collapse()
                setIsChatVisible(false)
            }
        }
    }

    // Keyboard shortcut for toggling chat panel
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "b") {
                event.preventDefault()
                toggleChatPanel()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    // Show confirmation dialog when user tries to leave the page
    useEffect(() => {
        if (!closeProtection) return

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            return ""
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [closeProtection])

    // 全屏功能
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current
                ?.requestFullscreen()
                .then(() => {
                    setIsFullscreen(true)
                })
                .catch((err) => {
                    console.error("全屏失败:", err)
                })
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false)
            })
        }
    }

    // 保存图表
    const handleSave = async () => {
        if (!chartXML) {
            console.error("没有可保存的图表内容")
            return false
        }

        // 检查用户是否登录（通过检查 userRole 或 id）
        const isLogin = userId && loginUser?.userRole !== "notLogin"
        if (!isLogin) {
            console.error("用户未登录", {
                userId,
                userRole: loginUser?.userRole,
            })
            toast.error("请先登录后再保存图表")
            return false
        }

        return await saveDiagram({
            diagramId: diagramId,
            userId: userId,
            title: diagramTitle,
            xml: chartXML,
        })
    }

    // 覆盖 handleDiagramExport，同时调用原始的和我们新的回调
    const handleExport = (data: any) => {
        handleDiagramExport(data) // 原始处理（更新 chartXML）
        // 检查是否是导出操作，如果是则调用 handleExportCallback
        if (data?.data) {
            handleExportCallback(data.data)
        }
    }

    // 监听全屏状态变化
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            )
        }
    }, [])

    return (
        <div className="flex-1 w-full h-full p-3 relative overflow-hidden">
            <div
                ref={containerRef}
                className={`w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
                    isFullscreen
                        ? "rounded-none fixed inset-0 z-50"
                        : "rounded-2xl"
                }`}
            >
                {/* 工具栏 - 分散布局避免堆叠 */}
                <div className="absolute top-5 right-5 z-20 flex items-center justify-between gap-8">
                    {/* 协作面板 - 独立放在左侧 */}
                    <div className="flex-shrink-0">
                        <CollaborationPanel spaceId={currentSpaceId} />
                    </div>

                    {/* 右侧按钮组 */}
                    <div className="flex items-center gap-4">
                        {/* 保存按钮组 */}
                        <div className="flex items-center gap-3">
                            <DiagramToolbar
                                diagramId={diagramId}
                                title={diagramTitle}
                                xml={chartXML}
                                onSave={handleSave}
                            />
                        </div>

                        {/* 分隔线 */}
                        <div className="h-8 w-px bg-white/40"></div>

                        {/* 全屏按钮 */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-3 rounded-xl bg-white/95 hover:bg-white text-gray-800 border border-gray-300 hover:border-gray-400 shadow-md transition-all duration-200 hover:scale-105"
                            title={isFullscreen ? "退出全屏 (ESC)" : "全屏模式"}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-6 w-6" />
                            ) : (
                                <Maximize2 className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
                <ResizablePanelGroup
                    id="main-panel-group"
                    direction={isMobile ? "vertical" : "horizontal"}
                    className="w-full h-full overflow-hidden"
                >
                    {/* Draw.io Canvas */}
                    <ResizablePanel
                        id="drawio-panel"
                        defaultSize={isMobile ? 50 : 67}
                        minSize={20}
                    >
                        <div className="w-full h-full relative bg-white rounded-l-2xl overflow-hidden">
                            {isLoaded ? (
                                <DrawIoEmbed
                                    key={`${drawioUi}-${darkMode}`}
                                    ref={drawioRef}
                                    onExport={handleExport}
                                    onLoad={onDrawioLoad}
                                    onAutoSave={handleAutoSave}
                                    autosave={true}
                                    baseUrl={drawioBaseUrl}
                                    urlParameters={{
                                        ui: drawioUi,
                                        spin: true,
                                        libraries: false,
                                        saveAndExit: false,
                                        noExitBtn: true,
                                        dark: darkMode,
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                    </ResizablePanel>

                    <ResizableHandle
                        withHandle
                        className="bg-white/10 hover:bg-white/20 transition-colors"
                    />

                    {/* Chat Panel */}
                    <ResizablePanel
                        id="chat-panel"
                        ref={chatPanelRef}
                        defaultSize={isMobile ? 50 : 33}
                        minSize={isMobile ? 20 : 15}
                        maxSize={isMobile ? 80 : 50}
                        collapsible={!isMobile}
                        collapsedSize={isMobile ? 0 : 3}
                        onCollapse={() => setIsChatVisible(false)}
                        onExpand={() => setIsChatVisible(true)}
                        className="overflow-hidden"
                    >
                        <div className="h-full w-full overflow-hidden">
                            <SimpleChatPanel
                                diagramId={diagramId}
                                isVisible={isChatVisible}
                                onToggleVisibility={toggleChatPanel}
                                darkMode={darkMode}
                                diagramTitle={diagramTitle}
                            />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
