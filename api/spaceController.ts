// @ts-expect-error
/* eslint-disable */
import request from "@/lib/request"

/** 创建空间 POST /space/add */
export async function addSpace(
    body: API.SpaceAddReqeust,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/space/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 删除空间 删除指定的空间，并自动删除空间内的所有图表。

**功能说明：**
- 删除空间记录
- 级联删除空间内的所有图表
- 使用事务确保删除操作的原子性

**额度处理：**
- 删除空间不会释放额度（因为空间本身被删除了）
- 删除图表时也不会释放额度（因为关联的空间也被删除了）

**权限要求：**
- 需要登录
- 仅空间创建人或管理员可删除

**注意事项：**
- 删除操作不可逆，请谨慎操作
- 删除后空间内的所有图表都会被删除
- 对象存储中的文件不会自动删除（可通过定时任务清理）
 POST /space/delete */
export async function deleteSpace(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/space/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 编辑空间信息 用户编辑自己的空间信息，目前支持修改空间名称。

**权限要求：**
- 需要登录
- 仅空间创建人可编辑

**可编辑字段：**
- spaceName：空间名称

**不可编辑字段：**
- spaceLevel：空间级别（如需升级，请联系管理员）
- maxCount、maxSize：由空间级别自动决定
 POST /space/edit */
export async function editSpace(
    body: API.SpaceEditRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/space/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 获取空间（管理员专用） 管理员专用的空间查询接口，获取空间实体类。

**权限要求：**
- 仅限admin角色使用
 GET /space/get */
export async function getSpaceById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getSpaceByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseSpace>("/space/get", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 获取空间详情 根据ID获取空间的详细信息。

**权限要求：**
- 需要登录
- 仅空间创建人或管理员可查看

**返回内容：**
- 空间基本信息（ID、名称、级别等）
- 空间额度信息（maxCount、maxSize、totalCount、totalSize）
 GET /space/get/vo */
export async function getSpaceVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getSpaceVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseSpaceVO>("/space/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 查询我加入的空间 查询当前登录用户加入的所有团队空间。

**权限要求：**
- 需要登录
- 只能查询自己作为成员加入的团队空间

**功能说明：**
- 查询用户在 space_user 表中有关联记录的团队空间
- 不包括用户自己创建的私有空间

**限制条件：**
- 每页最多20条（防止爬虫）
- 支持按名称、级别等条件筛选
 POST /space/joined/list/page/vo */
export async function listJoinedSpaceVoByPage(
    body: API.SpaceQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageSpaceVO>("/space/joined/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询空间下的图表列表 查询指定空间下的所有图表。

**权限要求：**
- 需要登录
- 团队空间：需要是空间成员且有查看权限
- 私有空间：仅空间创建人可查询

**功能说明：**
- 返回指定空间下的所有图表
- 支持分页查询
- 支持按图表名称等条件筛选

**限制条件：**
- 每页最多20条（防止爬虫）
 POST /space/list/diagrams */
export async function listDiagramsBySpaceId(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagramVO>("/space/list/diagrams", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询空间级别列表 获取所有可用的空间级别信息，用于前端展示空间等级和对应的额度限制。

**返回内容：**
- value：级别值（0=普通版，1=专业版，2=旗舰版）
- text：级别名称（"普通版"、"专业版"、"旗舰版"）
- maxCount：最大图表数量
- maxSize：最大存储空间（字节）

**级别说明：**
- **普通版（value=0）：**
  - 最大100个图表
  - 最大100MB存储空间
- **专业版（value=1）：**
  - 最大1000个图表
  - 最大1000MB存储空间
- **旗舰版（value=2）：**
  - 最大10000个图表
  - 最大10000MB存储空间

**权限要求：**
- 无需登录，所有用户可查询
 GET /space/list/level */
export async function listSpaceLevel(options?: { [key: string]: any }) {
    return request<API.BaseResponseListSpaceLevel>("/space/list/level", {
        method: "GET",
        ...(options || {}),
    })
}

/** 分页查询空间（管理员专用） 管理员专用的空间列表查询接口，可以查询所有空间。

**权限要求：**
- 仅限admin角色使用

**查询条件：**
- 支持按空间名称、ID、用户ID、空间级别等条件查询
- 支持分页查询
 POST /space/list/page */
export async function listSpaceByPage(
    body: API.SpaceQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageSpace>("/space/list/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页查询空间列表 查询空间列表，支持按条件筛选。

**权限要求：**
- 需要登录
- 只能查询自己创建的空间

**限制条件：**
- 每页最多20条（防止爬虫）
- 支持按名称、级别等条件筛选
 POST /space/list/page/vo */
export async function listSpaceVoByPage(
    body: API.SpaceQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageSpaceVO>("/space/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询我的空间 查询当前登录用户创建的所有空间。

**权限要求：**
- 需要登录
- 只能查询自己创建的空间

**限制条件：**
- 每页最多20条（防止爬虫）
- 支持按名称等条件筛选
 POST /space/my/list/page/vo */
export async function listMySpaceVoByPage(
    body: API.SpaceQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageSpaceVO>("/space/my/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 更新空间信息（管理员专用） 管理员专用的空间信息更新接口。

**权限要求：**
- 仅限admin角色使用

**注意事项：**
- 如果修改了空间级别，会自动重新设置maxCount和maxSize
- 不会影响当前的totalSize和totalCount
 POST /space/update */
export async function updateSpace(
    body: API.SpaceUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/space/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}
