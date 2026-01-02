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
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import { listDiagramChatHistory } from "@/api/conversionController"
import type { API } from "@/api/typings"
import {
    type AIConfig,
    AIConfigDialog,
    useAIConfig,
} from "@/components/ai-config-dialog"
import { CodeBlock } from "@/components/code-block"
import { DownloadDialog } from "@/components/download-dialog"
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
import "highlight.js/styles/github-dark.css"

interface SimpleChatPanelProps {
    diagramId: string
    isVisible: boolean
    onToggleVisibility: () => void
    darkMode: boolean
    diagramTitle: string
    onDownload?: (format: "xml" | "png" | "svg") => Promise<void>
}

export default function SimpleChatPanel({
    diagramId,
    isVisible,
    onToggleVisibility,
    darkMode,
    diagramTitle,
    onDownload,
}: SimpleChatPanelProps) {
    const [input, setInput] = useState("")
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const [configDialogOpen, setConfigDialogOpen] = useState(false)
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)

    // 控制保存按钮的 Loading 状态
    const [isSaving, setIsSaving] = useState(false)

    const [aiConfig, setAiConfig] = useAIConfig()
    const { loadDiagram, drawioRef, chartXML } = useDiagram()
    const { saveDiagram: saveDiagramToServer } = useDiagramSave(drawioRef)
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

    // 加载历史对话记录
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
                        .map((conv: API.Conversion) => ({
                            id: `history-${conv.id}`,
                            role:
                                conv.messageType === "user"
                                    ? "user"
                                    : "assistant",
                            content: conv.message || "",
                            timestamp: new Date(conv.createTime || 0).getTime(),
                        }))

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
    }, [diagramId, historyLoaded, setMessages])

    // 自动滚动到底部
    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
        return () => clearTimeout(timer)
    }, [messages])

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

    // --- 核心修复：保存图表逻辑 ---
    const handleSaveDiagram = async () => {
        // 1. 基础校验
        if (!chartXML) {
            toast.error("图表内容为空")
            return
        }

        // 2. 防止重复点击
        if (isSaving) return

        // 3. 登录校验
        const isLogin = loginUser?.id && loginUser?.userRole !== "notLogin"
        if (!isLogin) {
            toast.error("请先登录后再保存图表")
            return
        }

        // 4. 开启 Loading
        setIsSaving(true)

        try {
            // 5. 构造一个超时 Promise (15秒超时)
            // 如果后端或者 Draw.io 卡死，这个 Promise 会强制 reject，终止死循环
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("保存请求超时，请检查网络或重试")),
                    15000,
                ),
            )

            // 6. 使用 Promise.race 竞速：保存逻辑 vs 超时计时器
            await Promise.race([
                saveDiagramToServer({
                    diagramId: diagramId,
                    userId: loginUser.id,
                    title: diagramTitle,
                    xml: chartXML,
                }),
                timeoutPromise,
            ])

            // 注意：成功的 Toast 已经在 useDiagramSave 内部处理了
        } catch (error) {
            console.error("保存图表异常:", error)
            // 如果是超时错误，在这里给用户提示
            toast.error(
                error instanceof Error ? error.message : "保存失败，请稍后重试",
            )
        } finally {
            // 7. 无论成功还是失败，延时 1 秒后强制恢复按钮状态
            // 这样能确保按钮永远不会“一直转圈”
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
            {/* --- 顶部工具栏 --- */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 z-10">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <h2 className="text-base font-semibold text-white whitespace-nowrap">
                        AI 对话
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSaveDiagram}
                        // 禁用条件：正在保存中 OR 图表为空
                        disabled={isSaving || !chartXML}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 border 
                            ${
                                isSaving || !chartXML
                                    ? "bg-gray-500/10 text-gray-500 border-transparent cursor-not-allowed opacity-50"
                                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30"
                            }`}
                        title={isSaving ? "正在保存..." : "保存图表"}
                    >
                        {/* Loading 动画图标 */}
                        {isSaving ? (
                            <span className="animate-spin h-4 w-4 block border-2 border-current border-t-transparent rounded-full text-blue-400" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                    </button>

                    <button
                        onClick={() => setConfigDialogOpen(true)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
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
                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 hover:scale-110"
                        title="下载图表"
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    <button
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="清空对话"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="w-px h-4 bg-white/10 mx-1"></div>

                    <button
                        onClick={onToggleVisibility}
                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 hover:scale-110"
                        title="隐藏面板"
                    >
                        <Square className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* --- 消息列表容器 --- */}
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
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[
                                                        rehypeHighlight,
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
                                                                    {children}
                                                                </code>
                                                            )
                                                        },
                                                        p: ({ children }) => (
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
                                                    {message.content}
                                                </ReactMarkdown>
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

            {/* --- 底部输入框 --- */}
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

            {onDownload && (
                <DownloadDialog
                    open={downloadDialogOpen}
                    onOpenChange={setDownloadDialogOpen}
                    onDownload={onDownload}
                    defaultFilename={diagramTitle}
                />
            )}
        </div>
    )
}
