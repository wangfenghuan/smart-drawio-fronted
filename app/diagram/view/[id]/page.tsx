"use client"

import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { DrawIoEmbed } from "react-drawio"
import { toast } from "sonner"
import { getDiagramVoById } from "@/api/diagramController"

const drawioBaseUrl =
    process.env.NEXT_PUBLIC_DRAWIO_BASE_URL || "https://embed.diagrams.net"

export default function DiagramViewPage() {
    const params = useParams()
    const router = useRouter()
    const diagramId = params.id as string

    const drawioRef = useRef<any>(null)
    const [isDrawioReady, setIsDrawioReady] = useState(false)
    const [diagramTitle, setDiagramTitle] = useState(`图表_${diagramId}`)
    const [loading, setLoading] = useState(true)
    const [diagramData, setDiagramData] = useState<API.DiagramVO | null>(null)
    const [isLoaded, setIsLoaded] = useState(true) // 直接设置为 true，不需要等待
    const dataLoadedRef = useRef(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // 当 diagramId 改变时，从后端加载对应的图表数据
    useEffect(() => {
        const loadDiagramData = async () => {
            if (!diagramId || !isDrawioReady || dataLoadedRef.current) return

            try {
                console.log("正在加载图表，ID:", diagramId)
                const response = await getDiagramVoById({ id: diagramId })

                if (response?.code === 0 && response?.data) {
                    const data = response.data
                    setDiagramData(data)

                    // 更新图表标题
                    if (data.name) {
                        setDiagramTitle(data.name)
                    }

                    // 如果有图表代码，渲染到画布上
                    if (data.diagramCode && drawioRef.current) {
                        console.log("正在渲染图表代码到画布...")
                        drawioRef.current.loadDiagram(data.diagramCode, false)
                        toast.success("图表加载成功")
                    } else {
                        console.warn("图表代码为空")
                        toast.warning("该图表暂无内容")
                    }
                } else {
                    console.error("获取图表信息失败:", response?.message)
                    toast.error("获取图表信息失败: " + (response?.message || "未知错误"))
                }
            } catch (error) {
                console.error("加载图表失败:", error)
                toast.error("加载图表失败，请稍后重试")
            } finally {
                setLoading(false)
                dataLoadedRef.current = true
            }
        }

        loadDiagramData()
    }, [diagramId, isDrawioReady])

    const handleDrawioLoad = () => {
        console.log("DrawIO 已加载")
        setIsDrawioReady(true)
    }

    const handleBack = () => {
        router.back()
    }

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

    // 监听全屏状态变化
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
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
                {/* 工具栏 */}
                <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
                    {/* 左侧：返回按钮和标题 */}
                    <div className="flex items-center gap-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBack}
                            type="text"
                            size="large"
                        >
                            返回
                        </Button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div>
                            <div className="text-sm font-semibold text-gray-800">
                                {diagramTitle}
                            </div>
                            {diagramData?.userVO && (
                                <div className="text-xs text-gray-500">
                                    创建者: {diagramData.userVO.userName || "未知"}
                                </div>
                            )}
                        </div>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                            <EyeOutlined />
                            只读模式
                        </div>
                    </div>

                    {/* 右侧：全屏按钮 */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 rounded-xl bg-white/95 hover:bg-white text-gray-800 border border-gray-300 hover:border-gray-400 shadow-md transition-all duration-200 hover:scale-105"
                        title="全屏模式"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isFullscreen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* DrawIO 画布 */}
                <div className="w-full h-full relative bg-white rounded-2xl overflow-hidden mt-20">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                            <div className="text-center">
                                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <div className="text-gray-600">加载中...</div>
                            </div>
                        </div>
                    )}
                    {isLoaded ? (
                        <DrawIoEmbed
                            key={`readonly-${diagramId}`}
                            ref={drawioRef}
                            onLoad={handleDrawioLoad}
                            baseUrl={drawioBaseUrl}
                            urlParameters={{
                                ui: "min",
                                spin: true,
                                libraries: false,
                                saveAndExit: false,
                                noExitBtn: true,
                                // 只读模式 - 禁用所有编辑功能
                                locked: true,
                                noSaveBtn: true,
                                noDraftBtn: true,
                                editable: false,
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
