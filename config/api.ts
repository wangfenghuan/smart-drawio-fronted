// 严格根据 NODE_ENV 判断：development -> localhost, production -> remote
export const BACKEND_API_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8081/api"
        : "http://47.95.35.178:8081/api"
