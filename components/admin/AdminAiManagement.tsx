"use client"

import {
    ClockCircleOutlined,
    PoweroffOutlined,
    RobotOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    Badge,
    Button,
    Card,
    Col,
    Input,
    InputNumber,
    Layout,
    Row,
    Space,
    Statistic,
    Switch,
    Typography,
    message,
} from "antd"
import React, { useEffect, useState } from "react"
import {
    getAiUsage,
    getGlobalAiStatus,
    getUserAiStatus,
    resumeAi,
    shutdownAi,
    toggleUserAi,
} from "@/api/systemAdminController"

const { Title, Text, Paragraph } = Typography
const { Content } = Layout

export function AdminAiManagement() {
    const [globalAiEnabled, setGlobalAiEnabled] = useState<boolean>(true)
    const [aiUsage, setAiUsage] = useState<string>("0")
    const [loading, setLoading] = useState<boolean>(false)
    const [userId, setUserId] = useState<number | undefined>()
    const [userAiStatus, setUserAiStatus] = useState<boolean | null>(null)
    const [userLoading, setUserLoading] = useState<boolean>(false)

    useEffect(() => {
        fetchGlobalStatus()
        fetchAiUsage()
    }, [])

    const fetchGlobalStatus = async () => {
        try {
            const res = await getGlobalAiStatus()
            if (res.data !== undefined) {
                setGlobalAiEnabled(res.data)
            }
        } catch (error) {
            message.error("获取全局AI状态失败")
        }
    }

    const fetchAiUsage = async () => {
        try {
            const res = await getAiUsage()
            if (res.data) {
                setAiUsage(res.data)
            }
        } catch (error) {
            // message.error("获取AI使用量失败")
            // error silently for usage as it might not be critical
        }
    }

    const handleGlobalSwitch = async (checked: boolean) => {
        setLoading(true)
        try {
            if (checked) {
                await resumeAi()
                message.success("AI服务已全局启用")
            } else {
                await shutdownAi()
                message.success("AI服务已全局禁用")
            }
            setGlobalAiEnabled(checked)
        } catch (error) {
            message.error("操作失败")
            // revert switch if failed
            fetchGlobalStatus()
        } finally {
            setLoading(false)
        }
    }

    const handleUserSearch = async () => {
        if (!userId) {
            message.warning("请输入用户ID")
            return
        }
        setUserLoading(true)
        try {
            const res = await getUserAiStatus({ userId })
            if (res.data !== undefined) {
                setUserAiStatus(res.data)
                message.success(`用户 ${userId} 状态已获取`)
            }
        } catch (error) {
            message.error("获取用户AI状态失败")
        } finally {
            setUserLoading(false)
        }
    }

    const handleUserSwitch = async (checked: boolean) => {
        if (!userId) {
            return
        }
        setUserLoading(true)
        try {
            await toggleUserAi({ userId, enable: checked })
            message.success(
                `用户 ${userId} 的AI服务已${checked ? "启用" : "禁用"}`,
            )
            setUserAiStatus(checked)
        } catch (error) {
            message.error("操作失败")
        } finally {
            setUserLoading(false)
        }
    }

    return (
        <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    <RobotOutlined style={{ marginRight: 8 }} />
                    AI 服务管理
                </Title>
                <Paragraph type="secondary">
                    管理全站 AI 服务的开关状态以及单个用户的 AI 使用权限。
                </Paragraph>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={8}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="AI 服务总使用量"
                            value={aiUsage}
                            prefix={<ClockCircleOutlined />}
                        />
                         <div style={{ marginTop: 16 }}>
                            <Badge
                                status={globalAiEnabled ? "success" : "error"}
                                text={
                                    globalAiEnabled
                                        ? "AI 服务运行中"
                                        : "AI 服务已停止"
                                }
                            />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12} lg={16}>
                    <Card
                        title="全局控制"
                        bordered={false}
                        extra={<PoweroffOutlined />}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Space direction="vertical">
                                <Text strong>全局开关</Text>
                                <Text type="secondary">
                                    控制整个系统的 AI
                                    服务。关闭后所有用户将无法使用 AI 功能。
                                </Text>
                            </Space>
                            <Switch
                                checked={globalAiEnabled}
                                onChange={handleGlobalSwitch}
                                loading={loading}
                                checkedChildren="开启"
                                unCheckedChildren="关闭"
                                size="default"
                            />
                        </div>
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="用户权限管理" bordered={false}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Text>查询并设置指定用户的 AI 权限：</Text>
                            <Space wrap>
                                <InputNumber
                                    prefix={<UserOutlined />}
                                    placeholder="输入用户ID"
                                    style={{ width: 200 }}
                                    min={1}
                                    value={userId}
                                    onChange={(val) =>
                                        setUserId(val ? Number(val) : undefined)
                                    }
                                    onPressEnter={handleUserSearch}
                                />
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleUserSearch}
                                    loading={userLoading}
                                >
                                    查询状态
                                </Button>
                            </Space>

                            {userAiStatus !== null && (
                                <div
                                    style={{
                                        marginTop: 24,
                                        padding: 16,
                                        background: "#fafafa",
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 24,
                                    }}
                                >
                                    <Space>
                                        <Text strong>用户 {userId}：</Text>
                                        <Badge
                                            status={
                                                userAiStatus
                                                    ? "success"
                                                    : "warning"
                                            }
                                            text={
                                                userAiStatus
                                                    ? "允许使用"
                                                    : "禁止使用"
                                            }
                                        />
                                    </Space>
                                    <Switch
                                        checked={userAiStatus}
                                        onChange={handleUserSwitch}
                                        loading={userLoading}
                                        checkedChildren="启用"
                                        unCheckedChildren="禁用"
                                    />
                                </div>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>
        </Content>
    )
}
