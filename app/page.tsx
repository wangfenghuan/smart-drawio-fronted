"use client"

import {
    AppstoreOutlined,
    BulbOutlined,
    FolderOutlined,
    PlusOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Col, Row, Space, Typography } from "antd"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { CreateDiagramDialog } from "@/components/create-diagram-dialog"
import { CreateSpaceDialog } from "@/components/create-space-dialog"

const { Title, Paragraph, Text } = Typography

const Home: React.FC = () => {
    const { message } = App.useApp()
    const router = useRouter()
    const [loading, _setLoading] = React.useState(false)
    const [createSpaceDialogVisible, setCreateSpaceDialogVisible] =
        useState(false)
    const [createDiagramDialogVisible, setCreateDiagramDialogVisible] =
        useState(false)

    const handleCreateDiagram = () => {
        setCreateDiagramDialogVisible(true)
    }

    const handleDiagramCreated = (diagramId: string | number) => {
        router.push(`/diagram/edit/${diagramId}`)
    }

    const quickTemplates = [
        {
            icon: (
                <ThunderboltOutlined
                    style={{ fontSize: 24, color: "#1677ff" }}
                />
            ),
            title: "快速开始",
            desc: "创建一个空白图表，从零开始绘制",
            action: handleCreateDiagram,
            bg: "#e6f7ff",
        },
        {
            icon: <BulbOutlined style={{ fontSize: 24, color: "#faad14" }} />,
            title: "AI 智能生成",
            desc: "输入描述，让 AI 帮你生成专业图表",
            action: () => message.info("AI 功能即将上线"), // Placeholder logic
            bg: "#fff7e6",
        },
        {
            icon: <FolderOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
            title: "新建空间",
            desc: "创建团队或个人空间，管理图表",
            action: () => setCreateSpaceDialogVisible(true),
            bg: "#f6ffed",
        },
        {
            icon: (
                <AppstoreOutlined style={{ fontSize: 24, color: "#722ed1" }} />
            ),
            title: "浏览模板",
            desc: "从海量模板库中选择",
            action: () => router.push("/templates"),
            bg: "#f9f0ff",
        },
    ]

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                backgroundImage:
                    "radial-gradient(#e2e8f0 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
            }}
        >
            <div style={{ maxWidth: 1000, width: "100%", zIndex: 1 }}>
                {/* Hero Section */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: 64,
                        animation: "fadeIn 0.8s ease-out",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 24,
                            background: "#fff",
                            padding: "8px 16px",
                            borderRadius: 20,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <Text strong style={{ color: "#1677ff" }}>
                            ✨ IntelliDraw 智能绘图
                        </Text>
                    </div>

                    <Title
                        level={1}
                        style={{
                            fontSize: "48px",
                            marginBottom: 24,
                            fontWeight: 800,
                            color: "#1e293b",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        智能协同，
                        <span style={{ color: "#1677ff" }}>无限创意</span>
                    </Title>

                    <Paragraph
                        style={{
                            fontSize: "18px",
                            color: "#64748b",
                            maxWidth: 600,
                            margin: "0 auto 40px",
                            lineHeight: 1.8,
                        }}
                    >
                        IntelliDraw 是一款简单好用的在线作图工具，支持流程图、思维导图、UML
                        等多种图形。
                        <br />
                        AI 辅助生成，实时团队协作，让想法即刻落地。
                    </Paragraph>

                    <Space size="large">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleCreateDiagram}
                            style={{
                                height: 52,
                                padding: "0 32px",
                                fontSize: 16,
                                borderRadius: 8,
                                boxShadow: "0 4px 12px rgba(22, 119, 255, 0.3)",
                            }}
                        >
                            立即免费使用
                        </Button>
                        <Button
                            size="large"
                            style={{
                                height: 52,
                                padding: "0 32px",
                                fontSize: 16,
                                borderRadius: 8,
                                background: "#fff",
                                borderColor: "#d9d9d9",
                            }}
                            onClick={() => message.info("演示视频即将上线")}
                        >
                            观看演示
                        </Button>
                    </Space>
                </div>

                {/* Quick Action Cards */}
                <Row gutter={[24, 24]} justify="center">
                    {quickTemplates.map((item, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <Card
                                hoverable
                                onClick={item.action}
                                style={{
                                    height: "100%",
                                    borderRadius: 12,
                                    border: "none",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                    transition: "all 0.3s",
                                }}
                                styles={{
                                    body: {
                                        padding: 24,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        textAlign: "center",
                                        height: "100%",
                                    },
                                }}
                            >
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 16,
                                        background: item.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 16,
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <Text
                                    strong
                                    style={{
                                        fontSize: 16,
                                        marginBottom: 8,
                                        color: "#334155",
                                    }}
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    type="secondary"
                                    style={{ fontSize: 13, lineHeight: 1.5 }}
                                >
                                    {item.desc}
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <CreateSpaceDialog
                open={createSpaceDialogVisible}
                onOpenChange={setCreateSpaceDialogVisible}
                onSuccess={() => {
                    message.success("空间创建成功！")
                }}
            />

            <CreateDiagramDialog
                open={createDiagramDialogVisible}
                onOpenChange={setCreateDiagramDialogVisible}
                onSuccess={handleDiagramCreated}
            />
        </div>
    )
}

export default Home
