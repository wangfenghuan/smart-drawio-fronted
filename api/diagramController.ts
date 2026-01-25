/* eslint-disable */
import request from "@/lib/request"

/** 创建图表 创建一个新的图表记录。

**空间额度影响：**
- **私有空间（spaceId不为空）：**
  - 图表数量会计入空间的totalCount
  - 只有空间创建人才能创建
  - 创建前会校验空间图表数量是否充足
  - picSize初始为0，后续上传文件时会更新
- **公共图库（spaceId为空）：**
  - 不计入任何空间额度
  - 所有登录用户都可以创建

**权限要求：**
- 需要登录
- 私有空间：仅空间创建人可创建
- 公共图库：所有登录用户可创建

**业务流程：**
1. 校验空间是否存在（如果指定了spaceId）
2. 校验用户权限
3. 校验空间额度（图表数量）
4. 创建图表记录
5. 更新空间totalCount
 POST /diagram/add */
export async function addDiagram(
    body: API.DiagramAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/diagram/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 检查上传权限并抢锁 用于协作场景，多个客户端同时编辑时，抢到锁的客户端负责上传图表操作快照到服务器。抢锁成功后有5分钟的冷却期，冷却期内其他客户端无法抢锁。 GET /diagram/check-lock/${param0} */
export async function checkLock(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.checkLockParams,
    options?: { [key: string]: any },
) {
    const { roomId: param0, ...queryParams } = params
    return request<API.BaseResponseBoolean>(`/diagram/check-lock/${param0}`, {
        method: "GET",
        params: { ...queryParams },
        ...(options || {}),
    })
}

/** 删除图表 删除指定的图表，并自动释放空间额度。

**空间类型说明：**
- **spaceId == null：** 公共空间，不参与RBAC权限控制
  - 仅图表创建人或管理员可删除
- **spaceId != null：** 私有空间或团队空间，需要RBAC权限控制
  - 需要有空间的删除图表权限

**空间额度影响：**
- **私有空间：**
  - 释放空间的totalSize（减去图表的picSize）
  - 减少空间的totalCount（图表数量减1）
  - picSize = svgSize + pngSize
- **公共图库：**
  - 不影响任何空间额度

**权限要求：**
- 需要登录
- 公共空间：仅图表创建人或管理员可删除
- 私有/团队空间：需要有空间的删除权限

**注意事项：**
- 删除操作使用事务，确保额度释放和图表删除原子性
- 删除后无法恢复，请谨慎操作
- 对象存储中的文件不会自动删除（可通过定时任务清理）
 POST /diagram/delete */
export async function deleteDiagram(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/diagram/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 编辑图表信息（给用户使用） 编辑图表的基本信息。

**空间类型说明：**
- **spaceId == null：** 公共空间，不参与RBAC权限控制
  - 仅图表创建人或管理员可编辑
- **spaceId != null：** 私有空间或团队空间，需要RBAC权限控制
  - 需要有空间的编辑图表权限

**权限要求：**
- 需要登录
- 公共空间：仅图表创建人或管理员可编辑
- 私有/团队空间：需要有空间的编辑权限
 POST /diagram/edit */
export async function editDiagram(
    body: API.DiagramEditRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/diagram/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 获取图表详情 根据ID获取图表的详细信息。

**权限要求：**
- 需要登录
- 公共图库：仅图表创建人或管理员可查看
- 私有空间：需要空间权限校验

**返回内容：**
- 图表基本信息（ID、名称、描述等）
- 文件URL（svgUrl、pictureUrl）
- 文件大小（svgSize、pngSize、picSize）
- 所属空间信息（spaceId）
 GET /diagram/get/vo */
export async function getDiagramVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getDiagramVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseDiagramVO>("/diagram/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 此处后端没有提供注释 POST /diagram/getDiagrams */
export async function getByPage(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagramVO>("/diagram/getDiagrams", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页查询图表（管理员专用） 管理员专用的图表列表查询接口，可以查询所有图表。

**权限要求：**
- 仅限admin角色使用

**查询条件：**
- 支持按图表名称、ID、用户ID、空间ID等条件查询
- 支持分页查询
 POST /diagram/list/page */
export async function listDiagramByPage(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagram>("/diagram/list/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页查询图表列表 查询图表列表，支持公共图库和私有空间两种模式。

**查询模式：**
- **公共图库（spaceId为空）：**
  - 查询所有不属于任何空间的图表
  - 所有登录用户都可以查看
- **私有空间（spaceId不为空）：**
  - 查询指定空间的图表
  - 仅空间创建人可以查询

**权限要求：**
- 需要登录
- 私有空间：仅空间创建人可查询

**限制条件：**
- 每页最多20条（防止爬虫）
- 支持按名称、ID等条件筛选
 POST /diagram/list/page/vo */
export async function listDiagramVoByPage(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagramVO>("/diagram/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询我的图表 查询当前登录用户创建的所有图表，包括公共图库和私有空间的图表。

**查询范围：**
- 包含用户在公共图库创建的图表
- 包含用户在自己私有空间创建的图表

**权限要求：**
- 需要登录
- 只能查询自己创建的图表

**限制条件：**
- 每页最多20条（防止爬虫）
- 支持按名称等条件筛选
 POST /diagram/my/list/page/vo */
export async function listMyDiagramVoByPage(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagramVO>("/diagram/my/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 下载图表文件 根据图表ID和文件类型，从对象存储流式下载图表文件。

**支持格式：**
- **SVG：** 矢量图格式，可缩放不失真
- **PNG：** 位图格式，适合展示
- **XML：** DrawIO原生格式，包含完整的图表结构

**权限要求：**
- 需要登录
- 仅图表创建人或管理员可下载

**下载方式：**
- 采用流式代理下载，直接从对象存储读取并写入响应流
- 不占用服务器内存，适合大文件下载
- 自动设置正确的Content-Type和Content-Disposition响应头
 GET /diagram/stream-download */
export async function downloadRemoteFile(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.downloadRemoteFileParams,
    options?: { [key: string]: any },
) {
    return request<any>("/diagram/stream-download", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 更新图表（管理员专用） 管理员专用的图表更新接口，可以更新任意图表信息。

**权限要求：**
- 仅限admin角色使用

**注意事项：**
- 此接口不会影响空间额度
- 如果需要修改文件大小相关的信息，请谨慎操作
 POST /diagram/update */
export async function updateDiagram(
    body: API.DiagramUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/diagram/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 上传图表文件 上传图表文件（SVG或PNG格式）到对象存储，并更新图表记录和空间额度。

**功能说明：**
- 支持SVG和PNG两种格式的图表文件上传
- 如果指定了spaceId，文件会存储到私有空间，并计入空间额度
- 如果未指定spaceId，文件会存储到公共图库，不计入额度

**空间额度影响：**
- **私有空间（spaceId不为空）：**
  - 文件大小会计入空间的totalSize（总大小）
  - 图表数量会计入空间的totalCount（图表数量）
  - 只有空间创建人（管理员）才能上传
  - 上传前会校验空间额度是否充足
  - picSize = svgSize + pngSize（同时支持两种格式）
- **公共图库（spaceId为空）：**
  - 不计入任何空间额度
  - 任何登录用户都可以上传

**额度计算规则：**
- 首次上传SVG：picSize增加svgSize
- 首次上传PNG：picSize增加pngSize
- 替换SVG：picSize = (picSize - 旧svgSize) + 新svgSize
- 替换PNG：picSize = (picSize - 旧pngSize) + 新pngSize

**权限要求：**
- 需要登录
- 私有空间：仅空间创建人可上传
- 公共图库：所有登录用户可上传
 POST /diagram/upload */
export async function uploadDiagram(
    body: {
        diagramUploadRequest: API.DiagramUploadRequest
    },
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseString>("/diagram/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 上传图表快照 保存协作房间的图表状态快照。上传成功后会异步清理旧的操作记录，只保留最近的状态，减少存储空间占用。 POST /diagram/uploadSnapshot/${param0} */
export async function uploadSnapshot(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.uploadSnapshotParams,
    body: string,
    options?: { [key: string]: any },
) {
    const { roomId: param0, ...queryParams } = params
    return request<API.BaseResponseBoolean>(
        `/diagram/uploadSnapshot/${param0}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            params: { ...queryParams },
            data: body,
            ...(options || {}),
        },
    )
}
