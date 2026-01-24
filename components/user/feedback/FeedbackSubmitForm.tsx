"use client"

import { UploadOutlined } from "@ant-design/icons"
import {
    Button,
    Card,
    Form,
    Input,
    Modal,
    message,
    Upload,
    type UploadFile,
    type UploadProps,
} from "antd"
import type React from "react"
import { useState } from "react"
import { addFeedback, uploadFeedbackImage } from "@/api/feedBackController"

const { TextArea } = Input

interface FeedbackSubmitFormProps {
    onSuccess: () => void
}

export const FeedbackSubmitForm: React.FC<FeedbackSubmitFormProps> = ({
    onSuccess,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState("")
    const [previewTitle, setPreviewTitle] = useState("")

    const handleCancel = () => setPreviewOpen(false)

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            // For now just show invalid preview if no url/preview logic
            // Ideally implement file reader here if needed
        }
        setPreviewImage(file.url || (file.thumbUrl as string))
        setPreviewOpen(true)
        setPreviewTitle(
            file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1),
        )
    }

    const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
        setFileList(newFileList)

    // Custom upload implementation
    const customRequest = async (options: any) => {
        const { onSuccess, onError, file } = options

        try {
            const formData = new FormData()
            formData.append("file", file)

            // Call upload API
            // Note: We need to override content-type to let browser/axios set multipart boundary
            // casting formData as any because generic body type is {}
            const res = (await uploadFeedbackImage(formData as any, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })) as unknown as API.BaseResponseString

            if (res.code === 0 && res.data) {
                onSuccess(res.data)
            } else {
                onError(new Error(res.message || "上传失败"))
                message.error("图片上传失败：" + (res.message || "未知错误"))
            }
        } catch (e) {
            onError(e)
            message.error("图片上传出错")
        }
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            // Get the uploaded image URL from fileList response
            // Assuming single image for now based on API structure (one pictureUrl),
            // but UI allows up to 3. API FeedbackAddRequest has single `pictureUrl`.
            // So we take the first uploaded image if any.
            let pictureUrl
            if (fileList.length > 0 && fileList[0].status === "done") {
                pictureUrl = fileList[0].response
            }

            const requestData: API.FeedbackAddRequest = {
                content: values.content,
                pictureUrl: pictureUrl,
            }

            const res = (await addFeedback(
                requestData,
            )) as unknown as API.BaseResponseLong
            if (res.code === 0) {
                message.success("反馈提交成功，感谢您的建议！")
                form.resetFields()
                setFileList([])
                onSuccess()
            } else {
                message.error(res.message || "提交失败")
            }
        } catch (error) {
            console.error(error)
            message.error("提交发生错误")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Card bordered={false}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{}}
                >
                    <Form.Item
                        name="content"
                        label="反馈内容"
                        rules={[
                            { required: true, message: "请输入您的反馈内容" },
                            { min: 5, message: "内容太短，请多描述一些细节" },
                        ]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="请详细描述您的问题或建议..."
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item label="截图/图片 (可选)">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                            customRequest={customRequest}
                            maxCount={1}
                        >
                            {fileList.length >= 1 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>上传</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            提交反馈
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={handleCancel}
            >
                <img
                    alt="example"
                    style={{ width: "100%" }}
                    src={previewImage}
                />
            </Modal>
        </div>
    )
}
