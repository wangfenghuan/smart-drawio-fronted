"use client"

import {
    CloudServerOutlined,
    DatabaseOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    FolderOutlined,
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
    UserSwitchOutlined,
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
    Radio,
    Select,
    Space,
    Statistic,
    Tag,
    Tooltip,
} from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
    addSpace,
    deleteSpace,
    editSpace,
    getSpaceVoById,
    listJoinedSpaceVoByPage,
    listMySpaceVoByPage,
    listSpaceLevel,
} from "@/api/spaceController"
import { TeamSpaceMemberManager } from "@/components/team-space-member-manager"
import { calculatePercentage, formatFileSize, toNumber } from "@/lib/utils"

const { Search } = Input

// 空间类型枚举
enum SpaceType {
    PERSONAL = 0, // 个人空间
    TEAM = 1, // 团队空间
}

export default function MySpacesPage() {
    const { message: antMessage } = App.useApp()
    const router = useRouter()

    const [spaces, setSpaces] = useState<API.SpaceVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [spaceTypeFilter, setSpaceTypeFilter] = useState<number | undefined>(
        undefined,
    )
    const [spaceSourceFilter, setSpaceSourceFilter] = useState<
        "created" | "joined"
    >("created")
    const [createModalVisible, setCreateModalVisible] = useState(false)
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [memberManageVisible, setMemberManageVisible] = useState(false)
    const [memberManageSpace, setMemberManageSpace] =
        useState<API.SpaceVO | null>(null)
    const [_editingSpace, setEditingSpace] = useState<API.SpaceVO | null>(null)
    const [viewingSpace, setViewingSpace] = useState<API.SpaceVO | null>(null)
    const [spaceLevels, setSpaceLevels] = useState<API.SpaceLevel[]>([])

    const [createForm] = Form.useForm()
    const [editForm] = Form.useForm()

    // 获取空间类型显示信息
    const getSpaceTypeDisplay = (type?: number) => {
        if (type === SpaceType.TEAM) {
            return {
                text: "团队空间",
                color: "green",
                icon: <TeamOutlined />,
            }
        }
        return {
            text: "个人空间",
            color: "default",
            icon: <UserOutlined />,
        }
    }

    // 添加防重复请求的标记
    const isLoadingRef = useRef(false)
    const isLevelsLoadingRef = useRef(false)

    // 加载空间级别列表
    const loadSpaceLevels = async () => {
        // 防止重复请求
        if (isLevelsLoadingRef.current) {
            return
        }
        isLevelsLoadingRef.current = true

        try {
            const response = await listSpaceLevel()
            if (response?.code === 0 && response?.data) {
                setSpaceLevels(response.data)
            }
        } catch (error) {
            console.error("加载空间级别失败:", error)
        } finally {
            isLevelsLoadingRef.current = false
        }
    }

    // 根据级别值获取级别信息
    const getSpaceLevelInfo = (level: number) => {
        return spaceLevels.find((item) => item.value === level)
    }

    // 获取级别的显示信息（带降级处理）
    const getSpaceLevelDisplay = (level: number) => {
        const levelInfo = getSpaceLevelInfo(level)
        if (levelInfo) {
            return {
                text: levelInfo.text,
                color: level === 0 ? "default" : level === 1 ? "blue" : "gold",
            }
        }
        // 降级处理：如果API没有返回，使用硬编码的默认值
        return level === 0
            ? { text: "普通版", color: "default" }
            : level === 1
              ? { text: "专业版", color: "blue" }
              : { text: "旗舰版", color: "gold" }
    }

    // 加载空间列表
    const loadSpaces = async (
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
            // 根据空间来源筛选调用不同的API
            // 注意：后端接口功能是反的
            // - listMySpaceVoByPage (/space/my/list/page/vo) 实际查询的是"我加入的"
            // - listJoinedSpaceVoByPage (/space/joined/list/page/vo) 实际查询的是"我创建的"
            const response =
                spaceSourceFilter === "created"
                    ? await listJoinedSpaceVoByPage({
                          current: current,
                          pageSize: pageSize,
                          ...(searchText && { spaceName: searchText }),
                          ...(spaceTypeFilter !== undefined && {
                              spaceType: spaceTypeFilter,
                          }),
                          sortField: "createTime",
                          sortOrder: "desc",
                      })
                    : await listMySpaceVoByPage({
                          current: current,
                          pageSize: pageSize,
                          ...(searchText && { spaceName: searchText }),
                          ...(spaceTypeFilter !== undefined && {
                              spaceType: spaceTypeFilter,
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

                setSpaces(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                antMessage.error(
                    "获取空间列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载空间列表失败:", error)
            antMessage.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadSpaces()
        loadSpaceLevels()
    }, [])

    // 搜索触发
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadSpaces(1, pagination.pageSize)
    }

    // 空间类型筛选触发
    const handleSpaceTypeFilter = (value: number | undefined) => {
        setSpaceTypeFilter(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadSpaces(1, pagination.pageSize)
    }

    // 空间来源筛选触发
    const handleSpaceSourceFilter = (value: "created" | "joined") => {
        setSpaceSourceFilter(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadSpaces(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadSpaces(page, pageSize)
    }

    // 打开创建模态框
    const handleOpenCreateModal = () => {
        createForm.resetFields()
        setCreateModalVisible(true)
    }

    // 创建空间
    const handleCreateSpace = async () => {
        try {
            const values = await createForm.validateFields()
            const response = await addSpace(values)

            if (response?.code === 0) {
                antMessage.success("创建成功")
                setCreateModalVisible(false)
                loadSpaces()
            } else {
                antMessage.error(response?.message || "创建失败")
            }
        } catch (error) {
            console.error("创建空间失败:", error)
            if (!error.errorFields) {
                antMessage.error("创建失败")
            }
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = (space: API.SpaceVO) => {
        setEditingSpace(space)
        editForm.setFieldsValue({
            id: space.id,
            spaceName: space.spaceName,
        })
        setEditModalVisible(true)
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            // 先验证表单
            await editForm.validateFields()
            // 获取所有字段值（包括隐藏字段）
            const values = editForm.getFieldsValue(true) // true 参数表示获取所有字段，包括未设置的
            console.log("[编辑空间] 提交的值:", values)

            if (!values.id) {
                antMessage.error("空间ID缺失，请重新操作")
                return
            }

            const response = await editSpace(values)

            if (response?.code === 0) {
                antMessage.success("保存成功")
                setEditModalVisible(false)
                loadSpaces()
            } else {
                antMessage.error(response?.message || "保存失败")
            }
        } catch (error) {
            console.error("保存失败:", error)
            if (!error.errorFields) {
                antMessage.error("保存失败")
            }
        }
    }

    // 删除空间
    const handleDeleteSpace = async (id: string | undefined) => {
        if (!id) return

        try {
            const response = await deleteSpace({ id })
            if (response?.code === 0) {
                antMessage.success("删除成功")
                loadSpaces()
            } else {
                antMessage.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除空间失败:", error)
            antMessage.error("删除操作异常")
        }
    }

    // 查看空间详情
    const handleViewDetail = async (space: API.SpaceVO) => {
        try {
            const response = await getSpaceVoById({ id: space.id })
            if (response?.code === 0 && response?.data) {
                setViewingSpace(response.data)
                setDetailModalVisible(true)
            } else {
                antMessage.error("获取空间详情失败")
            }
        } catch (error) {
            console.error("获取空间详情失败:", error)
            antMessage.error("系统繁忙，请稍后重试")
        }
    }

    // 查看空间内的图表
    const handleViewDiagrams = (spaceId: string) => {
        router.push(`/my-spaces/${spaceId}/diagrams`)
    }

    // 打开成员管理
    const handleOpenMemberManage = (space: API.SpaceVO) => {
        setMemberManageSpace(space)
        setMemberManageVisible(true)
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
                            <FolderOutlined
                                style={{ fontSize: "20px", color: "#1890ff" }}
                            />
                            <span style={{ fontSize: "18px", fontWeight: 600 }}>
                                我的空间
                            </span>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleOpenCreateModal}
                            style={{ borderRadius: "6px" }}
                        >
                            创建空间
                        </Button>
                    </div>
                }
            >
                {/* 搜索栏 */}
                <div
                    style={{
                        marginBottom: "24px",
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <Search
                        placeholder="搜索空间名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: "400px" }}
                    />
                    <Radio.Group
                        value={spaceSourceFilter}
                        onChange={(e) =>
                            handleSpaceSourceFilter(e.target.value)
                        }
                        size="large"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="joined">
                            <Space size="small">
                                <UserSwitchOutlined />
                                我加入的
                            </Space>
                        </Radio.Button>
                        <Radio.Button value="created">
                            <Space size="small">
                                <UserOutlined />
                                我创建的
                            </Space>
                        </Radio.Button>
                    </Radio.Group>
                    <Select
                        placeholder="筛选空间类型"
                        allowClear
                        size="large"
                        style={{ width: "150px" }}
                        onChange={handleSpaceTypeFilter}
                        value={spaceTypeFilter}
                    >
                        <Select.Option value={SpaceType.PERSONAL}>
                            <Space size="small">
                                <UserOutlined />
                                个人空间
                            </Space>
                        </Select.Option>
                        <Select.Option value={SpaceType.TEAM}>
                            <Space size="small">
                                <TeamOutlined />
                                团队空间
                            </Space>
                        </Select.Option>
                    </Select>
                </div>

                {/* 空间列表 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(320px, 1fr))",
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
                    ) : spaces.length === 0 ? (
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
                                            暂无空间
                                        </p>
                                        <Button
                                            type="link"
                                            onClick={handleOpenCreateModal}
                                        >
                                            去创建第一个空间
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        spaces.map((space) => {
                            const levelConfig = getSpaceLevelDisplay(
                                space.spaceLevel || 0,
                            )
                            const typeConfig = getSpaceTypeDisplay(
                                space.spaceType,
                            )
                            const countPercent = calculatePercentage(
                                toNumber(space.totalCount),
                                toNumber(space.maxCount),
                            )
                            const sizePercent = calculatePercentage(
                                toNumber(space.totalSize),
                                toNumber(space.maxSize),
                            )

                            return (
                                <Card
                                    key={space.id}
                                    hoverable
                                    style={{
                                        borderRadius: "8px",
                                    }}
                                    bodyStyle={{ padding: "20px" }}
                                >
                                    {/* 空间标题 */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h3
                                                style={{
                                                    fontSize: "16px",
                                                    fontWeight: 600,
                                                    marginBottom: "8px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                                title={space.spaceName}
                                            >
                                                {space.spaceName ||
                                                    "未命名空间"}
                                            </h3>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <Tag
                                                    color={levelConfig.color}
                                                    icon={
                                                        levelConfig.color !==
                                                        "default" ? undefined : (
                                                            <UserOutlined />
                                                        )
                                                    }
                                                >
                                                    {levelConfig.text}
                                                </Tag>
                                                <Tag
                                                    color={typeConfig.color}
                                                    icon={typeConfig.icon}
                                                >
                                                    {typeConfig.text}
                                                </Tag>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                            }}
                                        >
                                            <Tooltip title="查看图表">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<FileTextOutlined />}
                                                    onClick={() =>
                                                        handleViewDiagrams(
                                                            space.id!,
                                                        )
                                                    }
                                                />
                                            </Tooltip>
                                            {space.spaceType ===
                                                SpaceType.TEAM && (
                                                <Tooltip title="成员管理">
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        icon={<TeamOutlined />}
                                                        onClick={() =>
                                                            handleOpenMemberManage(
                                                                space,
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            )}
                                            <Tooltip title="查看详情">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={
                                                        <CloudServerOutlined />
                                                    }
                                                    onClick={() =>
                                                        handleViewDetail(space)
                                                    }
                                                />
                                            </Tooltip>
                                            <Tooltip title="编辑">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    onClick={() =>
                                                        handleOpenEditModal(
                                                            space,
                                                        )
                                                    }
                                                />
                                            </Tooltip>
                                            <Popconfirm
                                                title="删除空间"
                                                description="确定要删除这个空间吗？空间内的所有图表也会被删除。"
                                                onConfirm={() =>
                                                    handleDeleteSpace(space.id)
                                                }
                                                okText="确定"
                                                cancelText="取消"
                                            >
                                                <Button
                                                    danger
                                                    size="small"
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                />
                                            </Popconfirm>
                                        </div>
                                    </div>

                                    {/* 配额统计 */}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "16px",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#666",
                                                    marginBottom: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <FileTextOutlined />
                                                图表数量
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "20px",
                                                    fontWeight: 600,
                                                    color:
                                                        countPercent > 90
                                                            ? "#ff4d4f"
                                                            : "#1890ff",
                                                }}
                                            >
                                                {toNumber(space.totalCount)} /{" "}
                                                {toNumber(space.maxCount)}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#666",
                                                    marginBottom: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <DatabaseOutlined />
                                                存储空间
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "20px",
                                                    fontWeight: 600,
                                                    color:
                                                        sizePercent > 90
                                                            ? "#ff4d4f"
                                                            : "#1890ff",
                                                }}
                                            >
                                                {formatFileSize(
                                                    space.totalSize,
                                                )}{" "}
                                                /{" "}
                                                {formatFileSize(space.maxSize)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 进度条 */}
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#999",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            创建时间：
                                            {space.createTime
                                                ? new Date(
                                                      space.createTime,
                                                  ).toLocaleString()
                                                : "未知"}
                                        </div>
                                        {space.userVO && (
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#666",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <UserOutlined />
                                                <span>
                                                    创建者:{" "}
                                                    {space.userVO.userName ||
                                                        space.userId ||
                                                        "未知"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* 分页组件 */}
                {!loading && spaces.length > 0 && (
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
                            pageSizeOptions={["12", "24", "48"]}
                            showTotal={(total) => `共 ${total} 条`}
                        />
                    </div>
                )}
            </Card>

            {/* 创建空间模态框 */}
            <Modal
                title="创建空间"
                open={createModalVisible}
                onOk={handleCreateSpace}
                onCancel={() => setCreateModalVisible(false)}
                okText="创建"
                cancelText="取消"
                destroyOnClose
                width={500}
            >
                <Form form={createForm} layout="vertical" preserve={false}>
                    <Form.Item
                        label="空间名称"
                        name="spaceName"
                        rules={[
                            { required: true, message: "请输入空间名称" },
                            { max: 50, message: "空间名称最多50个字符" },
                        ]}
                    >
                        <Input placeholder="请输入空间名称" />
                    </Form.Item>

                    <Form.Item
                        label="空间类型"
                        name="spaceType"
                        rules={[{ required: true, message: "请选择空间类型" }]}
                        initialValue={SpaceType.PERSONAL}
                    >
                        <Radio.Group style={{ width: "100%" }}>
                            <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                            >
                                <Radio value={SpaceType.PERSONAL}>
                                    <Space>
                                        <span>个人空间</span>
                                        <span
                                            style={{
                                                color: "#999",
                                                fontSize: "12px",
                                            }}
                                        >
                                            仅供个人使用
                                        </span>
                                    </Space>
                                </Radio>
                                <Radio value={SpaceType.TEAM}>
                                    <Space>
                                        <span>团队空间</span>
                                        <span
                                            style={{
                                                color: "#999",
                                                fontSize: "12px",
                                            }}
                                        >
                                            可邀请团队成员协作
                                        </span>
                                    </Space>
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        label="空间级别"
                        name="spaceLevel"
                        rules={[{ required: true, message: "请选择空间级别" }]}
                        initialValue={0}
                    >
                        <Select placeholder="请选择空间级别">
                            {spaceLevels.map((level) => (
                                <Select.Option
                                    key={level.value}
                                    value={level.value}
                                >
                                    <div>
                                        <div>{level.text}</div>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#999",
                                            }}
                                        >
                                            最大 {toNumber(level.maxCount)}{" "}
                                            个图表，
                                            {formatFileSize(level.maxSize)} 存储
                                        </div>
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 编辑空间模态框 */}
            <Modal
                title="编辑空间"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => setEditModalVisible(false)}
                okText="保存"
                cancelText="取消"
                destroyOnClose
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="空间名称"
                        name="spaceName"
                        rules={[
                            { required: true, message: "请输入空间名称" },
                            { max: 50, message: "空间名称最多50个字符" },
                        ]}
                    >
                        <Input placeholder="请输入空间名称" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 空间详情模态框 */}
            <Modal
                title="空间详情"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button
                        key="viewDiagrams"
                        type="primary"
                        onClick={() => {
                            setDetailModalVisible(false)
                            viewingSpace && handleViewDiagrams(viewingSpace.id!)
                        }}
                    >
                        查看空间内的图表
                    </Button>,
                    <Button
                        key="close"
                        onClick={() => setDetailModalVisible(false)}
                    >
                        关闭
                    </Button>,
                ]}
                width={600}
            >
                {viewingSpace && (
                    <div>
                        <div
                            style={{
                                marginBottom: "24px",
                                paddingBottom: "16px",
                                borderBottom: "1px solid #f0f0f0",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    marginBottom: "12px",
                                }}
                            >
                                {viewingSpace.spaceName}
                            </h3>
                            <Tag
                                color={
                                    getSpaceLevelDisplay(
                                        viewingSpace.spaceLevel || 0,
                                    ).color
                                }
                            >
                                {
                                    getSpaceLevelDisplay(
                                        viewingSpace.spaceLevel || 0,
                                    ).text
                                }
                            </Tag>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "24px",
                                marginBottom: "24px",
                            }}
                        >
                            <Statistic
                                title="图表数量"
                                value={toNumber(viewingSpace.totalCount)}
                                suffix={`/ ${toNumber(viewingSpace.maxCount)}`}
                                prefix={<FileTextOutlined />}
                                valueStyle={{
                                    color:
                                        calculatePercentage(
                                            toNumber(viewingSpace.totalCount),
                                            toNumber(viewingSpace.maxCount),
                                        ) > 90
                                            ? "#ff4d4f"
                                            : "#1890ff",
                                }}
                            />
                            <Statistic
                                title="存储空间"
                                value={formatFileSize(viewingSpace.totalSize)}
                                suffix={`/ ${formatFileSize(viewingSpace.maxSize)}`}
                                prefix={<DatabaseOutlined />}
                                valueStyle={{
                                    color:
                                        calculatePercentage(
                                            toNumber(viewingSpace.totalSize),
                                            toNumber(viewingSpace.maxSize),
                                        ) > 90
                                            ? "#ff4d4f"
                                            : "#1890ff",
                                }}
                            />
                        </div>

                        <div>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "#666",
                                    marginBottom: "8px",
                                }}
                            >
                                <strong>空间ID：</strong> {viewingSpace.id}
                            </p>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "#666",
                                    marginBottom: "8px",
                                }}
                            >
                                <strong>创建时间：</strong>{" "}
                                {viewingSpace.createTime
                                    ? new Date(
                                          viewingSpace.createTime,
                                      ).toLocaleString()
                                    : "未知"}
                            </p>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "#666",
                                    marginBottom: "8px",
                                }}
                            >
                                <strong>更新时间：</strong>{" "}
                                {viewingSpace.updateTime
                                    ? new Date(
                                          viewingSpace.updateTime,
                                      ).toLocaleString()
                                    : "未知"}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 成员管理器 */}
            {memberManageSpace && (
                <TeamSpaceMemberManager
                    spaceId={memberManageSpace.id!}
                    spaceName={memberManageSpace.spaceName || ""}
                    open={memberManageVisible}
                    onCancel={() => {
                        setMemberManageVisible(false)
                        setMemberManageSpace(null)
                    }}
                />
            )}
        </div>
    )
}
