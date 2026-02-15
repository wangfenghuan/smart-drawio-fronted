
/* eslint-disable */
import request from "@/lib/request"

/** 添加成员到房间 添加成员到协作房间并设置角色。

**权限要求：**
- 需要登录
- 协作房间：需要有房间用户管理权限
- 管理员可以添加成员到任何房间

**角色说明：**
- diagram_admin：房间管理员，拥有所有权限
- diagram_editor：编辑者，可以编辑图表
- diagram_viewer：查看者，只能查看图表
 POST /roomMember/add */
export async function addRoomMember(
    body: API.RoomMemberAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/roomMember/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 从房间移除成员 从协作房间中移除成员。

**权限要求：**
- 需要登录
- 协作房间：需要有房间用户管理权限
- 管理员可以移除任何成员
 POST /roomMember/delete */
export async function deleteRoomMember(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/roomMember/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 编辑成员信息（设置权限） 修改房间成员的角色权限。

**权限要求：**
- 需要登录
- 协作房间：需要有房间用户管理权限
- 管理员可以修改任何成员的权限
 POST /roomMember/edit */
export async function editRoomMember(
    body: API.RoomMemberEditRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/roomMember/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询某个成员在某个房间的信息 POST /roomMember/get */
export async function getRoomMember(
    body: API.RoomMemberQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseRoomMember>("/roomMember/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询房间成员信息列表 POST /roomMember/list */
export async function listRoomMember(
    body: API.RoomMemberQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseListRoomMemberVO>("/roomMember/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询我加入的房间列表 POST /roomMember/list/my */
export async function listMyRooms(options?: { [key: string]: any }) {
    return request<API.BaseResponseListRoomMemberVO>("/roomMember/list/my", {
        method: "POST",
        ...(options || {}),
    })
}
