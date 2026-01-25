"use client"

import { SearchOutlined, SolutionOutlined } from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Image,
    Input,
    Pagination,
    Popconfirm,
    Table,
    Tag,
} from "antd"
import { useEffect, useRef, useState } from "react"
import {
    deleteFeedback,
    listFeedbackVoByPage,
    updateFeedback,
} from "@/api/feedBackController"

const { Search } = Input

export function AdminFeedbackManagement() {
    const { message } = App.useApp()

    const [dataList, setDataList] = useState<API.FeedbackVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")

    // Check ref to avoid double firing in React 18 strict mode
    const isLoadingRef = useRef(false)

    const loadData = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        if (isLoadingRef.current) return
        isLoadingRef.current = true
        setLoading(true)

        try {
            // Fix: Cast response to match runtime behavior (interceptor unwraps data)
            const response = (await listFeedbackVoByPage({
                current,
                pageSize,
                ...(searchText && { searchText }),
                sortField: "createTime",
                sortOrder: "descend",
            })) as unknown as API.BaseResponsePageFeedbackVO

            if (response?.code === 0 && response?.data) {
                const data = response.data
                const records = data.records || []

                // Handle pagination logic
                const serverCurrent = Number(data.current) || 1
                const serverSize = Number(data.size) || 10
                let serverTotal = Number(data.total) || 0

                // Fallback total calculation if server returns 0 but has records
                if (serverTotal === 0 && records.length > 0) {
                    if (records.length > serverSize) {
                        serverTotal = records.length
                    } else {
                        serverTotal =
                            (serverCurrent - 1) * serverSize + records.length
                    }
                }

                setDataList(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error(
                    "获取反馈列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载数据失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        // Need to reset the loading ref or call a version that bypasses it if strictly needed,
        // but since state update triggers re-render, we can just call loadData in next tick or directly if needed.
        // For simplicity reusing loadData logic but resetting ref briefly ensuring it goes through
        isLoadingRef.current = false
        loadData(1, pagination.pageSize)
    }

    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        isLoadingRef.current = false
        loadData(page, pageSize)
    }

    const handleUpdateStatus = async (record: API.FeedbackVO) => {
        try {
            // Fix: API definition thinks isHandle is string, but backend handles 0/1. Cast to number.
            const currentStatus = Number(record.isHandle)
            const newStatus = currentStatus === 1 ? 0 : 1
            const res = (await updateFeedback({
                id: record.id,
                isHandle: newStatus,
            })) as unknown as API.BaseResponseBoolean

            if (res.data) {
                message.success("更新状态成功")
                // Refresh list
                isLoadingRef.current = false
                loadData()
            } else {
                message.error("更新状态失败：" + res.message)
            }
        } catch (error) {
            message.error("操作失败，请重试")
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = (await deleteFeedback({
                id,
            })) as unknown as API.BaseResponseBoolean
            if (res.data) {
                message.success("删除成功")
                // Refresh list
                loadData()
            } else {
                message.error("删除失败：" + res.message)
            }
        } catch (error) {
            message.error("删除失败，请重试")
        }
    }

    const columns = [
        {
            title: "反馈ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "用户信息",
            dataIndex: "userVO",
            key: "userVO",
            width: 150,
            render: (_: any, record: API.FeedbackVO) => {
                if (!record.userId) return "匿名/未知"
                // Assuming userVO is not populated by default based on typical API patterns,
                // but checking if it's there. API definition said FeedbackVO.
                // If API returns joined user info:
                return (
                    <div>
                        <div>ID: {record.userId}</div>
                    </div>
                )
            },
        },
        {
            title: "标题/内容",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
            render: (text: string, record: API.FeedbackVO) => (
                <div>
                    <div>{text}</div>
                </div>
            ),
        },
        {
            title: "图片",
            dataIndex: "pictureUrl",
            key: "pictureUrl",
            width: 100,
            render: (url: string) => {
                if (!url) return "-"
                return (
                    <Image
                        src={url}
                        width={50}
                        height={50}
                        style={{ objectFit: "cover" }}
                    />
                )
            },
        },

        {
            title: "联系方式",
            dataIndex: "contact",
            key: "contact",
            width: 150,
        },
        {
            title: "提交时间",
            dataIndex: "createTime",
            key: "createTime",
            width: 180,
            render: (time: string) =>
                time ? new Date(time).toLocaleString() : "-",
        },
        {
            title: "状态",
            dataIndex: "isHandle",
            key: "isHandle",
            width: 100,
            render: (isHandle: string | number) => {
                const status = Number(isHandle)
                return (
                    <Tag color={status === 1 ? "green" : "orange"}>
                        {status === 1 ? "已处理" : "未处理"}
                    </Tag>
                )
            },
        },
        {
            title: "操作",
            key: "action",
            width: 120,
            render: (_: any, record: API.FeedbackVO) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleUpdateStatus(record)}
                    >
                        {Number(record.isHandle) === 1
                            ? "标记未处理"
                            : "标记已处理"}
                    </Button>
                    <Popconfirm
                        title="确定要删除这条反馈吗？"
                        onConfirm={() => handleDelete(record.id as string)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" size="small" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ]

    return (
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
                    <SolutionOutlined
                        style={{ fontSize: "18px", color: "#ff4d4f" }}
                    />
                    <span>反馈管理</span>
                </div>
            }
        >
            <div style={{ marginBottom: "16px" }}>
                <Search
                    placeholder="搜索反馈内容..."
                    allowClear
                    enterButton={
                        <Button icon={<SearchOutlined />}>搜索</Button>
                    }
                    onSearch={handleSearch}
                />
            </div>

            <Table
                columns={columns}
                dataSource={dataList}
                loading={loading}
                rowKey="id"
                pagination={false}
                scroll={{ x: 1000 }}
                style={{ marginBottom: "16px" }}
            />

            {!loading && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handleTableChange}
                        onShowSizeChange={handleTableChange}
                        showSizeChanger
                        pageSizeOptions={["10", "20", "50"]}
                        showTotal={(total) => `共 ${total} 条`}
                    />
                </div>
            )}
        </Card>
    )
}
