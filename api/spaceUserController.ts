/* eslint-disable */
import request from "@/lib/request"

/** 添加成员到空间 添加成员到团队空间并设置角色。

**权限要求：**
- 需要登录
- 团队空间：需要有空间用户管理权限
- 管理员可以添加成员到任何空间

**角色说明：**
- space_admin：空间管理员，拥有所有权限
- space_editor：编辑者，可以创建和编辑图表
- space_viewer：查看者，只能查看图表
 POST /spaceUser/add */
export async function addSpaceUser(
    body: API.SpaceUserAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/spaceUser/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 从空间移除成员 从团队空间中移除成员。

**权限要求：**
- 需要登录
- 团队空间：需要有空间用户管理权限
- 管理员可以移除任何成员
 POST /spaceUser/delete */
export async function deleteSpaceUser(
    body: API.SpaceUserDeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/spaceUser/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 编辑成员信息（设置权限） 修改空间成员的角色权限。

**权限要求：**
- 需要登录
- 团队空间：需要有空间用户管理权限
- 管理员可以修改任何成员的权限
 POST /spaceUser/edit */
export async function editSpaceUser(
    body: API.SpaceUserEditRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/spaceUser/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询某个成员在某个空间的信息 POST /spaceUser/get */
export async function getSpaceUser(
    body: API.SpaceUserQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseSpaceUser>("/spaceUser/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询成员信息列表 POST /spaceUser/list */
export async function listSpaceUser(
    body: API.SpaceUserQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseListSpaceUserVO>("/spaceUser/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询我加入的团队空间列表 POST /spaceUser/list/my */
export async function listMyTeamSpace(options?: { [key: string]: any }) {
    return request<API.BaseResponseListSpaceUserVO>("/spaceUser/list/my", {
        method: "POST",
        ...(options || {}),
    })
}
