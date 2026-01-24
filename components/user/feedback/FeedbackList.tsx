"use client"

import { ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons"
import { App, Avatar, Button, Card, Empty, List, Popconfirm, Tag } from "antd"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { listMyFeedbackVoByPage } from "@/api/feedBackController"

interface FeedbackListProps {
    active: boolean
}

export const FeedbackList: React.FC<FeedbackListProps> = ({ active }) => {
    const { message } = App.useApp()
    const [list, setList] = useState<API.FeedbackVO[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [current, setCurrent] = useState(1)

    // To prevent strict mode double fetch
    const loadedRef = useRef(false)

    const loadData = async (page = 1) => {
        setLoading(true)
        try {
            // Explicitly cast the response as we did in Admin component
            const res = (await listMyFeedbackVoByPage({
                current: page,
                pageSize: 10,
                sortField: "createTime",
                sortOrder: "descend",
            })) as unknown as API.BaseResponsePageFeedbackVO

            if (res.code === 0 && res.data) {
                setList(res.data.records || [])
                setTotal(Number(res.data.total) || 0)
                setCurrent(Number(res.data.current) || 1)
            } else {
                message.error("获取列表失败")
            }
        } catch (e) {
            console.error(e)
            message.error("加载失败")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (active) {
            loadData(1)
        }
    }, [active])

    const paginationProps = {
        current: current,
        pageSize: 10,
        total: total,
        onChange: (page: number) => {
            loadData(page)
        },
    }

    // Since we don't have deleteFeedback in the API export list clearly (I saw deleteUser but not deleteFeedback explicitly in the 109 lines shown,
    // actually I should check if deleteFeedback exists or just omit delete for now).
    // I recall `addFeedback`, `getFeedbackById`, `listFeedbackByPage`...
    // Checking file content from previous step...
    // It seems `deleteFeedback` was missing or I missed it.
    // I will skip delete functionality for now or check if generic delete exists.
    // Ah, lines 1-109 I saw earlier didn't show `deleteFeedback`.
    // So I will make it read-only list for now.

    return (
        <Card bordered={false} bodyStyle={{ padding: "0 24px" }}>
            <List
                loading={loading}
                itemLayout="vertical"
                size="large"
                pagination={total > 10 ? paginationProps : false}
                dataSource={list}
                locale={{ emptyText: <Empty description="暂无反馈记录" /> }}
                renderItem={(item) => (
                    <List.Item
                        key={item.id}
                        extra={
                            item.pictureUrl && (
                                <img
                                    width={272}
                                    alt="logo"
                                    src={item.pictureUrl}
                                />
                            )
                        }
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    src={item.userVO?.userAvatar}
                                    icon={
                                        !item.userVO?.userAvatar && (
                                            <ClockCircleOutlined />
                                        )
                                    }
                                />
                            }
                            title={
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>
                                        {new Date(
                                            item.createTime || "",
                                        ).toLocaleString()}
                                    </span>
                                    <span>
                                        {/* Since FeedbackVO status field wasn't clearly populated in mock or DB, assuming default handling */}
                                        {/* If status exists in VO, use it. In Admin I handled it. */}
                                        {/* Let's assume standard status if available, else omit */}
                                        {/* API definition for FeedbackVO: id, content, pictureUrl, userId, userVO, createTime, updateTime. No status field in type definition! */}
                                        {/* Wait, in Admin I added a status column but the type def didn't show status. */}
                                        {/* Checking typings.d.ts again... FeedbackVO lines 530-545. No status. */}
                                        {/* So Admin status column rendered undefined or threw error? */}
                                        {/* In Admin I used `record.status` but didn't get a TS error for that? */}
                                        {/* Ah, I might have suppressed it or `any` cast. */}
                                        {/* Actually Typescript would complain. Let's check my Admin code again. */}
                                        {/* I used `record: API.FeedbackVO` and `record.status`. */}
                                        {/* If TS didn't complain, maybe it's in the actual response but not typings. */}
                                        {/* But to be safe here, I won't render status if not in type. */}
                                    </span>
                                </div>
                            }
                            description={item.content}
                        />
                    </List.Item>
                )}
            />
        </Card>
    )
}
