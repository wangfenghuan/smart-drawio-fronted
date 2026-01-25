"use client"

import {
    AppstoreOutlined,
    RocketOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Empty, Input, Modal, Pagination, Tag } from "antd"
import { useRouter } from "next/navigation" // Correct import for Next.js 13+ app dir
import { useEffect, useRef, useState } from "react"
import { listMaterialVoByPage } from "@/api/materialController"
import { CreateDiagramDialog } from "@/components/create-diagram-dialog"
import MaterialViewer from "@/components/MaterialViewer"

const { Search } = Input

export default function MaterialMarketplacePage() {
    const { message } = App.useApp()
    const router = useRouter()

    const [materials, setMaterials] = useState<API.MaterialVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewMaterial, setPreviewMaterial] =
        useState<API.MaterialVO | null>(null)

    // Create Diagram State
    const [createDialogVisible, setCreateDialogVisible] = useState(false)
    const [useMaterial, setUseMaterial] = useState<API.MaterialVO | null>(null)

    const isLoadingRef = useRef(false)

    // Load materials
    const loadMaterials = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        if (isLoadingRef.current) return
        isLoadingRef.current = true
        setLoading(true)

        try {
            // Using listMaterialVoByPage API
            // Fix: Cast response to match runtime behavior
            const response = (await listMaterialVoByPage({
                current,
                pageSize,
                name: searchText,
                sortField: "createTime",
                sortOrder: "desc",
            })) as unknown as API.BaseResponsePageMaterialVO

            if (response?.code === 0 && response?.data) {
                const data = response.data
                const records = data.records || []

                const serverCurrent = Number(data.current) || 1
                const serverSize = Number(data.size) || 12
                let serverTotal = Number(data.total) || 0

                if (serverTotal === 0 && records.length > 0) {
                    if (records.length > serverSize) {
                        serverTotal = records.length
                    } else {
                        serverTotal =
                            (serverCurrent - 1) * serverSize + records.length
                    }
                }

                setMaterials(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error("加载素材列表失败：" + (response?.message || ""))
            }
        } catch (error) {
            console.error("加载素材列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMaterials()
    }, [])

    const handleSearch = (value: string) => {
        setSearchText(value)
        loadMaterialsWithSearch(value, 1, pagination.pageSize)
    }

    const loadMaterialsWithSearch = async (
        search: string,
        current: number,
        pageSize: number,
    ) => {
        if (isLoadingRef.current) return
        isLoadingRef.current = true
        setLoading(true)
        try {
            const response = (await listMaterialVoByPage({
                current,
                pageSize,
                name: search,
                sortField: "createTime",
                sortOrder: "desc",
            })) as unknown as API.BaseResponsePageMaterialVO
            if (response?.code === 0 && response?.data) {
                const data = response.data
                setMaterials(data.records || [])
                setPagination({
                    current: Number(data.current) || 1,
                    pageSize: Number(data.size) || 12,
                    total: Number(data.total) || 0,
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadMaterials(page, pageSize)
    }

    const handlePreview = (material: API.MaterialVO) => {
        setPreviewMaterial(material)
        setPreviewVisible(true)
    }

    const handleUseMaterial = (material: API.MaterialVO) => {
        setUseMaterial(material)
        setCreateDialogVisible(true)
    }

    const handleCreateSuccess = (diagramId: string | number) => {
        router.push(`/diagram/edit/${diagramId}`)
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #eef2f9 100%)",
                padding: "32px 24px",
            }}
        >
            {/* Header Section */}
            <div style={{ maxWidth: "1200px", margin: "0 auto 40px" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1
                        style={{
                            fontSize: "36px",
                            fontWeight: 700,
                            marginBottom: "12px",
                            background:
                                "linear-gradient(45deg, #1890ff, #722ed1)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        素材广场
                    </h1>
                    <p
                        style={{
                            color: "#666",
                            fontSize: "16px",
                            maxWidth: "600px",
                            margin: "0 auto",
                        }}
                    >
                        探索高质量的图表素材，激发您的创作灵感
                    </p>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Search
                        placeholder="搜索素材名称..."
                        allowClear
                        enterButton={
                            <Button
                                type="primary"
                                style={{
                                    borderRadius: "0 24px 24px 0",
                                    height: "48px",
                                    padding: "0 24px",
                                    fontSize: "16px",
                                }}
                                icon={<SearchOutlined />}
                            >
                                搜索
                            </Button>
                        }
                        size="large"
                        onSearch={handleSearch}
                        style={{
                            maxWidth: "600px",
                            width: "100%",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            borderRadius: "24px",
                        }}
                        className="custom-search-input"
                    />
                    <style jsx global>{`
                        .custom-search-input .ant-input-wrapper .ant-input-affix-wrapper {
                            height: 48px;
                            border-radius: 24px 0 0 24px;
                            padding-left: 20px;
                            border: none;
                            box-shadow: none;
                        }
                        .custom-search-input .ant-input-wrapper .ant-input-group-addon button {
                            margin: 0;
                            border: none;
                        }
                    `}</style>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div
                    style={{
                        marginBottom: "16px",
                        color: "#999",
                        fontSize: "14px",
                        paddingLeft: "8px",
                    }}
                >
                    共找到 {pagination.total} 个精彩素材
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {loading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <Card
                                key={index}
                                loading
                                style={{ borderRadius: "16px", border: "none" }}
                            />
                        ))
                    ) : materials.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "80px 0",
                                background: "#fff",
                                borderRadius: "16px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            }}
                        >
                            <Empty
                                description="暂无相关素材，换个词试试？"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    ) : (
                        materials.map((material) => (
                            <div
                                key={material.id}
                                className="group"
                                style={{
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                }}
                                onClick={() => handlePreview(material)}
                            >
                                <Card
                                    hoverable
                                    bordered={false}
                                    style={{
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        boxShadow:
                                            "0 2px 8px rgba(0, 0, 0, 0.04)",
                                        height: "100%",
                                        transition:
                                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    bodyStyle={{ padding: "16px" }}
                                    className="hover:shadow-lg hover:-translate-y-1"
                                >
                                    {/* Preview Area */}
                                    <div
                                        style={{
                                            height: "180px",
                                            background: "#f8fafc",
                                            borderRadius: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "16px",
                                            overflow: "hidden",
                                            position: "relative",
                                        }}
                                    >
                                        {material.pictureUrl ||
                                        material.svgUrl ? (
                                            <img
                                                src={
                                                    material.pictureUrl ||
                                                    material.svgUrl
                                                }
                                                alt={material.name}
                                                style={{
                                                    maxWidth: "90%",
                                                    maxHeight: "90%",
                                                    objectFit: "contain",
                                                    transition:
                                                        "transform 0.3s ease",
                                                }}
                                                className="group-hover:scale-105"
                                            />
                                        ) : material.diagramCode ? (
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                <MaterialViewer
                                                    xml={material.diagramCode}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                    }}
                                                    className="scale-50 origin-top-left"
                                                />
                                            </div>
                                        ) : (
                                            <Empty description={false} />
                                        )}
                                    </div>

                                    <div style={{ marginBottom: "12px" }}>
                                        <h3
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 600,
                                                marginBottom: "6px",
                                                color: "#1f2937",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                            title={material.name}
                                        >
                                            {material.name || "未命名素材"}
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: "13px",
                                                color: "#6b7280",
                                                marginBottom: "0",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {material.description || "暂无描述"}
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            paddingTop: "12px",
                                            borderTop: "1px solid #f3f4f6",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                maxWidth: "60%",
                                            }}
                                        >
                                            <UserOutlined />
                                            <span
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {material.userVO?.userName ||
                                                    material.userId ||
                                                    "未知"}
                                            </span>
                                        </div>

                                        {material.tags &&
                                            (() => {
                                                try {
                                                    const tags = JSON.parse(
                                                        material.tags,
                                                    )
                                                    if (
                                                        Array.isArray(tags) &&
                                                        tags.length > 0
                                                    ) {
                                                        return (
                                                            <Tag
                                                                color="blue"
                                                                style={{
                                                                    marginRight: 0,
                                                                    border: "none",
                                                                    background:
                                                                        "#eff6ff",
                                                                    color: "#3b82f6",
                                                                    fontSize:
                                                                        "10px",
                                                                    borderRadius:
                                                                        "4px",
                                                                }}
                                                            >
                                                                {tags[0]}
                                                                {tags.length >
                                                                    1 &&
                                                                    ` +${tags.length - 1}`}
                                                            </Tag>
                                                        )
                                                    }
                                                } catch (e) {
                                                    // ignore
                                                }
                                                return null
                                            })()}
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>

                {!loading && materials.length > 0 && (
                    <div
                        style={{
                            marginTop: "48px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handleTableChange}
                            showSizeChanger
                        />
                    </div>
                )}
            </div>

            <Modal
                title={
                    <span style={{ fontSize: "18px", fontWeight: 600 }}>
                        {previewMaterial?.name || "素材预览"}
                    </span>
                }
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setPreviewVisible(false)}
                    >
                        关闭
                    </Button>,
                    <Button
                        key="use"
                        type="primary"
                        icon={<RocketOutlined />}
                        onClick={() => {
                            if (previewMaterial) {
                                setPreviewVisible(false)
                                handleUseMaterial(previewMaterial)
                            }
                        }}
                    >
                        开始使用
                    </Button>,
                ]}
                width={1000}
                centered
                destroyOnClose
                bodyStyle={{ padding: "24px" }}
            >
                <div
                    style={{
                        height: "600px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #f1f5f9",
                    }}
                >
                    {previewMaterial?.diagramCode ? (
                        <MaterialViewer
                            xml={previewMaterial.diagramCode}
                            style={{ width: "100%", height: "100%" }}
                        />
                    ) : previewMaterial?.pictureUrl ||
                      previewMaterial?.svgUrl ? (
                        <img
                            src={
                                previewMaterial.pictureUrl ||
                                previewMaterial.svgUrl
                            }
                            alt={previewMaterial.name}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <Empty description="暂无预览内容" />
                    )}
                </div>

                <div
                    style={{
                        marginTop: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                marginBottom: "8px",
                            }}
                        >
                            描述
                        </h3>
                        <p style={{ color: "#666", lineHeight: "1.6" }}>
                            {previewMaterial?.description || "暂无描述"}
                        </p>
                    </div>
                    {previewMaterial?.tags && (
                        <div style={{ textAlign: "right" }}>
                            <h3
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    marginBottom: "8px",
                                    color: "#666",
                                }}
                            >
                                标签
                            </h3>
                            <div>
                                {(() => {
                                    try {
                                        const tags = JSON.parse(
                                            previewMaterial.tags || "[]",
                                        )
                                        return Array.isArray(tags) ? (
                                            tags.map((tag) => (
                                                <Tag key={tag} color="geekblue">
                                                    {tag}
                                                </Tag>
                                            ))
                                        ) : (
                                            <Tag>{previewMaterial.tags}</Tag>
                                        )
                                    } catch (e) {
                                        return (
                                            <Tag>{previewMaterial?.tags}</Tag>
                                        )
                                    }
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <CreateDiagramDialog
                open={createDialogVisible}
                onOpenChange={setCreateDialogVisible}
                onSuccess={handleCreateSuccess}
                initialName={
                    useMaterial?.name
                        ? `使用素材-${useMaterial.name}`
                        : undefined
                }
                initialDiagramCode={useMaterial?.diagramCode || undefined}
            />
        </div>
    )
}
