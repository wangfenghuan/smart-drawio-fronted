import { useCallback, useRef, useState } from "react"

// 强制指向线上 47.95.35.178
const API_BASE_URL = "http://47.95.35.178:8081/api"

export interface Message {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp?: number
}

export interface AIConfig {
    mode: "system" | "custom"
    modelId?: string
    baseUrl?: string
    apiKey?: string
}

export interface UseBackendChatOptions {
    diagramId: string
    aiConfig?: AIConfig
    onMessageComplete?: (message: string) => void
    onError?: (error: Error) => void
}

export function useBackendChat({
    diagramId,
    aiConfig,
    onMessageComplete,
    onError,
}: UseBackendChatOptions) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return

            // 添加用户消息
            const userMessage: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                content: content.trim(),
                timestamp: Date.now(),
            }

            setMessages((prev) => [...prev, userMessage])
            setIsLoading(true)
            setError(null)

            // 创建 AI 助手消息占位符
            const assistantMessageId = `assistant-${Date.now()}`
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: "assistant",
                    content: "",
                    timestamp: Date.now(),
                },
            ])

            // 创建 AbortController 用于取消请求
            const abortController = new AbortController()
            abortControllerRef.current = abortController

            // 在 try 块外定义，这样 catch 块也能访问
            let fullContent = ""

            try {
                // 根据 aiConfig 选择 API 端点和请求体
                const isCustomMode = aiConfig?.mode === "custom"
                const endpoint = isCustomMode
                    ? `${API_BASE_URL}/chat/custom/stream`
                    : `${API_BASE_URL}/chat/stream`

                // 构建请求体
                const requestBody: {
                    message: string
                    diagramId: string
                    modelId?: string
                    baseUrl?: string
                    apiKey?: string
                } = {
                    message: content.trim(),
                    diagramId: diagramId,
                }

                // 如果是自定义模式，添加自定义配置
                if (isCustomMode && aiConfig) {
                    requestBody.modelId = aiConfig.modelId
                    requestBody.baseUrl = aiConfig.baseUrl
                    requestBody.apiKey = aiConfig.apiKey
                }

                console.log(
                    `[useBackendChat] Using ${isCustomMode ? "custom" : "system"} AI mode`,
                    isCustomMode ? { modelId: aiConfig?.modelId } : {},
                )

                // 使用原生 fetch API 调用后端 SSE 接口
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    signal: abortController.signal,
                    credentials: "include", // 携带 cookie
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                // 处理 SSE 流
                const reader = response.body?.getReader()
                const decoder = new TextDecoder()

                if (!reader) {
                    throw new Error("Response body is null")
                }

                fullContent = "" // 初始化为空字符串
                let buffer = "" // 用于缓存不完整的数据块

                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        setIsLoading(false)
                        onMessageComplete?.(fullContent)
                        break
                    }

                    // 解码数据块
                    const chunk = decoder.decode(value, { stream: true })
                    buffer += chunk

                    // SSE 格式：每个事件用 \n\n 分隔
                    // 例如：data:{"type":"text","content":"我"}\n\ndata:{"type":"text","content":"将"}\n\n
                    const events = buffer.split(/\n\n/)

                    // 保留最后一个可能不完整的事件
                    buffer = events.pop() || ""

                    for (const event of events) {
                        if (!event.trim()) continue

                        // 每个事件格式：data:{"type":"text","content":"xxx"}
                        const lines = event.trim().split(/\n/)

                        for (const line of lines) {
                            if (!line.startsWith("data:")) continue

                            // 去掉 "data:" 前缀
                            const jsonData = line.substring(5).trim()

                            if (!jsonData) continue

                            try {
                                // 解析 JSON
                                const parsed = JSON.parse(jsonData)

                                // 处理不同类型的消息
                                if (parsed.type === "text" && parsed.content) {
                                    // 文本消息：追加到内容中
                                    fullContent += parsed.content

                                    // 实时更新助手消息，实现打字机效果
                                    setMessages((prev) =>
                                        prev.map((msg) =>
                                            msg.id === assistantMessageId
                                                ? {
                                                      ...msg,
                                                      content: fullContent,
                                                  }
                                                : msg,
                                        ),
                                    )
                                } else if (
                                    (parsed.type === "too_call" ||
                                        parsed.type === "tool_call") &&
                                    parsed.content
                                ) {
                                    // 工具调用消息：显示工具调用信息
                                    console.log(
                                        "[SSE] Tool call:",
                                        parsed.content,
                                    )
                                    const toolCallMessage = `\n🔧 ${parsed.content}\n`
                                    fullContent += toolCallMessage

                                    setMessages((prev) =>
                                        prev.map((msg) =>
                                            msg.id === assistantMessageId
                                                ? {
                                                      ...msg,
                                                      content: fullContent,
                                                  }
                                                : msg,
                                        ),
                                    )
                                } else if (
                                    parsed.type === "tool_call_result" &&
                                    parsed.content
                                ) {
                                    // 工具调用结果：包含生成的图表 XML
                                    console.log(
                                        "[SSE] Tool call result received, length:",
                                        parsed.content.length,
                                    )

                                    // 尝试从 XML 中提取内容
                                    const xmlContent = parsed.content

                                    // 查找 <mxfile> 标签
                                    const mxfileMatch = xmlContent.match(
                                        /<mxfile[\s\S]*?<\/mxfile>/,
                                    )
                                    if (mxfileMatch) {
                                        const fullXml = mxfileMatch[0]
                                        console.log(
                                            "[SSE] Found mxfile XML, triggering diagram load...",
                                        )

                                        // 将 XML 格式化为 markdown 代码块
                                        // 这样 ReactMarkdown 就能正确渲染为代码块
                                        const xmlCodeBlock = `\n\n\`\`\`xml\n${fullXml}\n\`\`\`\n\n`

                                        // 将 XML 代码块添加到 fullContent 中
                                        fullContent += xmlCodeBlock

                                        // 直接通过回调加载图表（使用 diagram-context 的 loadDiagram）
                                        onMessageComplete?.(fullContent)

                                        // 添加完成消息
                                        const completionMessage =
                                            "✅ 图表已生成"
                                        fullContent += completionMessage
                                    } else {
                                        console.warn(
                                            "[SSE] Tool call result did not contain valid mxfile XML",
                                        )
                                        const completionMessage =
                                            "\n\n⚠️ 图表生成失败"
                                        fullContent += completionMessage
                                    }

                                    setMessages((prev) =>
                                        prev.map((msg) =>
                                            msg.id === assistantMessageId
                                                ? {
                                                      ...msg,
                                                      content: fullContent,
                                                  }
                                                : msg,
                                        ),
                                    )
                                }
                            } catch (parseError) {
                                console.warn(
                                    "Failed to parse SSE data:",
                                    jsonData,
                                    parseError,
                                )
                            }
                        }
                    }
                }
            } catch (err) {
                const error = err as Error
                if (error.name === "AbortError") {
                    console.log("Request was aborted")
                    // 更新助手消息显示已停止
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? {
                                      ...msg,
                                      content:
                                          fullContent.trim() || "已停止生成",
                                  }
                                : msg,
                        ),
                    )
                } else {
                    setIsLoading(false)
                    setError(error)
                    onError?.(error)

                    // 更新助手消息为错误信息
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: `错误: ${error.message}` }
                                : msg,
                        ),
                    )
                }
            } finally {
                setIsLoading(false)
            }
        },
        [diagramId, aiConfig, isLoading, onMessageComplete, onError],
    )

    const stop = useCallback(() => {
        abortControllerRef.current?.abort()
        setIsLoading(false)
    }, [])

    const clearMessages = useCallback(() => {
        setMessages([])
        setError(null)
    }, [])

    // 手动设置消息（用于加载历史记录）
    const setMessagesList = useCallback((messageList: Message[]) => {
        setMessages(messageList)
    }, [])

    return {
        messages,
        sendMessage,
        stop,
        clearMessages,
        setMessages: setMessagesList,
        isLoading,
        error,
    }
}
