"use client"

import {
    AppstoreOutlined,
    DeleteOutlined,
    EditOutlined,
    FileImageOutlined,
    PlusOutlined,
    SearchOutlined,
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
    Space,
    Tag,
    Tooltip,
} from "antd"
import { useEffect, useRef, useState } from "react"
import {
    addMaterial,
    deleteMaterial,
    listMaterialVoByPage,
    updateMaterial,
} from "@/api/materialController"
import MaterialViewer from "@/components/MaterialViewer"

const { Search } = Input

export function AdminMaterialManagement() {
    const { message } = App.useApp()

    const [materials, setMaterials] = useState<API.MaterialVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [modalVisible, setModalVisible] = useState(false)
    const [editingMaterial, setEditingMaterial] =
        useState<API.MaterialVO | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [form] = Form.useForm()

    const isLoadingRef = useRef(false)

    // 加载素材列表
    const loadMaterials = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        if (isLoadingRef.current) return
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await listMaterialVoByPage({
                current,
                pageSize,
                name: searchText, // 支持按名称搜索
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

                setMaterials(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error("加载素材列表失败：" + (response?.message || ""))
            }
        } catch (error) {
            console.error("加载素材列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMaterials()
    }, [])

    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        // 需要等待状态更新后重新加载，或者直接传递参数
        // 为了简单起见，这里复用 loadMaterials 并传入 current=1
        // 但注意 searchText 状态可能还没更新完全，最好传参
        // 这里重写 loadMaterials 逻辑有点冗余，直接依赖 useEffect 或者手动调用带参
        // 修正：loadMaterials 内部用了 searchText 状态，所以这里最好是先 setSearchText，然后 useEffect 依赖 searchText 变化？
        // 或者直接调用 loadMaterials，但要把 searchText 传进去。
        // 鉴于 loadMaterials 实现使用了 closure 中的 searchText，我们需要确保它拿到了最新的。
        // 最稳妥的方式：修改 loadMaterials 接收 search 参数
        // 暂时简单处理：
        isLoadingRef.current = false // Reset ref allowed force reload
        // 手动调用 API 避免闭包旧值问题，或者改良 loadMaterials
        // 修正 loadMaterials 为接受 search 参数
        loadMaterialsWithSearch(value, 1, pagination.pageSize)
    }

    // 专门用于搜索调用的加载函数
    const loadMaterialsWithSearch = async (
        search: string,
        current: number,
        pageSize: number,
    ) => {
        if (isLoadingRef.current) return
        isLoadingRef.current = true
        setLoading(true)
        try {
            const response = await listMaterialVoByPage({
                current,
                pageSize,
                name: search,
                sortField: "createTime",
                sortOrder: "desc",
            })
            if (response?.code === 0 && response?.data) {
                const data = response.data
                setMaterials(data.records || [])
                setPagination({
                    current: Number(data.current) || 1,
                    pageSize: Number(data.size) || 12,
                    total: Number(data.total) || 0,
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadMaterials(page, pageSize)
    }

    // 打开编辑/新增模态框
    const handleOpenModal = (material?: API.MaterialVO) => {
        if (material) {
            setEditingMaterial(material)
            form.setFieldsValue({
                name: material.name,
                description: material.description,
                pictureUrl: material.pictureUrl,
                svgUrl: material.svgUrl,
                diagramCode: material.diagramCode,
                tags: material.tags, // 这里假设 tags 是 JSON 字符串或者直接显示
            })
        } else {
            setEditingMaterial(null)
            form.resetFields()
        }
        setModalVisible(true)
    }

    // 提交表单
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setSubmitting(true)

            if (editingMaterial) {
                const res = await updateMaterial({
                    id: editingMaterial.id,
                    ...values,
                })
                if (res?.code === 0) {
                    message.success("更新成功")
                    setModalVisible(false)
                    loadMaterials()
                } else {
                    message.error(res?.message || "更新失败")
                }
            } else {
                const res = await addMaterial(values)
                if (res?.code === 0) {
                    message.success("创建成功")
                    setModalVisible(false)
                    loadMaterials()
                } else {
                    message.error(res?.message || "创建失败")
                }
            }
        } catch (error) {
            console.error("提交失败:", error)
        } finally {
            setSubmitting(false)
        }
    }

    // 删除素材
    const handleDelete = async (id: string) => {
        try {
            const res = await deleteMaterial({ id })
            if (res?.code === 0) {
                message.success("删除成功")
                loadMaterials()
            } else {
                message.error(res?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除失败:", error)
            message.error("删除异常")
        }
    }

    return (
        <>
            <Card
                bordered={false}
                style={{ borderRadius: "8px" }}
                title={
                    <div className="flex items-center gap-4">
                        <AppstoreOutlined
                            style={{ fontSize: "18px", color: "#1890ff" }}
                        />
                        <span>素材管理</span>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal()}
                    >
                        新建素材
                    </Button>
                }
            >
                <div style={{ marginBottom: "16px" }}>
                    <Search
                        placeholder="搜索素材名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        onSearch={handleSearch}
                    />
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "16px",
                    }}
                >
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card
                                key={i}
                                loading
                                style={{ borderRadius: "8px" }}
                            />
                        ))
                    ) : materials.length === 0 ? (
                        <div
                            style={{ gridColumn: "1 / -1", padding: "40px 0" }}
                        >
                            <Empty description="暂无素材" />
                        </div>
                    ) : (
                        materials.map((item) => (
                            <Card
                                key={item.id}
                                hoverable
                                style={{
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    border: "1px solid #f0f0f0",
                                }}
                                bodyStyle={{ padding: "12px" }}
                                cover={
                                    <div
                                        style={{
                                            height: "160px",
                                            background: "#fafafa",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {item.pictureUrl || item.svgUrl ? (
                                            <img
                                                src={
                                                    item.pictureUrl ||
                                                    item.svgUrl
                                                }
                                                alt={item.name}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        ) : item.diagramCode ? (
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                <MaterialViewer
                                                    xml={item.diagramCode}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                    }}
                                                    className="scale-50 origin-top-left"
                                                />
                                            </div>
                                        ) : (
                                            <FileImageOutlined
                                                style={{
                                                    fontSize: 48,
                                                    color: "#ccc",
                                                }}
                                            />
                                        )}
                                    </div>
                                }
                                actions={[
                                    <Tooltip title="编辑" key="edit">
                                        <EditOutlined
                                            onClick={() =>
                                                handleOpenModal(item)
                                            }
                                        />
                                    </Tooltip>,
                                    <Popconfirm
                                        key="delete"
                                        title="确定删除该素材吗？"
                                        onConfirm={() => handleDelete(item.id!)}
                                    >
                                        <DeleteOutlined
                                            style={{ color: "red" }}
                                        />
                                    </Popconfirm>,
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div className="flex justify-between items-center">
                                            <span
                                                title={item.name}
                                                className="truncate block max-w-[150px]"
                                            >
                                                {item.name}
                                            </span>
                                        </div>
                                    }
                                    description={
                                        <div className="text-xs text-gray-500">
                                            <div
                                                className="mb-1 truncate"
                                                title={item.description}
                                            >
                                                {item.description || "无描述"}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <UserOutlined />
                                                <span>
                                                    {item.userVO?.userName ||
                                                        item.userId ||
                                                        "未知"}
                                                </span>
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        ))
                    )}
                </div>

                {!loading && materials.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handleTableChange}
                            showSizeChanger
                        />
                    </div>
                )}
            </Card>

            <Modal
                title={editingMaterial ? "编辑素材" : "新建素材"}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                confirmLoading={submitting}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="素材名称"
                        name="name"
                        rules={[{ required: true, message: "请输入素材名称" }]}
                    >
                        <Input placeholder="输入名称" />
                    </Form.Item>
                    <Form.Item label="素材描述" name="description">
                        <Input.TextArea rows={2} placeholder="输入描述" />
                    </Form.Item>
                    <Form.Item label="图片URL (PNG)" name="pictureUrl">
                        <Input placeholder="http://..." />
                    </Form.Item>
                    <Form.Item label="矢量图URL (SVG)" name="svgUrl">
                        <Input placeholder="http://..." />
                    </Form.Item>
                    <Form.Item label="图表代码 (XML)" name="diagramCode">
                        <Input.TextArea rows={4} placeholder="XML 内容..." />
                    </Form.Item>
                    <Form.Item label="标签 (JSON数组)" name="tags">
                        <Input placeholder='["tag1", "tag2"]' />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
