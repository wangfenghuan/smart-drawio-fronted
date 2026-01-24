"use client"

import {
    AppstoreOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Empty, Input, Modal, Pagination, Tag } from "antd"
import { useEffect, useRef, useState } from "react"
import { listMaterialVoByPage } from "@/api/materialController"
import MaterialViewer from "@/components/MaterialViewer"

const { Search } = Input

export default function MaterialMarketplacePage() {
    const { message } = App.useApp()

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
            const response = await listMaterialVoByPage({
                current,
                pageSize,
                name: searchText,
                sortField: "createTime",
                sortOrder: "desc",
            })

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
        // Reset pagination and reload
        // Note: state update is async, so we pass value directly if needed,
        // or rely on useEffect if we added searchText to dependency array.
        // For simplicity, we'll manually call reload.

        // Fix: Pagination state update won't be immediate for the loadMaterials call
        // We'll update state and let a useEffect or direct call handle it.
        // Direct call is safer for immediate feedback.
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
            const response = await listMaterialVoByPage({
                current,
                pageSize,
                name: search,
                sortField: "createTime",
                sortOrder: "desc",
            })
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

    return (
        <div style={{ minHeight: "100vh", padding: "24px" }}>
            <Card
                bordered={false}
                style={{ borderRadius: "8px" }}
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <AppstoreOutlined
                            style={{ fontSize: "20px", color: "#1890ff" }}
                        />
                        <div>
                            <div style={{ fontSize: "18px", fontWeight: 600 }}>
                                素材广场
                            </div>
                            <div style={{ fontSize: "12px", color: "#999" }}>
                                共 {pagination.total} 个素材
                            </div>
                        </div>
                    </div>
                }
            >
                <div style={{ marginBottom: "24px" }}>
                    <Search
                        placeholder="搜索素材名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: "400px" }}
                    />
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
                                hoverable
                                style={{ borderRadius: "8px" }}
                            />
                        ))
                    ) : materials.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "60px 0",
                            }}
                        >
                            <Empty description="暂无素材" />
                        </div>
                    ) : (
                        materials.map((material) => (
                            <Card
                                key={material.id}
                                hoverable
                                style={{
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                }}
                                bodyStyle={{ padding: "16px" }}
                                onClick={() => handlePreview(material)}
                            >
                                <div style={{ marginBottom: "12px" }}>
                                    <h3
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            marginBottom: "8px",
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
                                            color: "#666",
                                            marginBottom: "12px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            height: "20px",
                                        }}
                                    >
                                        {material.description || "暂无描述"}
                                    </p>
                                </div>

                                {/* Preview Area */}
                                <div
                                    style={{
                                        height: "160px",
                                        background: "#f5f5f5",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "12px",
                                        overflow: "hidden",
                                    }}
                                >
                                    {material.pictureUrl || material.svgUrl ? (
                                        <img
                                            src={
                                                material.pictureUrl ||
                                                material.svgUrl
                                            }
                                            alt={material.name}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                                objectFit: "contain",
                                            }}
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
                                                className="scale-50 origin-top-left" // Optional: scale down for list view if needed
                                            />
                                        </div>
                                    ) : (
                                        <Empty description={false} />
                                    )}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        fontSize: "12px",
                                        color: "#666",
                                    }}
                                >
                                    <UserOutlined />
                                    <span
                                        style={{
                                            flex: 1,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {material.userVO?.userName ||
                                            material.userId ||
                                            "未知用户"}
                                    </span>
                                </div>
                                {material.tags && (
                                    <div
                                        style={{
                                            marginTop: "8px",
                                            overflow: "hidden",
                                            height: "22px",
                                        }}
                                    >
                                        {(() => {
                                            try {
                                                const tags = JSON.parse(
                                                    material.tags,
                                                )
                                                return Array.isArray(tags)
                                                    ? tags.map(
                                                          (
                                                              tag: string,
                                                              i: number,
                                                          ) => (
                                                              <Tag
                                                                  key={i}
                                                                  style={{
                                                                      fontSize:
                                                                          "10px",
                                                                  }}
                                                              >
                                                                  {tag}
                                                              </Tag>
                                                          ),
                                                      )
                                                    : null
                                            } catch (e) {
                                                return (
                                                    <Tag>{material.tags}</Tag>
                                                )
                                            }
                                        })()}
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>

                {!loading && materials.length > 0 && (
                    <div
                        style={{
                            marginTop: "32px",
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
            </Card>

            <Modal
                title={previewMaterial?.name || "素材预览"}
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setPreviewVisible(false)}
                    >
                        关闭
                    </Button>,
                ]}
                width={900}
                centered
                destroyOnClose
            >
                <div
                    style={{
                        minHeight: "500px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "#fff",
                    }}
                >
                    {previewMaterial?.diagramCode ? (
                        <MaterialViewer
                            xml={previewMaterial.diagramCode}
                            style={{ width: "100%", height: "500px" }}
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
                                maxHeight: "500px",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <Empty description="暂无预览内容" />
                    )}
                </div>
            </Modal>
        </div>
    )
}
