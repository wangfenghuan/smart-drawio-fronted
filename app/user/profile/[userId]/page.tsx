"use client"

import {
    ClockCircleOutlined,
    EditOutlined,
    IdcardOutlined,
    LoadingOutlined,
    MailOutlined,
    PlusOutlined,
    SafetyOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    Avatar,
    Button,
    Card,
    Descriptions,
    Divider,
    Form,
    Input,
    Modal,
    message,
    Spin,
    Tag,
    Typography,
    Upload,
} from "antd"
import type { UploadChangeParam } from "antd/es/upload"
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
    getUserVoById,
    updateMyUser,
    uploadAvataImage,
} from "@/api/userController"
import type { RootState } from "@/stores"

const { Title, Paragraph } = Typography
const { TextArea } = Input

export default function UserProfilePage() {
    const { message } = App.useApp()
    const params = useParams()
    const userId = params.userId as string
    const loginUser = useSelector((state: RootState) => state.loginUser)

    const [user, setUser] = useState<API.UserVO | null>(null)
    const [loading, setLoading] = useState(false)

    // 编辑相关状态
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [form] = Form.useForm()

    // 判断是否是当前登录用户的个人主页
    const isOwner =
        loginUser?.id && user?.id && String(loginUser.id) === String(user.id)

    // 加载用户信息
    const loadUserInfo = async () => {
        if (!userId) return

        setLoading(true)
        try {
            const response = await getUserVoById({
                id: userId,
            })

            // lib/request.ts 拦截器返回的是 data 本身
            const res = response as any
            if (res?.code === 0 && res?.data) {
                setUser(res.data)
            } else {
                message.error(res?.message || "获取用户信息失败")
            }
        } catch (error) {
            console.error("获取用户信息失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUserInfo()
    }, [userId])

    // 打开编辑模态框
    const handleEdit = () => {
        if (!user) return
        form.setFieldsValue({
            userName: user.userName,
            userAvatar: user.userAvatar,
            userProfile: user.userProfile,
        })
        setEditModalVisible(true)
    }

    // 提交编辑
    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields()
            setConfirmLoading(true)

            const response = await updateMyUser({
                ...values,
            })

            const res = response as any
            if (res?.code === 0) {
                message.success("修改成功")
                setEditModalVisible(false)
                loadUserInfo() // 刷新用户信息
            } else {
                message.error(res?.message || "修改失败")
            }
        } catch (error) {
            console.error("修改用户信息失败:", error)
            message.error("修改失败，请稍后重试")
        } finally {
            setConfirmLoading(false)
        }
    }

    // Upload Props
    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng =
            file.type === "image/jpeg" || file.type === "image/png"
        if (!isJpgOrPng) {
            message.error("You can only upload JPG/PNG file!")
        }
        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isLt5M) {
            message.error("Image must smaller than 5MB!")
        }
        return isJpgOrPng && isLt5M
    }

    const handleChange: UploadProps["onChange"] = async (
        info: UploadChangeParam<UploadFile>,
    ) => {
        if (info.file.status === "uploading") {
            setAvatarLoading(true)
            return
        }

        // Handle custom upload separately if needed, but here we use customRequest
        // actually for this API we might want to use customRequest to upload directly
    }

    const customRequest = async (options: any) => {
        const { file, onSuccess, onError } = options
        setAvatarLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await uploadAvataImage(formData)
            if (res.code === 0 && res.data) {
                form.setFieldValue("userAvatar", res.data)
                onSuccess(res.data)
                message.success("Upload successful")
            } else {
                onError(new Error(res.message))
                message.error("Upload failed: " + res.message)
            }
        } catch (err) {
            onError(err)
            message.error("Upload failed")
        } finally {
            setAvatarLoading(false)
        }
    }

    const uploadButton = (
        <div>
            {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    )

    // 获取角色标签颜色
    const getRoleColor = (role: string | undefined) => {
        switch (role) {
            case "admin":
                return "red"
            case "user":
                return "blue"
            default:
                return "default"
        }
    }

    // 获取角色文本
    const getRoleText = (role: string | undefined) => {
        switch (role) {
            case "admin":
                return "管理员"
            case "user":
                return "普通用户"
            case "notLogin":
                return "未登录"
            default:
                return role || "未知"
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f0f2f5",
                paddingBottom: "24px",
            }}
        >
            {/* 顶部背景图区域 */}
            <div
                style={{
                    height: "300px",
                    background:
                        "linear-gradient(to bottom, #40a9ff 0%, #f0f2f5 100%)",
                    marginBottom: "-100px",
                }}
            />

            <div
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    padding: "0 24px",
                }}
            >
                <Card
                    bordered={false}
                    loading={loading}
                    style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    }}
                    bodyStyle={{ padding: "32px" }}
                >
                    {!loading && user ? (
                        <div>
                            {/* 头部：头像与基本信息 */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "32px",
                                }}
                            >
                                <div style={{ display: "flex", gap: "24px" }}>
                                    <Avatar
                                        size={100}
                                        src={
                                            user.userAvatar ||
                                            "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
                                        }
                                        style={{
                                            border: "4px solid #fff",
                                            boxShadow:
                                                "0 2px 8px rgba(0,0,0,0.08)",
                                            backgroundColor: "#f5f5f5", // cleaner fallback
                                        }}
                                        icon={
                                            <UserOutlined
                                                style={{ color: "#bfbfbf" }}
                                            />
                                        }
                                    />
                                    <div style={{ paddingTop: "12px" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <Title
                                                level={3}
                                                style={{ marginBottom: 0 }}
                                            >
                                                {user.userName || "未命名用户"}
                                            </Title>
                                            <Tag
                                                color={getRoleColor(
                                                    user.userRole,
                                                )}
                                                style={{ margin: 0 }}
                                            >
                                                {getRoleText(user.userRole)}
                                            </Tag>
                                        </div>
                                        <div
                                            style={{
                                                color: "#666",
                                                fontSize: "14px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <SafetyOutlined
                                                style={{ marginRight: "6px" }}
                                            />
                                            {user.id}
                                        </div>
                                        {user.userProfile && (
                                            <Paragraph
                                                type="secondary"
                                                style={{
                                                    maxWidth: "500px",
                                                    marginBottom: 0,
                                                }}
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {user.userProfile}
                                            </Paragraph>
                                        )}
                                    </div>
                                </div>
                                {isOwner && (
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<EditOutlined />}
                                        onClick={handleEdit}
                                        style={{
                                            borderRadius: "6px",
                                            padding: "0 24px",
                                        }}
                                    >
                                        编辑资料
                                    </Button>
                                )}
                            </div>

                            <Divider />

                            {/* 详细信息列表 */}
                            <Descriptions
                                title="详细资料"
                                column={2}
                                size="middle"
                                labelStyle={{
                                    color: "#8c8c8c",
                                    width: "100px",
                                }}
                                contentStyle={{
                                    color: "#262626",
                                    fontWeight: 500,
                                }}
                            >
                                <Descriptions.Item
                                    label="用户名"
                                    labelStyle={{ alignItems: "center" }}
                                >
                                    <UserOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.userName || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="账号">
                                    <IdcardOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.userAccount || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="注册时间">
                                    <ClockCircleOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.createTime
                                        ? new Date(
                                              user.createTime,
                                          ).toLocaleString()
                                        : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="最后更新">
                                    <EditOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.updateTime
                                        ? new Date(
                                              user.updateTime,
                                          ).toLocaleString()
                                        : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="个人简介" span={2}>
                                    <div
                                        style={{
                                            whiteSpace: "pre-wrap",
                                            background: "#fafafa",
                                            padding: "12px",
                                            borderRadius: "6px",
                                            color: user.userProfile
                                                ? "#262626"
                                                : "#ccc",
                                        }}
                                    >
                                        {user.userProfile ||
                                            "这个人很懒，什么都没有写~"}
                                    </div>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    ) : (
                        !loading && (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "80px 0",
                                }}
                            >
                                <UserOutlined
                                    style={{
                                        fontSize: "64px",
                                        color: "#d9d9d9",
                                        marginBottom: "16px",
                                    }}
                                />
                                <p style={{ color: "#999", fontSize: "16px" }}>
                                    未找到用户信息
                                </p>
                            </div>
                        )
                    )}
                </Card>
            </div>

            {/* 编辑用户信息模态框 */}
            <Modal
                title="编辑个人信息"
                open={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
                confirmLoading={confirmLoading}
                destroyOnClose
                centered
                maskClosable={false}
                width={560}
            >
                <div style={{ padding: "12px 0" }}>
                    <Form
                        form={form}
                        layout="vertical"
                        preserve={false}
                        initialValues={{
                            userName: user?.userName,
                            userAvatar: user?.userAvatar,
                            userProfile: user?.userProfile,
                        }}
                    >
                        <Form.Item
                            label="用户昵称"
                            name="userName"
                            rules={[
                                { required: true, message: "请输入用户昵称" },
                            ]}
                        >
                            <Input
                                placeholder="给取个好听的名字吧"
                                maxLength={20}
                                size="large"
                            />
                        </Form.Item>
                        <Form.Item label="头像">
                            <Form.Item name="userAvatar" noStyle hidden>
                                <Input />
                            </Form.Item>
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                customRequest={customRequest}
                            >
                                {form.getFieldValue("userAvatar") ? (
                                    <img
                                        src={form.getFieldValue("userAvatar")}
                                        alt="avatar"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                    />
                                ) : (
                                    uploadButton
                                )}
                            </Upload>
                        </Form.Item>
                        <Form.Item label="个人简介" name="userProfile">
                            <TextArea
                                placeholder="介绍一下你自己..."
                                maxLength={500}
                                rows={4}
                                showCount
                                size="large"
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </div>
    )
}
