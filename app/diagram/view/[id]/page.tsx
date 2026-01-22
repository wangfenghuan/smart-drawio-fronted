"use client"

import { ArrowLeftOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getDiagramVoById } from "@/api/diagramController"

export default function DiagramViewPage() {
    const params = useParams()
    const router = useRouter()
    const diagramId = params.id as string

    const [diagramTitle, setDiagramTitle] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDiagram = async () => {
            const response = await getDiagramVoById({ id: diagramId })
            if (response?.data) {
                setDiagramTitle(response.data.name || "未命名图表")
                // 优先使用 pictureUrl，其次使用 svgUrl
                setImageUrl(
                    response.data.pictureUrl || response.data.svgUrl || "",
                )
            }
            setLoading(false)
        }
        loadDiagram()
    }, [diagramId])

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* 顶部工具栏 */}
            <div
                style={{
                    padding: "12px 24px",
                    background: "#fff",
                    borderBottom: "1px solid #e8e8e8",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                >
                    返回
                </Button>
                <span style={{ fontSize: "16px", fontWeight: 600 }}>
                    {diagramTitle}
                </span>
            </div>

            {/* SVG 图片区域 */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    background: "#f5f5f5",
                }}
            >
                {loading ? (
                    <div>加载中...</div>
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={diagramTitle}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                        }}
                    />
                ) : (
                    <div style={{ color: "#999" }}>暂无预览</div>
                )}
            </div>
        </div>
    )
}
