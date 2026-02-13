"use client"
import { GithubOutlined, LockOutlined, MailOutlined } from "@ant-design/icons"
import {
    LoginForm,
    ProConfigProvider,
    ProFormCheckbox,
    ProFormText,
} from "@ant-design/pro-components"
import { ProForm } from "@ant-design/pro-form/lib"
import { App, Tooltip } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useDispatch } from "react-redux"
import { userLogin } from "@/api/userController"
import type { AppDispatch } from "@/stores"
import { setLoginUser } from "@/stores/loginUser"

const UserLogin: React.FC = () => {
    const { message } = App.useApp()
    const [form] = ProForm.useForm()
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const submit = async (value: API.UserLoginRequest) => {
        try {
            const res = await userLogin(value)
            if (res.code === 0) {
                // 修复：直接使用 res?.data 而不是 res?.data?.data
                dispatch(setLoginUser(res?.data))
                message.success("登录成功")
                setTimeout(() => {
                    router.replace("/")
                }, 100)
                // 4. 正确重置表单
                form.resetFields()
            }
        } catch (_e) {
            message.error("登录失败")
        }
    }

    const handleGithubLogin = () => {
        const baseURL = "/api"
        window.location.href = `${baseURL}/oauth2/authorization/github`
    }

    return (
        <ProConfigProvider hashed={false}>
            <div>
                <LoginForm
                    form={form}
                    logo="https://github.githubassets.com/favicons/favicon.png"
                    title="IntelliDraw 智能绘图"
                    subTitle="AI 驱动的无限创意绘图平台"
                    onFinish={submit}
                    actions={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    height: 40,
                                    width: 40,
                                    border: "1px solid #D4D8DD",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                }}
                                onClick={handleGithubLogin}
                            >
                                <Tooltip title="GitHub 一键登录">
                                    <GithubOutlined
                                        style={{
                                            fontSize: 24,
                                            color: "#1677ff",
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    }
                >
                    {
                        <>
                            <ProFormText
                                name="userAccount"
                                fieldProps={{
                                    size: "large",
                                    prefix: (
                                        <MailOutlined
                                            className={"prefixIcon"}
                                        />
                                    ),
                                }}
                                placeholder={"请输入邮箱!"}
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入邮箱!",
                                    },
                                    {
                                        type: "email",
                                        message: "请输入正确的邮箱格式!",
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="userPassword"
                                fieldProps={{
                                    size: "large",
                                    prefix: (
                                        <LockOutlined
                                            className={"prefixIcon"}
                                        />
                                    ),
                                    strengthText:
                                        "Password should contain numbers, letters and special characters, at least 8 characters long.",
                                    statusRender: (value) => {
                                        const getStatus = () => {
                                            if (value && value.length > 12) {
                                                return "ok"
                                            }
                                            if (value && value.length > 6) {
                                                return "pass"
                                            }
                                            return "poor"
                                        }
                                        const _status = getStatus()

                                        return <div>强度：弱</div>
                                    },
                                }}
                                placeholder={"请输入密码！"}
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入密码！",
                                    },
                                ]}
                            />
                        </>
                    }
                    <div
                        style={{
                            marginBlockEnd: 24,
                        }}
                    >
                        <ProFormCheckbox noStyle name="autoLogin">
                            自动登录
                        </ProFormCheckbox>
                        <Link href={"/user/register"}>还没有账号？去注册</Link>
                    </div>
                </LoginForm>
            </div>
        </ProConfigProvider>
    )
}

export default UserLogin
