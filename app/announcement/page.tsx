"use client"

import { CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { Card, List, Modal, Pagination, Tag, Typography } from "antd"
import { useEffect, useState } from "react"
import { listAnnouncementVoByPage } from "@/api/announcementController"

const { Title, Paragraph } = Typography

export default function AnnouncementPage() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<API.AnnouncementVO[]>([])
    const [total, setTotal] = useState(0)
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [modalVisible, setModalVisible] = useState(false)
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<API.AnnouncementVO | null>(null)

    const loadData = async (page = 1, size = 10) => {
        setLoading(true)
        try {
            const res = await listAnnouncementVoByPage({
                current: page,
                pageSize: size,
                sortField: "createTime",
                sortOrder: "descend",
            })
            // @ts-expect-error
            if (res.code === 0 && res.data) {
                // @ts-expect-error
                setData(res.data.records || [])
                // @ts-expect-error
                setTotal(res.data.total || 0)
                // @ts-expect-error
                setCurrent(res.data.current || 1)
                // @ts-expect-error
                setPageSize(res.data.size || 10)
            }
        } catch (error) {
            console.error("加载公告失败", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handlePageChange = (page: number, size: number) => {
        loadData(page, size)
    }

    const openDetails = (item: API.AnnouncementVO) => {
        setSelectedAnnouncement(item)
        setModalVisible(true)
    }

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
            <Card
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        <span style={{ fontSize: "20px" }}>系统公告</span>
                    </div>
                }
                bordered={false}
                style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <List
                    itemLayout="vertical"
                    size="large"
                    loading={loading}
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item
                            key={item.id}
                            style={{
                                cursor: "pointer",
                                transition: "all 0.3s",
                            }}
                            className="hover:bg-gray-50 p-4 rounded-lg"
                            onClick={() => openDetails(item)}
                            actions={[
                                <div
                                    key="time"
                                    style={{
                                        color: "#8c8c8c",
                                        fontSize: "13px",
                                    }}
                                >
                                    <CalendarOutlined
                                        style={{ marginRight: 6 }}
                                    />
                                    {new Date(
                                        item.createTime || "",
                                    ).toLocaleString()}
                                </div>,
                                <div
                                    key="publisher"
                                    style={{
                                        color: "#8c8c8c",
                                        fontSize: "13px",
                                    }}
                                >
                                    发布人：{item.userVO?.userName || "管理员"}
                                </div>,
                            ]}
                            extra={
                                (item.priority || 0) > 0 && (
                                    <Tag color="red">置顶</Tag>
                                )
                            }
                        >
                            <List.Item.Meta
                                title={
                                    <span
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 500,
                                            color: "#1f1f1f",
                                        }}
                                    >
                                        {item.title}
                                    </span>
                                }
                                description={
                                    <Paragraph
                                        ellipsis={{ rows: 2 }}
                                        style={{
                                            marginBottom: 0,
                                            color: "#595959",
                                        }}
                                    >
                                        {item.content}
                                    </Paragraph>
                                }
                            />
                        </List.Item>
                    )}
                />

                <div style={{ marginTop: "24px", textAlign: "right" }}>
                    <Pagination
                        current={current}
                        pageSize={pageSize}
                        total={total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showTotal={(total) => `共 ${total} 条`}
                    />
                </div>
            </Card>

            <Modal
                title={
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                        公告详情
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
                centered
            >
                {selectedAnnouncement && (
                    <div style={{ padding: "8px 0" }}>
                        <Title
                            level={4}
                            style={{
                                textAlign: "center",
                                marginBottom: "24px",
                            }}
                        >
                            {selectedAnnouncement.title}
                        </Title>

                        <div
                            style={{
                                marginBottom: "24px",
                                display: "flex",
                                justifyContent: "space-between",
                                borderBottom: "1px solid #f0f0f0",
                                paddingBottom: "12px",
                                color: "#8c8c8c",
                                fontSize: "13px",
                            }}
                        >
                            <span>
                                发布人:{" "}
                                {selectedAnnouncement.userVO?.userName ||
                                    "管理员"}
                            </span>
                            <span>
                                <CalendarOutlined style={{ marginRight: 6 }} />
                                {new Date(
                                    selectedAnnouncement.createTime || "",
                                ).toLocaleString()}
                            </span>
                        </div>

                        <div
                            style={{
                                fontSize: "15px",
                                lineHeight: "1.8",
                                color: "#262626",
                                whiteSpace: "pre-wrap",
                                minHeight: "200px",
                            }}
                        >
                            {selectedAnnouncement.content}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
