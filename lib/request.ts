import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"

// 创建 Axios 实例
const myAxios = axios.create({
    baseURL: "http://localhost:8081/api",
    timeout: 10000,
    withCredentials: true,
    transformResponse: [
        (data) => {
            if (typeof data === "string") {
                try {
                    // 把超长数字（比如雪花算法ID，通常19位）转成字符串，避免前端精度丢失
                    // 匹配模式：冒号后跟19位以上数字，且后面紧跟逗号、反花括号或反方括号
                    // 例如: "id": 1234567890123456789, -> "id": "1234567890123456789",
                    const stringified = data.replace(
                        /:\s*([0-9]{16,})\s*([,}\]])/g,
                        ':"$1"$2',
                    )
                    return JSON.parse(stringified)
                } catch (e) {
                    console.error("JSON parse error", e)
                    return data
                }
            }
            return data
        },
    ],
})

// 创建请求拦截器
myAxios.interceptors.request.use(
    (config) => {
        // 请求执行前执行
        return config
    },
    (error) => {
        // 处理请求错误
        return Promise.reject(error)
    },
)

// 创建响应拦截器
myAxios.interceptors.response.use(
    // 2xx 响应触发
    (response) => {
        // 处理响应数据
        const { data } = response

        // 未登录
        if (data.code === 40100) {
            // 不是获取用户信息接口，或者不是登录页面，则跳转到登录页面
            if (
                !response.request.responseURL.includes("user/get/login") &&
                !window.location.pathname.includes("/user/login")
            ) {
                const currentPath = window.location.pathname
                const isPublic =
                    currentPath === "/" ||
                    currentPath.startsWith("/material-marketplace") ||
                    currentPath.startsWith("/diagram-marketplace") ||
                    currentPath.startsWith("/user/") ||
                    currentPath.includes("sitemap.xml") ||
                    currentPath.includes("robots.txt") ||
                    currentPath.includes("manifest") ||
                    currentPath.includes("favicon")

                // 只有非公开页面才跳转
                if (!isPublic) {
                    window.location.href = `/user/login?redirect=${window.location.href}`
                }
            }
        }

        return data
    },
    // 非 2xx 响应触发
    (error) => {
        // 处理响应错误
        return Promise.reject(error)
    },
)

interface CustomAxiosInstance extends AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<T>
    <T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export default myAxios as unknown as CustomAxiosInstance
