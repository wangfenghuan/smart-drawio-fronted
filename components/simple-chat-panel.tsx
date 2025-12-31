"use client"

import {
    ChevronDown,
    ChevronRight,
    Code,
    Download,
    MessageSquare,
    Send,
    Settings,
    Square,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
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
import { parseXmlAndLoadDiagram } from "@/lib/utils"
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
    const [aiConfig, setAiConfig] = useAIConfig()
    const { loadDiagram } = useDiagram()
    const messagesEndRef = useRef<HTMLDivElement>(null)

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
            // 消息完成后，尝试解析 XML 并加载图表
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
                console.log(
                    "[SimpleChatPanel] Loading history for diagram:",
                    diagramId,
                )
                const response = await listDiagramChatHistory({
                    diagramId: diagramId,
                    pageSize: "100",
                })

                if (response?.code === 0 && response?.data?.records) {
                    const conversions = response.data.records
                    console.log(
                        "[SimpleChatPanel] Loaded",
                        conversions.length,
                        "history records",
                    )

                    // 转换为前端消息格式
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
                        console.log(
                            "[SimpleChatPanel] Restored",
                            historyMessages.length,
                            "messages",
                        )
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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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

    // 简化的折叠视图
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
        <div className="h-full w-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 rounded-r-2xl overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <h2 className="text-base font-semibold text-white">
                        AI 对话
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setConfigDialogOpen(true)}
                        className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                            aiConfig.mode === "custom"
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                                : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                        }`}
                        title={
                            aiConfig.mode === "custom"
                                ? "自定义AI已配置"
                                : "配置AI模型"
                        }
                    >
                        <Settings className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => setDownloadDialogOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 transition-all duration-200 hover:scale-105"
                        title="下载图表"
                    >
                        <Download className="h-5 w-5" />
                        <span className="text-sm font-medium">下载</span>
                    </button>

                    <Button
                        size="sm"
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                        className="h-10 px-5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-sm font-medium"
                    >
                        清空
                    </Button>

                    <button
                        onClick={onToggleVisibility}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/20 transition-all duration-200 hover:scale-105"
                        title="隐藏聊天面板"
                    >
                        <Square className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* 消息列表 - 固定高度的可滚动区域 */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-transparent to-black/20 scrollbar-thin">
                <div className="p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
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
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-xl px-4 py-3 shadow-lg ${
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
                                                                className || "",
                                                            )
                                                        const language = match
                                                            ? match[1]
                                                            : "text"

                                                        // 代码块（非行内）
                                                        if (!inline && match) {
                                                            const codeContent =
                                                                String(
                                                                    children,
                                                                ).replace(
                                                                    /\n$/,
                                                                    "",
                                                                )
                                                            const isLongCode =
                                                                codeContent.length >
                                                                500 // 超过500字符认为是长代码
                                                            const previewLines =
                                                                codeContent
                                                                    .split("\n")
                                                                    .slice(0, 3)
                                                                    .join("\n") // 预览前3行
                                                            const remainingLines =
                                                                codeContent.split(
                                                                    "\n",
                                                                ).length - 3

                                                            return (
                                                                <Collapsible
                                                                    defaultOpen={
                                                                        !isLongCode
                                                                    }
                                                                >
                                                                    <div className="my-2 rounded-lg overflow-hidden border border-white/10 bg-black/30">
                                                                        {/* 代码块头部 */}
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
                                                                                        字符,{" "}
                                                                                        {remainingLines >
                                                                                        0
                                                                                            ? `${remainingLines}+ 行`
                                                                                            : "全部内容"}
                                                                                        )
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {isLongCode && (
                                                                                <div className="flex items-center gap-1 text-white/60">
                                                                                    <span className="text-xs">
                                                                                        点击展开
                                                                                    </span>
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                                </div>
                                                                            )}
                                                                        </CollapsibleTrigger>

                                                                        {/* 代码内容 */}
                                                                        <CollapsibleContent>
                                                                            <div className="max-h-[300px] overflow-y-auto">
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

                                                                        {/* 预览提示（当代码折叠时显示） */}
                                                                        {isLongCode && (
                                                                            <div className="px-3 py-2 bg-black/20 border-t border-white/5 text-xs text-white/50 italic">
                                                                                <CollapsibleTrigger className="w-full text-center hover:text-white/70 transition-colors cursor-pointer">
                                                                                    点击展开查看完整代码...
                                                                                </CollapsibleTrigger>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </Collapsible>
                                                            )
                                                        }

                                                        // 行内代码
                                                        return (
                                                            <code
                                                                className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 text-sm"
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        )
                                                    },
                                                    h1: ({ children }) => (
                                                        <h1 className="text-xl font-bold mt-4 mb-2 text-white">
                                                            {children}
                                                        </h1>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h2 className="text-lg font-bold mt-3 mb-2 text-white">
                                                            {children}
                                                        </h2>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="text-base font-bold mt-2 mb-1 text-white">
                                                            {children}
                                                        </h3>
                                                    ),
                                                    p: ({ children }) => (
                                                        <p className="mb-2 text-white/90">
                                                            {children}
                                                        </p>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="list-disc list-inside mb-2 text-white/90">
                                                            {children}
                                                        </ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="list-decimal list-inside mb-2 text-white/90">
                                                            {children}
                                                        </ol>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="mb-1">
                                                            {children}
                                                        </li>
                                                    ),
                                                    blockquote: ({
                                                        children,
                                                    }) => (
                                                        <blockquote className="border-l-4 border-blue-400 pl-4 my-2 text-white/80 italic">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    a: ({ href, children }) => (
                                                        <a
                                                            href={href}
                                                            className="text-blue-400 hover:text-blue-300 underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {children}
                                                        </a>
                                                    ),
                                                    table: ({ children }) => (
                                                        <div className="overflow-x-auto my-2">
                                                            <table className="min-w-full border border-white/20">
                                                                {children}
                                                            </table>
                                                        </div>
                                                    ),
                                                    thead: ({ children }) => (
                                                        <thead className="bg-white/10">
                                                            {children}
                                                        </thead>
                                                    ),
                                                    th: ({ children }) => (
                                                        <th className="border border-white/20 px-3 py-1 text-left text-white">
                                                            {children}
                                                        </th>
                                                    ),
                                                    td: ({ children }) => (
                                                        <td className="border border-white/20 px-3 py-1 text-white/90">
                                                            {children}
                                                        </td>
                                                    ),
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <span className="text-white/40 italic">
                                                正在生成...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {error && (
                        <div className="bg-red-500/20 backdrop-blur-sm text-red-200 border border-red-500/30 p-4 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Square className="h-4 w-4" />
                                <span className="font-medium text-sm">
                                    错误
                                </span>
                            </div>
                            <p className="text-sm mt-1">{error.message}</p>
                        </div>
                    )}

                    {/* 用于自动滚动的锚点 */}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* 输入框 */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex-shrink-0">
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

            {/* AI 配置对话框 */}
            <AIConfigDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                config={aiConfig}
                onConfigChange={setAiConfig}
            />

            {/* 下载对话框 */}
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
