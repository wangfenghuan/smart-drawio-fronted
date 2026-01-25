/* eslint-disable */
import request from "@/lib/request"

/** 创建用户 POST /user/add */
export async function addUser(
    body: API.UserAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/user/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 删除用户 POST /user/delete */
export async function deleteUser(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/user/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 根据 id 获取用户（仅管理员） GET /user/get */
export async function getUserById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getUserByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseUser>("/user/get", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 获取当前登录用户 GET /user/get/login */
export async function getLoginUser(options?: { [key: string]: any }) {
    return request<API.BaseResponseLoginUserVO>("/user/get/login", {
        method: "GET",
        ...(options || {}),
    })
}

/** 根据 id 获取包装类 GET /user/get/vo */
export async function getUserVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getUserVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseUserVO>("/user/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 查询所有的角色以及对应的权限 GET /user/getAuth */
export async function getAllRoleAndAuth(options?: { [key: string]: any }) {
    return request<API.BaseResponseListRoleWithAuthoritiesVO>("/user/getAuth", {
        method: "GET",
        ...(options || {}),
    })
}

/** 分页获取用户列表（仅管理员） POST /user/list/page */
export async function listUserByPage(
    body: API.UserQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageUser>("/user/list/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页获取用户封装列表 POST /user/list/page/vo */
export async function listUserVoByPage(
    body: API.UserQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageUserVO>("/user/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 用户登录 POST /user/login */
export async function userLogin(
    body: API.UserLoginRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLoginUserVO>("/user/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 用户推出登录 POST /user/logout */
export async function userLogout(options?: { [key: string]: any }) {
    return request<API.BaseResponseBoolean>("/user/logout", {
        method: "POST",
        ...(options || {}),
    })
}

/** 用户注册 POST /user/register */
export async function userRegister(
    body: API.UserRegisterRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/user/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 修改角色权限 POST /user/role/update/authorities */
export async function updateRoleAuthorities(
    body: API.RoleAuthorityUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/user/role/update/authorities", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 更新用户 POST /user/update */
export async function updateUser(
    body: API.UserUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/user/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 更新个人信息 POST /user/update/my */
export async function updateMyUser(
    body: API.UserUpdateMyRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/user/update/my", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 修改用户角色 POST /user/update/roles */
export async function updateUserRoles(
    body: API.UserRoleUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/user/update/roles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 上传头像图片 POST /user/upload/image */
export async function uploadAvataImage(
    body: {},
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseString>("/user/upload/image", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        data: body,
        ...(options || {}),
    })
}
