"use client"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import {
    LoginForm,
    ProConfigProvider,
    ProFormCheckbox,
    ProFormText,
} from "@ant-design/pro-components"
import { ProForm } from "@ant-design/pro-form/lib"
import { App } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { userRegister } from "@/api/userController"

const UserRegister: React.FC = () => {
    const { message } = App.useApp()
    const [form] = ProForm.useForm()
    const router = useRouter()

    const submit = async (value: API.UserRegisterRequest) => {
        try {
            const res = await userRegister(value)
            if (res.code) {
                message.success("注册成功")
                router.replace("/user/login")
            }
        } catch (_e) {
            message.error("注册失败")
        }
    }
    return (
        <ProConfigProvider hashed={false}>
            <div>
                <LoginForm
                    form={form}
                    onFinish={submit}
                    logo="https://github.githubassets.com/favicons/favicon.png"
                    title="智能协同云画图"
                    subTitle="用户注册"
                >
                    {
                        <>
                            <ProFormText
                                name="userAccount"
                                fieldProps={{
                                    size: "large",
                                    prefix: (
                                        <UserOutlined
                                            className={"prefixIcon"}
                                        />
                                    ),
                                }}
                                placeholder={"请输入用户名!"}
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入用户名!",
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
                            <ProFormText.Password
                                name="checkPassword"
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
                                placeholder={"请确认密码！"}
                                rules={[
                                    {
                                        required: true,
                                        message: "请确认密码！",
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
                        <Link href={"/user/login"}>去登录</Link>
                    </div>
                </LoginForm>
            </div>
        </ProConfigProvider>
    )
}

export default UserRegister
