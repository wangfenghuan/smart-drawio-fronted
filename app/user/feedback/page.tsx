"use client"

import { HistoryOutlined, MessageOutlined } from "@ant-design/icons"
import { PageContainer } from "@ant-design/pro-components"
import { Card, Tabs } from "antd"
import type React from "react"
import { useState } from "react"
import { FeedbackList } from "@/components/user/feedback/FeedbackList"
import { FeedbackSubmitForm } from "@/components/user/feedback/FeedbackSubmitForm"

const FeedbackPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("submit")

    const items = [
        {
            key: "submit",
            label: (
                <span>
                    <MessageOutlined />
                    提交反馈
                </span>
            ),
            children: (
                <FeedbackSubmitForm onSuccess={() => setActiveTab("history")} />
            ),
        },
        {
            key: "history",
            label: (
                <span>
                    <HistoryOutlined />
                    我的反馈
                </span>
            ),
            children: <FeedbackList active={activeTab === "history"} />,
        },
    ]

    return (
        <PageContainer title="意见反馈">
            <Card
                style={{
                    borderRadius: 8,
                    marginBottom: 24,
                }}
                bodyStyle={{
                    padding: "0 24px 24px 24px",
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    size="large"
                    tabBarStyle={{
                        marginBottom: 24,
                    }}
                />
            </Card>
        </PageContainer>
    )
}

export default FeedbackPage
