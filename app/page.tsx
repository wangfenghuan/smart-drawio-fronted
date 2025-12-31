"use client"

import {
    BulbOutlined,
    PlusOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Space, Typography } from "antd"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { addDiagram } from "@/api/diagramController"

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
    const { message } = App.useApp()
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [particles, setParticles] = useState<
        Array<{ id: number; x: number; y: number; vx: number; vy: number }>
    >([])

    // 鼠标移动效果
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    // 初始化粒子
    useEffect(() => {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: (Math.random() - 0.5) * 0.02,
            vy: (Math.random() - 0.5) * 0.02,
        }))
        setParticles(newParticles)
    }, [])

    const handleCreateDiagram = async () => {
        try {
            setLoading(true)

            // 调用创建图表的 API
            const response = await addDiagram({
                name: "未命名图表",
                diagramCode: "",
                pictureUrl: "",
            })

            // 检查响应状态，code 为 0 表示成功
            if (response && response.code === 0 && response.data) {
                const diagramId = response.data

                message.success("图表创建成功！")

                // 跳转到编辑页面，将图表 ID 作为路由参数传递
                router.push(`/diagram/edit/${diagramId}`)
            } else {
                message.error(response?.message || "创建图表失败，请稍后重试")
            }
        } catch (error) {
            console.error("创建图表失败:", error)
            message.error("创建图表失败，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    const quickTemplates = [
        {
            icon: <ThunderboltOutlined />,
            title: "快速开始",
            desc: "从零开始创建",
        },
        { icon: <BulbOutlined />, title: "AI 辅助", desc: "智能生成图表" },
    ]

    return (
        <div
            style={{
                minHeight: "100vh",
                background: `
                    radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at ${100 - mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at ${mousePosition.x}% ${100 - mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                    linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)
                `,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
                transition: "background 0.3s ease-out",
            }}
        >
            {/* 网格背景 */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: "50px 50px",
                    pointerEvents: "none",
                }}
            />

            {/* 动态粒子 */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    style={{
                        position: "absolute",
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: "2px",
                        height: "2px",
                        background: "rgba(102, 126, 234, 0.3)",
                        borderRadius: "50%",
                        boxShadow: "0 0 6px rgba(102, 126, 234, 0.5)",
                        pointerEvents: "none",
                        animation: "float 8s infinite ease-in-out",
                    }}
                />
            ))}

            {/* 主内容卡片 */}
            <Card
                hoverable
                style={{
                    width: "100%",
                    maxWidth: "700px",
                    borderRadius: "20px",
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.3),
                        0 0 80px rgba(102, 126, 234, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05)
                    `,
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 1,
                }}
                styles={{
                    body: {
                        padding: "60px 48px",
                        textAlign: "center",
                    },
                }}
            >
                {/* 卡片光晕效果 */}
                <div
                    style={{
                        position: "absolute",
                        top: `${mousePosition.y * 0.8}%`,
                        left: `${mousePosition.x * 0.8}%`,
                        width: "300px",
                        height: "300px",
                        background:
                            "radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)",
                        borderRadius: "50%",
                        pointerEvents: "none",
                        transition: "all 0.3s ease-out",
                        filter: "blur(40px)",
                    }}
                />

                {/* 图标 */}
                <div style={{ marginBottom: "32px", position: "relative" }}>
                    <div
                        style={{
                            width: "100px",
                            height: "100px",
                            margin: "0 auto 24px",
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `
                                0 8px 32px rgba(102, 126, 234, 0.4),
                                0 0 0 1px rgba(255, 255, 255, 0.1),
                                inset 0 1px 0 rgba(255, 255, 255, 0.2)
                            `,
                            position: "relative",
                            animation: "pulse-glow 3s infinite",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                inset: -2,
                                background:
                                    "linear-gradient(135deg, #667eea, #764ba2, #667eea)",
                                borderRadius: "26px",
                                zIndex: -1,
                                opacity: 0.5,
                                filter: "blur(8px)",
                            }}
                        />
                        <PlusOutlined
                            style={{ fontSize: "48px", color: "#fff" }}
                        />
                    </div>
                    <Title
                        level={1}
                        style={{
                            marginBottom: "16px",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "42px",
                            letterSpacing: "-1px",
                            textShadow: "0 2px 20px rgba(102, 126, 234, 0.3)",
                        }}
                    >
                        智能协同云画图
                    </Title>
                    <Paragraph
                        style={{
                            fontSize: "18px",
                            color: "rgba(255, 255, 255, 0.7)",
                            marginBottom: "40px",
                            lineHeight: "1.6",
                        }}
                    >
                        使用 AI
                        技术快速创建专业图表，支持多种图表类型和实时协同编辑
                    </Paragraph>
                </div>

                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleCreateDiagram}
                        loading={loading}
                        style={{
                            height: "64px",
                            fontSize: "20px",
                            fontWeight: 600,
                            borderRadius: "16px",
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            boxShadow: `
                                0 8px 32px rgba(102, 126, 234, 0.5),
                                0 0 0 1px rgba(255, 255, 255, 0.1),
                                inset 0 1px 0 rgba(255, 255, 255, 0.2)
                            `,
                            transition: "all 0.3s ease",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)"
                            e.currentTarget.style.boxShadow = `
                                0 12px 48px rgba(102, 126, 234, 0.6),
                                0 0 0 1px rgba(255, 255, 255, 0.15),
                                inset 0 1px 0 rgba(255, 255, 255, 0.2)
                            `
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)"
                            e.currentTarget.style.boxShadow = `
                                0 8px 32px rgba(102, 126, 234, 0.5),
                                0 0 0 1px rgba(255, 255, 255, 0.1),
                                inset 0 1px 0 rgba(255, 255, 255, 0.2)
                            `
                        }}
                    >
                        <span
                            style={{
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            立即创建我的图表
                        </span>
                    </Button>

                    <div
                        style={{
                            display: "flex",
                            gap: "20px",
                            justifyContent: "center",
                            marginTop: "32px",
                        }}
                    >
                        {quickTemplates.map((item, index) => (
                            <Card
                                key={index}
                                hoverable
                                style={{
                                    flex: 1,
                                    borderRadius: "16px",
                                    background: "rgba(255, 255, 255, 0.03)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                    transition: "all 0.3s ease",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                                styles={{
                                    body: {
                                        padding: "24px 20px",
                                        textAlign: "center",
                                    },
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(-4px)"
                                    e.currentTarget.style.background =
                                        "rgba(255, 255, 255, 0.06)"
                                    e.currentTarget.style.borderColor =
                                        "rgba(102, 126, 234, 0.3)"
                                    e.currentTarget.style.boxShadow =
                                        "0 8px 24px rgba(102, 126, 234, 0.2)"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)"
                                    e.currentTarget.style.background =
                                        "rgba(255, 255, 255, 0.03)"
                                    e.currentTarget.style.borderColor =
                                        "rgba(255, 255, 255, 0.08)"
                                    e.currentTarget.style.boxShadow = "none"
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "32px",
                                        marginBottom: "12px",
                                        background:
                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        display: "inline-block",
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: "#ffffff",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {item.title}
                                </div>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "rgba(255, 255, 255, 0.5)",
                                    }}
                                >
                                    {item.desc}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Space>
            </Card>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0);
                    }
                    25% {
                        transform: translate(10px, -10px);
                    }
                    50% {
                        transform: translate(-5px, 10px);
                    }
                    75% {
                        transform: translate(-10px, -5px);
                    }
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow:
                            0 8px 32px rgba(102, 126, 234, 0.4),
                            0 0 0 1px rgba(255, 255, 255, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2);
                    }
                    50% {
                        box-shadow:
                            0 8px 48px rgba(102, 126, 234, 0.6),
                            0 0 0 1px rgba(255, 255, 255, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    }
                }
            `}</style>
        </div>
    )
}

export default Home
