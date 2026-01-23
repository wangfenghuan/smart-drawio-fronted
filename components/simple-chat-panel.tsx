"use client"

import {
    ChevronDown,
    Code,
    Download,
    MessageSquare,
    Save,
    Send,
    Settings,
    Square,
    Trash2,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useSelector } from "react-redux"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import { listDiagramChatHistory } from "@/api/conversionController"
import type { API } from "@/api/typings"
import { AIConfigDialog, useAIConfig } from "@/components/ai-config-dialog"
import { CodeBlock } from "@/components/code-block"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { DownloadDialog } from "@/components/download-dialog"
import { removeThinkingTags, ThinkingBlock } from "@/components/thinking-block"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useDiagram } from "@/contexts/diagram-context"
import { type Message, useBackendChat } from "@/lib/use-backend-chat"
import { useDiagramSave } from "@/lib/use-diagram-save"
import { parseXmlAndLoadDiagram } from "@/lib/utils"
import type { RootState } from "@/stores"

interface SimpleChatPanelProps {
    diagramId: string
    isVisible: boolean
    onToggleVisibility: () => void
    darkMode: boolean
    diagramTitle: string
    spaceId?: number
}

export default function SimpleChatPanel({
    diagramId,
    isVisible,
    onToggleVisibility,
    darkMode,
    diagramTitle,
    spaceId,
}: SimpleChatPanelProps) {
    const [input, setInput] = useState("")
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const [configDialogOpen, setConfigDialogOpen] = useState(false)
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const [aiConfig, setAiConfig] = useAIConfig()
    const {
        loadDiagram,
        drawioRef,
        chartXML,
        registerExportCallback,
        handleExportWithoutHistory,
        resolverRef,
    } = useDiagram()
    const {
        saveDiagram: saveDiagramToServer,
        handleExportCallback,
        downloadDiagram,
    } = useDiagramSave(drawioRef)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const loginUser = useSelector((state: RootState) => state.loginUser)

    const {
        messages,
        sendMessage,
        stop,
        clearMessages,
        isLoading,
        error,
        setMessages,
    } = useBackendChat({
        diagramId,
        aiConfig,
        onMessageComplete: (fullContent) => {
            try {
                parseXmlAndLoadDiagram(fullContent, loadDiagram)
            } catch (err) {
                console.error("Failed to parse diagram XML:", err)
            }
        },
        onError: (err) => {
            console.error("Chat error:", err)
        },
    })

    // 加载历史记录
    useEffect(() => {
        const loadHistory = async () => {
            if (!diagramId || historyLoaded) return
            try {
                const response = await listDiagramChatHistory({
                    diagramId: diagramId,
                    pageSize: "100",
                })
                if (response?.code === 0 && response?.data?.records) {
                    const conversions = response.data.records
                    const historyMessages: Message[] = conversions
                        .filter((conv: API.Conversion) => !conv.isDelete)
                        .sort(
                            (a: API.Conversion, b: API.Conversion) =>
                                new Date(a.createTime || 0).getTime() -
                                new Date(b.createTime || 0).getTime(),
                        )
                        .map((conv: API.Conversion) => {
                            let content = conv.message || ""
                            // 修复：如果消息包含"图表已生成"标记，但缺少XML代码块，则尝试补充
                            if (
                                conv.messageType !== "user" &&
                                (content.includes("✅ 图表已生成") ||
                                    content.includes("图表已生成")) &&
                                !content.includes("```xml") &&
                                chartXML
                            ) {
                                // 从当前图表XML中提取内容
                                const mxfileMatch = chartXML.match(
                                    /<mxfile[\s\S]*?<\/mxfile>/,
                                )
                                if (mxfileMatch) {
                                    // 将XML代码块添加到消息内容中
                                    content = content.replace(
                                        /✅ 图表已生成|图表已生成/g,
                                        `\`\`\`xml\n${mxfileMatch[0]}\n\`\`\`\n\n✅ 图表已生成`,
                                    )
                                }
                            }
                            return {
                                id: `history-${conv.id}`,
                                role:
                                    conv.messageType === "user"
                                        ? "user"
                                        : "assistant",
                                content: content,
                                timestamp: new Date(
                                    conv.createTime || 0,
                                ).getTime(),
                            }
                        })

                    if (historyMessages.length > 0) {
                        setMessages(historyMessages)
                    }
                }
            } catch (err) {
                console.error("[SimpleChatPanel] Failed to load history:", err)
            } finally {
                setHistoryLoaded(true)
            }
        }
        loadHistory()
    }, [diagramId, historyLoaded, setMessages, chartXML])

    // 自动滚动
    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
        return () => clearTimeout(timer)
    }, [messages])

    // 这样 handleDiagramExport 才能调用 handleExportCallback，从而 resolve exportDiagram 的 Promise
    useEffect(() => {
        registerExportCallback(handleExportCallback)
        return () => {
            registerExportCallback(null) // 清理回调
        }
    }, [registerExportCallback, handleExportCallback])

    // 下载处理函数
    const handleDownload = async (format: "xml" | "png" | "svg") => {
        try {
            await downloadDiagram({
                diagramId: diagramId,
                filename: diagramTitle || "diagram",
                format: format.toUpperCase() as "PNG" | "SVG" | "XML",
            })
        } catch (error) {
            console.error("下载失败:", error)
            toast.error(
                error instanceof Error ? error.message : "下载失败，请稍后重试",
            )
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        const userMessage = input.trim()
        setInput("")
        await sendMessage(userMessage)
    }

    const handleClearChat = () => {
        clearMessages()
    }

    // --- 修复后的保存逻辑 ---
    const handleSaveDiagram = async () => {
        if (isSaving) return

        const isLogin = loginUser?.id && loginUser?.userRole !== "notLogin"
        if (!isLogin) {
            toast.error("请先登录后再保存图表")
            return
        }

        setIsSaving(true)

        try {
            // 🔧 关键修复：先导出最新的 XML，而不是使用缓存的 chartXML
            // 这样才能获取 Draw.io 中的最新修改
            toast.loading("正在获取最新图表数据...", { id: "save-diagram" })

            const latestXML = await Promise.race([
                new Promise<string>((resolve) => {
                    // 设置 resolver 来接收导出结果
                    if (resolverRef && "current" in resolverRef) {
                        resolverRef.current = resolve
                    }
                    // 触发导出（不保存到历史记录）
                    handleExportWithoutHistory()
                }),
                new Promise<string>((_, reject) =>
                    setTimeout(
                        () => reject(new Error("导出超时（10秒）")),
                        10000,
                    ),
                ),
            ])

            console.log(
                "[handleSaveDiagram] 获取到最新 XML:",
                latestXML?.substring(0, 100),
            )

            // 构造超时 Promise (15秒)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("保存请求超时，请检查网络"))
                }, 15000)
            })

            // 竞速：保存逻辑 vs 超时
            await Promise.race([
                saveDiagramToServer({
                    diagramId: diagramId,
                    userId: loginUser.id,
                    title: diagramTitle,
                    xml: latestXML, // ✅ 使用最新导出的 XML
                }),
                timeoutPromise,
            ])

            toast.success("保存成功")
        } catch (error) {
            console.error("保存图表异常:", error)
            toast.error(
                error instanceof Error ? error.message : "保存失败，请稍后重试",
            )
        } finally {
            // 无论成功失败，1秒后恢复按钮
            setTimeout(() => {
                setIsSaving(false)
            }, 1000)
        }
    }

    if (!isVisible) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border-l border-white/10">
                <button
                    onClick={onToggleVisibility}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
                    title="显示聊天面板"
                >
                    <MessageSquare className="h-5 w-5 text-white" />
                </button>
                <div className="text-xs text-white/70 mt-2 font-medium">AI</div>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 rounded-r-2xl overflow-hidden relative">
            {/* 顶部工具栏 */}
            <div className="flex-shrink-0 flex items-center justify-between px-2 py-3 border-b border-white/10 bg-black/20 z-10">
                <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                    <MessageSquare className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <h2 className="text-sm font-semibold text-white whitespace-nowrap">
                        AI 对话
                    </h2>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <CollaborationPanel spaceId={spaceId} />

                    <button
                        onClick={handleSaveDiagram}
                        disabled={isSaving || !chartXML}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 border flex-shrink-0
                            ${
                                isSaving || !chartXML
                                    ? "bg-gray-500/10 text-gray-500 border-transparent cursor-not-allowed opacity-50"
                                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30"
                            }`}
                        title={isSaving ? "正在保存..." : "保存图表"}
                    >
                        {isSaving ? (
                            <span className="animate-spin h-4 w-4 block border-2 border-current border-t-transparent rounded-full text-blue-400" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                    </button>

                    <button
                        onClick={() => setConfigDialogOpen(true)}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                            aiConfig.mode === "custom"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                        }`}
                        title={
                            aiConfig.mode === "custom"
                                ? "自定义AI已配置"
                                : "配置AI模型"
                        }
                    >
                        <Settings className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => setDownloadDialogOpen(true)}
                        className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="下载图表"
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    <button
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                        className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        title="清空对话"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="w-px h-5 bg-white/10 flex-shrink-0"></div>

                    <button
                        onClick={onToggleVisibility}
                        className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="隐藏面板"
                    >
                        <Square className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 relative min-h-0 w-full">
                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-transparent to-black/20 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <div className="p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full pt-20">
                                <div className="text-center">
                                    <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-3" />
                                    <p className="text-white/60 text-sm">
                                        开始与 AI 对话来生成图表
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[90%] rounded-xl px-4 py-3 shadow-lg ${
                                            message.role === "user"
                                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                                : "bg-white/10 backdrop-blur-sm text-white border border-white/10"
                                        }`}
                                    >
                                        <div className="text-xs font-medium mb-1.5 opacity-70">
                                            {message.role === "user"
                                                ? "你"
                                                : "AI 助手"}
                                        </div>
                                        <div className="text-sm leading-relaxed markdown-content">
                                            {message.content ? (
                                                <>
                                                    {/* 渲染深度思考模块 */}
                                                    <ThinkingBlock
                                                        content={
                                                            message.content
                                                        }
                                                        defaultOpen={false}
                                                    />
                                                    {/* 渲染主要消息内容（移除思考标签后的内容） */}
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                        ]}
                                                        components={{
                                                            code({
                                                                node,
                                                                inline,
                                                                className,
                                                                children,
                                                                ...props
                                                            }) {
                                                                const match =
                                                                    /language-(\w+)/.exec(
                                                                        className ||
                                                                            "",
                                                                    )
                                                                const language =
                                                                    match
                                                                        ? match[1]
                                                                        : "text"
                                                                if (
                                                                    !inline &&
                                                                    match
                                                                ) {
                                                                    const codeContent =
                                                                        String(
                                                                            children,
                                                                        ).replace(
                                                                            /\n$/,
                                                                            "",
                                                                        )
                                                                    const isLongCode =
                                                                        codeContent.length >
                                                                        500
                                                                    return (
                                                                        <Collapsible
                                                                            defaultOpen={
                                                                                !isLongCode
                                                                            }
                                                                        >
                                                                            <div className="my-2 rounded-lg overflow-hidden border border-white/10 bg-black/30">
                                                                                <CollapsibleTrigger className="w-full px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center justify-between hover:bg-black/50 transition-colors">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Code className="h-3.5 w-3.5 text-blue-400" />
                                                                                        <span className="text-xs text-white/60 font-mono">
                                                                                            {
                                                                                                language
                                                                                            }
                                                                                        </span>
                                                                                        {isLongCode && (
                                                                                            <span className="text-xs text-white/40">
                                                                                                (
                                                                                                {
                                                                                                    codeContent.length
                                                                                                }{" "}
                                                                                                字符)
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {isLongCode && (
                                                                                        <div className="flex items-center gap-1 text-white/60">
                                                                                            <ChevronDown className="h-4 w-4" />
                                                                                        </div>
                                                                                    )}
                                                                                </CollapsibleTrigger>
                                                                                <CollapsibleContent>
                                                                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                                                        <CodeBlock
                                                                                            code={
                                                                                                codeContent
                                                                                            }
                                                                                            language={
                                                                                                language as
                                                                                                    | "xml"
                                                                                                    | "json"
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                </CollapsibleContent>
                                                                            </div>
                                                                        </Collapsible>
                                                                    )
                                                                }
                                                                return (
                                                                    <code
                                                                        className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 text-sm break-all"
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </code>
                                                                )
                                                            },
                                                            p: ({
                                                                children,
                                                            }) => (
                                                                <p className="mb-2 text-white/90 break-words">
                                                                    {children}
                                                                </p>
                                                            ),
                                                            a: ({
                                                                href,
                                                                children,
                                                            }) => (
                                                                <a
                                                                    href={href}
                                                                    className="text-blue-400 hover:text-blue-300 underline"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {children}
                                                                </a>
                                                            ),
                                                        }}
                                                    >
                                                        {removeThinkingTags(
                                                            message.content,
                                                        )}
                                                    </ReactMarkdown>
                                                </>
                                            ) : (
                                                <span className="text-white/40 italic flex items-center gap-1">
                                                    <span className="animate-pulse">
                                                        ●
                                                    </span>
                                                    <span className="animate-pulse delay-75">
                                                        ●
                                                    </span>
                                                    <span className="animate-pulse delay-150">
                                                        ●
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {error && (
                            <div className="bg-red-500/20 backdrop-blur-sm text-red-200 border border-red-500/30 p-4 rounded-xl">
                                <p className="text-sm">{error.message}</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>
                </div>
            </div>

            {/* 底部输入框 */}
            <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20 z-10">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="输入你的问题..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 text-sm"
                    />
                    {isLoading ? (
                        <Button
                            type="button"
                            onClick={stop}
                            className="px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                            <Square className="h-4 w-4 mr-2" />
                            停止
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={!input.trim()}
                            className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg font-semibold"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            发送
                        </Button>
                    )}
                </form>
            </div>

            <AIConfigDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                config={aiConfig}
                onConfigChange={setAiConfig}
            />

            <DownloadDialog
                open={downloadDialogOpen}
                onOpenChange={setDownloadDialogOpen}
                onDownload={handleDownload}
                defaultFilename={diagramTitle}
            />
        </div>
    )
}
