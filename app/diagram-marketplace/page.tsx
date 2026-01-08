"use client"

import {
    ClockCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    GlobalOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Empty, Input, Pagination, Spin, Tooltip } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getByPage } from "@/api/diagramController"

const { Search } = Input

export default function DiagramMarketplacePage() {
    const { message } = App.useApp()
    const router = useRouter()

    const [diagrams, setDiagrams] = useState<API.DiagramVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const isLoadingRef = useRef(false)

    // 加载公共图表列表
    const loadDiagrams = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        if (isLoadingRef.current) {
            return
        }
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await getByPage({
                current: current,
                pageSize: pageSize,
                ...(searchText && { searchText: searchText }),
                nullSpaceId: true, // 只查询开放空间的图表
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

                setDiagrams(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error(
                    "获取图表列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载图表列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadDiagrams()
    }, [])

    // 搜索触发
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadDiagrams(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadDiagrams(page, pageSize)
    }

    // 跳转到查看页面（只读模式）
    const handleViewDiagram = (id: string | undefined) => {
        if (id) {
            router.push(`/diagram/view/${id}`)
        }
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
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                            }}
                        >
                            <GlobalOutlined
                                style={{ fontSize: "20px", color: "#1890ff" }}
                            />
                            <div>
                                <div
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                    }}
                                >
                                    图表广场
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#999",
                                    }}
                                >
                                    共 {pagination.total} 个公共图表
                                </div>
                            </div>
                        </div>
                    </div>
                }
            >
                {/* 搜索栏 */}
                <div style={{ marginBottom: "24px" }}>
                    <Search
                        placeholder="搜索图表名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: "400px" }}
                    />
                </div>

                {/* 图表列表 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {loading ? (
                        Array.from({ length: pagination.pageSize }).map(
                            (_, index) => (
                                <Card
                                    key={index}
                                    loading
                                    hoverable
                                    style={{ borderRadius: "8px" }}
                                />
                            ),
                        )
                    ) : diagrams.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "60px 0",
                            }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                marginBottom: "8px",
                                                color: "#666",
                                            }}
                                        >
                                            {searchText
                                                ? "未找到匹配的图表"
                                                : "暂无公共图表"}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#999",
                                            }}
                                        >
                                            公共图表会展示在这里
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        diagrams.map((diagram) => (
                            <Card
                                key={diagram.id}
                                hoverable
                                style={{
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                }}
                                bodyStyle={{ padding: "16px" }}
                                onClick={() =>
                                    handleViewDiagram(diagram.id?.toString())
                                }
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
                                        title={diagram.name}
                                    >
                                        {diagram.name || "未命名图表"}
                                    </h3>
                                    {diagram.description ? (
                                        <p
                                            style={{
                                                fontSize: "13px",
                                                color: "#666",
                                                marginBottom: "12px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {diagram.description}
                                        </p>
                                    ) : (
                                        <div
                                            style={{
                                                height: "13px",
                                                marginBottom: "12px",
                                            }}
                                        ></div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            fontSize: "12px",
                                            color: "#999",
                                        }}
                                    >
                                        <ClockCircleOutlined />
                                        <span>
                                            {diagram.createTime
                                                ? new Date(
                                                      diagram.createTime,
                                                  ).toLocaleString()
                                                : "未知时间"}
                                        </span>
                                    </div>
                                </div>

                                {/* 缩略图区域 */}
                                <div
                                    style={{
                                        marginBottom: "12px",
                                        height: "140px",
                                        borderRadius: "6px",
                                        background: "#f5f5f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                    }}
                                >
                                    <img
                                        src={
                                            diagram.pictureUrl ||
                                            diagram.svgUrl ||
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23d9d9d9' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E"
                                        }
                                        alt={diagram.name}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>

                                {/* 图表信息 */}
                                <div
                                    style={{
                                        marginBottom: "12px",
                                        padding: "12px",
                                        borderRadius: "6px",
                                        background: "#f0f2f5",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                    }}
                                >
                                    {diagram.userVO && (
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
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    flex: 1,
                                                }}
                                            >
                                                创建者:{" "}
                                                {diagram.userVO.userName ||
                                                    diagram.userId ||
                                                    "未知"}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "12px",
                                            color: "#52c41a",
                                        }}
                                    >
                                        <GlobalOutlined />
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                flex: 1,
                                            }}
                                        >
                                            开放空间
                                        </span>
                                    </div>
                                </div>

                                {/* 操作按钮区 */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Tooltip title="查看详情">
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleViewDiagram(
                                                    diagram.id?.toString(),
                                                )
                                            }}
                                        >
                                            查看
                                        </Button>
                                    </Tooltip>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* 分页组件 */}
                {!loading && diagrams.length > 0 && (
                    <div
                        style={{
                            marginTop: "32px",
                            display: "flex",
                            justifyContent: "center",
                            padding: "24px 0",
                        }}
                    >
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handleTableChange}
                            onShowSizeChange={handleTableChange}
                            showSizeChanger
                            pageSizeOptions={["12", "24", "48", "60"]}
                            showTotal={(total) => `共 ${total} 条`}
                        />
                    </div>
                )}
            </Card>
        </div>
    )
}
