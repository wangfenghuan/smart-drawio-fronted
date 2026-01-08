"use client"

import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    FolderOutlined,
    LoadingOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    message as antMessage,
    Button,
    Card,
    Empty,
    Form,
    Input,
    Modal,
    Pagination,
    Popconfirm,
    Spin,
    Tooltip,
} from "antd"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
    addDiagram,
    deleteDiagram,
    downloadRemoteFile,
    editDiagram,
    getDiagramVoById,
} from "@/api/diagramController"
import { getSpaceVoById, listDiagramsBySpaceId } from "@/api/spaceController"
import { toNumber } from "@/lib/utils"

const { Search } = Input

export default function SpaceDiagramsPage() {
    const { message } = App.useApp()
    const router = useRouter()
    const params = useParams()
    const spaceId = params.spaceId as string // 保持为字符串，避免大整数精度丢失

    const [diagrams, setDiagrams] = useState<API.DiagramVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editingDiagram, setEditingDiagram] = useState<API.DiagramVO | null>(
        null,
    )
    const [loadingDiagramDetail, setLoadingDiagramDetail] = useState(false)
    const [editFormState] = useState({
        name: "",
        description: "",
    })
    const [editForm] = Form.useForm()
    const [spaceInfo, setSpaceInfo] = useState<API.SpaceVO | null>(null)
    const [createLoading, setCreateLoading] = useState(false)

    // 添加防重复请求的标记
    const isLoadingRef = useRef(false)
    const isSpaceInfoLoadingRef = useRef(false)

    // 加载空间信息
    const loadSpaceInfo = async () => {
        if (!spaceId) return
        // 防止重复请求
        if (isSpaceInfoLoadingRef.current) {
            return
        }
        isSpaceInfoLoadingRef.current = true

        try {
            const response = await getSpaceVoById({ id: spaceId as any })
            if (response?.code === 0 && response?.data) {
                setSpaceInfo(response.data)
            }
        } catch (error) {
            console.error("加载空间信息失败:", error)
        } finally {
            isSpaceInfoLoadingRef.current = false
        }
    }

    // 加载图表列表
    const loadDiagrams = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        if (!spaceId) return

        // 防止重复请求
        if (isLoadingRef.current) {
            return
        }
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await listDiagramsBySpaceId({
                spaceId: spaceId,
                current: current,
                pageSize: pageSize,
                ...(searchText && { searchText: searchText }),
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                const data = response.data
                const records = data.records || []

                const serverCurrent = toNumber(data.current) || 1
                const serverSize = toNumber(data.size) || 12
                let serverTotal = toNumber(data.total) || 0

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
        if (spaceId) {
            loadSpaceInfo()
            loadDiagrams()
        }
    }, [spaceId])

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

    // 在当前空间创建图表
    const handleCreateDiagram = async () => {
        if (!spaceId) return

        try {
            setCreateLoading(true)
            const response = await addDiagram({
                name: "未命名图表",
                diagramCode: "",
                pictureUrl: "",
                spaceId: spaceId, // 直接使用当前空间的ID
            })

            if (response?.code === 0 && response.data) {
                message.success("图表创建成功！")
                // 跳转到编辑页面
                router.push(`/diagram/edit/${response.data}`)
            } else {
                message.error(response?.message || "创建图表失败，请稍后重试")
            }
        } catch (error) {
            console.error("创建图表失败:", error)
            message.error("创建图表失败，请稍后重试")
        } finally {
            setCreateLoading(false)
        }
    }

    // 返回空间列表
    const handleBack = () => {
        router.push("/my-spaces")
    }

    // 跳转到编辑页面
    const handleEditDiagram = (id: string | undefined) => {
        if (id) {
            router.push(`/diagram/edit/${id}`)
        }
    }

    // 删除图表
    const handleDeleteDiagram = async (id: string | undefined) => {
        if (!id) return

        try {
            const response = await deleteDiagram({ id: id as any })
            if (response?.code === 0) {
                message.success("删除成功")
                loadDiagrams()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除图表失败:", error)
            message.error("删除操作异常")
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = async (diagram: API.DiagramVO) => {
        if (!diagram.id) return

        setLoadingDiagramDetail(true)
        setEditModalVisible(true)

        try {
            // 从后端查询图表详情，确保数据是最新的
            const response = await getDiagramVoById({
                id: diagram.id as any,
            })

            if (response?.code === 0 && response?.data) {
                const diagramData = response.data
                setEditingDiagram(diagramData)

                // 设置表单值
                editForm.setFieldsValue({
                    name: diagramData.name || "",
                    description: diagramData.description || "",
                })
                setLoadingDiagramDetail(false)
            } else {
                message.error(response?.message || "获取图表详情失败")
                setEditModalVisible(false)
                setLoadingDiagramDetail(false)
            }
        } catch (error) {
            console.error("获取图表详情失败:", error)
            message.error("获取图表详情失败，请稍后重试")
            setEditModalVisible(false)
            setLoadingDiagramDetail(false)
        }
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await editDiagram({
                id: editingDiagram?.id,
                name: values.name,
                description: values.description,
            })

            if (response?.code === 0) {
                message.success("保存成功")
                setEditModalVisible(false)
                editForm.resetFields()
                loadDiagrams()
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

    // 下载图表
    const _handleDownload = async (diagram: API.DiagramVO) => {
        try {
            const response = await downloadRemoteFile({
                id: diagram.id,
                type: "svg",
            })
            if (response) {
                const url = window.URL.createObjectURL(new Blob([response]))
                const link = document.createElement("a")
                link.href = url
                link.download = `${diagram.name || "diagram"}.svg`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                message.success("下载成功")
            }
        } catch (error) {
            console.error("下载失败:", error)
            message.error("下载失败")
        }
    }

    if (!spaceId) {
        return (
            <div style={{ padding: "24px", textAlign: "center" }}>
                <p>空间ID无效</p>
                <Button type="primary" onClick={handleBack}>
                    返回空间列表
                </Button>
            </div>
        )
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
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBack}
                                type="text"
                            >
                                返回
                            </Button>
                            <FileTextOutlined
                                style={{ fontSize: "20px", color: "#1890ff" }}
                            />
                            <div>
                                <div
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {spaceInfo?.spaceName || "空间图表"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#999",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <span>
                                        共 {pagination.total} 个图表
                                    </span>
                                    {spaceInfo?.userVO && (
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <span style={{ margin: "0 4px" }}>
                                                |
                                            </span>
                                            <UserOutlined />
                                            创建者:{" "}
                                            {spaceInfo.userVO.userName ||
                                                spaceInfo.userId ||
                                                "未知"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateDiagram}
                            loading={createLoading}
                            style={{ borderRadius: "6px" }}
                        >
                            新建图表
                        </Button>
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
                                                : "该空间暂无图表"}
                                        </p>
                                        {!searchText && (
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={handleCreateDiagram}
                                                loading={createLoading}
                                            >
                                                创建第一个图表
                                            </Button>
                                        )}
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
                                    handleEditDiagram(diagram.id?.toString())
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
                                        <span>
                                            {diagram.createTime
                                                ? new Date(
                                                      diagram.createTime,
                                                  ).toLocaleString()
                                                : "未知时间"}
                                        </span>
                                    </div>
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
                                        <FolderOutlined />
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                flex: 1,
                                            }}
                                        >
                                            私有空间
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

                                {/* 操作按钮区 */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Tooltip title="修改信息">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenEditModal(diagram)
                                            }}
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="删除图表"
                                        description="确定要永久删除这个图表吗？"
                                        onConfirm={(e) => {
                                            e?.stopPropagation()
                                            handleDeleteDiagram(
                                                diagram.id?.toString(),
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

            {/* 编辑信息模态框 */}
            <Modal
                title="编辑图表信息"
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
                    spinning={loadingDiagramDetail}
                    indicator={<LoadingOutlined spin />}
                >
                    <Form form={editForm} layout="vertical" preserve={false}>
                        <Form.Item
                            label="图表名称"
                            name="name"
                            rules={[
                                { required: true, message: "请输入图表名称" },
                            ]}
                        >
                            <Input placeholder="请输入图表名称" />
                        </Form.Item>
                        <Form.Item label="描述" name="description">
                            <Input.TextArea rows={4} placeholder="请输入描述" />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </div>
    )
}
