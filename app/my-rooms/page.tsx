"use client"

import {
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderOutlined,
    LoadingOutlined,
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Empty,
    Form,
    Input,
    Modal,
    Pagination,
    Popconfirm,
    Select,
    Spin,
    Tag,
    Tooltip,
} from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
    deleteDiagramRoom,
    editDiagramRoom,
    getDiagramRoomVoById,
    listMyDiagramRoomVoByPage,
} from "@/api/roomController"
import { listMySpaceVoByPage } from "@/api/spaceController"

const { Search } = Input
const { TextArea } = Input

export default function MyRoomsPage() {
    // 使用 App 包裹获取上下文 message
    const { message } = App.useApp()
    const router = useRouter()

    const [rooms, setRooms] = useState<API.RoomVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editingRoom, setEditingRoom] = useState<API.RoomVO | null>(null)
    const [editForm] = Form.useForm()
    const [loadingRoomDetail, setLoadingRoomDetail] = useState(false)

    // 添加防重复请求的标记
    const isLoadingRef = useRef(false)

    // 空间相关状态
    const [spaces, setSpaces] = useState<API.SpaceVO[]>([])
    const [filteredSpaces, setFilteredSpaces] = useState<API.SpaceVO[]>([])
    const [selectedSpaceId, setSelectedSpaceId] = useState<number | undefined>(
        undefined,
    )

    // 加载空间列表
    const loadSpaces = async () => {
        try {
            const response = await listMySpaceVoByPage({
                current: 1,
                pageSize: 100, // 获取所有空间
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                const allSpaces = response.data.records || []
                setSpaces(allSpaces)

                // 添加"全部空间"选项
                setFilteredSpaces(allSpaces)
            }
        } catch (error) {
            console.error("加载空间列表失败:", error)
        }
    }

    // 加载房间列表
    const loadRooms = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        // 防止重复请求
        if (isLoadingRef.current) {
            return
        }
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await listMyDiagramRoomVoByPage({
                current: current,
                pageSize: pageSize,
                ...(searchText && { searchText: searchText }),
                ...(selectedSpaceId !== undefined && {
                    spaceId: selectedSpaceId,
                }),
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

                setRooms(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error(
                    "获取房间列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载房间列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadSpaces()
        loadRooms()
    }, [])

    // 搜索触发
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadRooms(1, pagination.pageSize)
    }

    // 空间筛选变化
    const handleSpaceFilterChange = (spaceId: number | undefined) => {
        setSelectedSpaceId(spaceId)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadRooms(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadRooms(page, pageSize)
    }

    // 跳转到协作编辑页面
    const handleJoinRoom = (room: API.RoomVO) => {
        // 优先使用后端返回的 roomUrl（包含加密密钥），如果没有则拼接本地路由
        const targetUrl =
            room.roomUrl || `/diagram/edit/${room.diagramId}/room/${room.id}`

        router.push(targetUrl)
    }

    // 删除房间
    const handleDeleteRoom = async (id: string | undefined) => {
        if (!id) return

        try {
            const response = await deleteDiagramRoom({ id: id as any })
            if (response?.code === 0) {
                message.success("删除成功")
                loadRooms()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除房间失败:", error)
            message.error("删除操作异常")
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = async (room: API.RoomVO) => {
        if (!room.id) return

        setLoadingRoomDetail(true)
        setEditModalVisible(true)

        try {
            // 从后端查询房间详情，确保数据是最新的
            const response = await getDiagramRoomVoById({
                id: room.id as any,
            })

            if (response?.code === 0 && response?.data) {
                const roomData = response.data
                setEditingRoom(roomData)

                // 设置表单值
                editForm.setFieldsValue({
                    roomName: roomData.roomName,
                    isPublic: roomData.isPublic,
                    isOpen: roomData.isOpen,
                    accessKey: roomData.accessKey,
                })
                setLoadingRoomDetail(false)
            } else {
                message.error(response?.message || "获取房间详情失败")
                setEditModalVisible(false)
                setLoadingRoomDetail(false)
            }
        } catch (error) {
            console.error("获取房间详情失败:", error)
            message.error("获取房间详情失败，请稍后重试")
            setEditModalVisible(false)
            setLoadingRoomDetail(false)
        }
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await editDiagramRoom({
                id: editingRoom?.id,
                ...values,
            })

            if (response?.code === 0) {
                message.success("保存成功")
                setEditModalVisible(false)
                loadRooms()
            } else {
                message.error(response?.message || "保存失败")
            }
        } catch (error) {
            console.error("保存失败:", error)
            if (!error.errorFields) {
                message.error("保存失败")
            }
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
                            <TeamOutlined
                                style={{ fontSize: "20px", color: "#1890ff" }}
                            />
                            <span style={{ fontSize: "18px", fontWeight: 600 }}>
                                我的协作房间
                            </span>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => router.push("/my-diagrams")}
                            style={{ borderRadius: "6px" }}
                        >
                            新建房间
                        </Button>
                    </div>
                }
            >
                {/* 搜索栏和空间筛选 */}
                <div
                    style={{
                        marginBottom: "24px",
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                    }}
                >
                    <Search
                        placeholder="搜索房间名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: "400px" }}
                    />
                    <Select
                        placeholder="选择空间筛选"
                        allowClear
                        size="large"
                        style={{ width: "200px" }}
                        onChange={handleSpaceFilterChange}
                        value={selectedSpaceId}
                    >
                        {spaces.map((space) => (
                            <Select.Option key={space.id} value={space.id}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <FolderOutlined />
                                    {space.spaceName || "未命名空间"}
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                {/* 房间列表 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {loading ? (
                        // 骨架屏占位
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
                    ) : rooms.length === 0 ? (
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
                                            暂无协作房间
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#999",
                                                marginBottom: "16px",
                                            }}
                                        >
                                            在图表编辑页面开启协作后，房间会自动显示在这里
                                        </p>
                                        <Button
                                            type="primary"
                                            onClick={() =>
                                                router.push("/my-diagrams")
                                            }
                                        >
                                            去创建第一个协作房间
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <Card
                                key={room.id}
                                hoverable
                                style={{
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                }}
                                bodyStyle={{ padding: "16px" }}
                                onClick={() => handleJoinRoom(room)}
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
                                        title={room.roomName}
                                    >
                                        {room.roomName || "未命名房间"}
                                    </h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            fontSize: "12px",
                                            color: "#999",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        <ClockCircleOutlined />
                                        <span>
                                            {room.createTime
                                                ? new Date(
                                                      room.createTime,
                                                  ).toLocaleString()
                                                : "未知时间"}
                                        </span>
                                    </div>
                                </div>

                                {/* 房间信息卡片 */}
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
                                            {room.userVO?.userName ||
                                                room.ownerId ||
                                                "未知"}
                                        </span>
                                    </div>
                                    {room.spaceId && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontSize: "12px",
                                                color: "#666",
                                            }}
                                        >
                                            <FolderOutlined />
                                            <span
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    flex: 1,
                                                }}
                                            >
                                                私有空间 - ID: {room.spaceId}
                                            </span>
                                        </div>
                                    )}
                                    {!room.spaceId && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontSize: "12px",
                                                color: "#52c41a",
                                            }}
                                        >
                                            <TeamOutlined />
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
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "12px",
                                            color: "#666",
                                        }}
                                    >
                                        <TeamOutlined />
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                flex: 1,
                                            }}
                                        >
                                            房间 ID: {room.id || "-"}
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
                                    <Tooltip title="进入协作">
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleJoinRoom(room)
                                            }}
                                        >
                                            进入
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="修改信息">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenEditModal(room)
                                            }}
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="删除房间"
                                        description="确定要删除这个协作房间吗？删除后协 作数据将无法恢复。"
                                        onConfirm={(e) => {
                                            e?.stopPropagation()
                                            handleDeleteRoom(
                                                room.id?.toString(),
                                            )
                                        }}
                                        onCancel={(e) => e?.stopPropagation()}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Popconfirm>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* 分页组件 */}
                {!loading && (
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

            {/* 编辑信息模态框 */}
            <Modal
                title="编辑房间信息"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => {
                    setEditModalVisible(false)
                    editForm.resetFields()
                }}
                okText="保存"
                cancelText="取消"
                destroyOnClose
                forceRender
            >
                <Spin
                    spinning={loadingRoomDetail}
                    indicator={<LoadingOutlined spin />}
                >
                    <Form form={editForm} layout="vertical" preserve={false}>
                        <Form.Item
                            label="房间名称"
                            name="roomName"
                            rules={[
                                { required: true, message: "请输入房间名称" },
                            ]}
                        >
                            <Input placeholder="请输入房间名称" />
                        </Form.Item>
                        <Form.Item
                            label="是否公开"
                            name="isPublic"
                            tooltip="0=公开，任何人可见；1=私有，仅创建者可见"
                        >
                            <Input type="number" placeholder="0=公开, 1=私有" />
                        </Form.Item>
                        <Form.Item
                            label="是否开启"
                            name="isOpen"
                            tooltip="0=开启，正常使用；1=关闭，暂停服务"
                        >
                            <Input type="number" placeholder="0=开启, 1=关闭" />
                        </Form.Item>
                        <Form.Item
                            label="访问密码"
                            name="accessKey"
                            tooltip="房间访问密码（可选）"
                        >
                            <Input placeholder="请输入访问密码（可选）" />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </div>
    )
}
