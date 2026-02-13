"use client"
import { GithubOutlined } from "@ant-design/icons"
import type React from "react"

const GlobalFooter: React.FC = () => {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "12px 0", // ⬇️ 修改点1：大幅减小上下内边距 (原为 24px)
                color: "rgba(0, 0, 0, 0.45)",
                background: "transparent",
                // borderTop: "1px solid rgba(0, 0, 0, 0.06)", // 如果觉得有边框显高，可以注释掉这行
                fontSize: "12px", // ⬇️ 修改点2：字体调小，显得更紧凑
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "24px", // ⬇️ 修改点3：使用 Flex 布局让内容在同一行显示，中间用 gap 隔开
                    flexWrap: "wrap", // 移动端屏幕窄时自动换行
                }}
            >
                <div>
                    © {new Date().getFullYear()} IntelliDraw 智能绘图 |
                    让架构设计更简单
                </div>
                <div>
                    <a
                        href="https://github.com/wangfenghuan"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: "rgba(0, 0, 0, 0.45)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            transition: "color 0.3s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color =
                                "rgba(0, 0, 0, 0.85)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                                "rgba(0, 0, 0, 0.45)")
                        }
                    >
                        <GithubOutlined /> 程序员 wfh
                    </a>
                </div>
                <div>
                    <a
                        href="https://beian.miit.gov.cn/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: "rgba(0, 0, 0, 0.45)",
                            textDecoration: "none",
                        }}
                    >
                        冀ICP备2026004927号
                    </a>
                </div>
            </div>
        </div>
    )
}

export default GlobalFooter
