declare namespace API {
    type Announcement = {
        id?: string
        userId?: string
        title?: string
        content?: string
        createTime?: string
        updateTime?: string
        isDelete?: string
        priority?: number
    }

    type AnnouncementAddRequest = {
        /** 公告标题 */
        title?: string
        /** 公告内容 */
        content?: string
        /** 优先级（1优先级最高，0代表取消公告） */
        priority?: number
    }

    type AnnouncementQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 公告ID */
        id?: string
        /** 公告标题 */
        title?: string
        /** 发布人ID */
        userId?: string
        /** 优先级（1优先级最高，0代表取消公告） */
        priority?: number
    }

    type AnnouncementUpdateRequest = {
        /** 公告ID */
        id?: string
        /** 公告标题 */
        title?: string
        /** 公告内容 */
        content?: string
        /** 优先级（1优先级最高，0代表取消公告） */
        priority?: number
    }

    type AnnouncementVO = {
        /** 公告ID */
        id?: string
        /** 公告标题 */
        title?: string
        /** 公告内容 */
        content?: string
        /** 优先级（1优先级最高，0代表取消公告） */
        priority?: number
        /** 发布用户ID */
        userId?: string
        /** 发布用户信息 */
        userVO?: UserVO
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
    }

    type BaseResponseAnnouncement = {
        code?: number
        data?: Announcement
        message?: string
    }

    type BaseResponseAnnouncementVO = {
        code?: number
        data?: AnnouncementVO
        message?: string
    }

    type BaseResponseBoolean = {
        code?: number
        data?: boolean
        message?: string
    }

    type BaseResponseDiagramVO = {
        code?: number
        data?: DiagramVO
        message?: string
    }

    type BaseResponseFeedback = {
        code?: number
        data?: Feedback
        message?: string
    }

    type BaseResponseFeedbackVO = {
        code?: number
        data?: FeedbackVO
        message?: string
    }

    type BaseResponseListRoleWithAuthoritiesVO = {
        code?: number
        data?: RoleWithAuthoritiesVO[]
        message?: string
    }

    type BaseResponseListRoomMemberVO = {
        code?: number
        data?: RoomMemberVO[]
        message?: string
    }

    type BaseResponseListSpaceLevel = {
        code?: number
        data?: SpaceLevel[]
        message?: string
    }

    type BaseResponseListSpaceUserVO = {
        code?: number
        data?: SpaceUserVO[]
        message?: string
    }

    type BaseResponseLoginUserVO = {
        code?: number
        data?: LoginUserVO
        message?: string
    }

    type BaseResponseLong = {
        code?: number
        data?: string
        message?: string
    }

    type BaseResponseMaterial = {
        code?: number
        data?: Material
        message?: string
    }

    type BaseResponseMaterialVO = {
        code?: number
        data?: MaterialVO
        message?: string
    }

    type BaseResponsePageAnnouncement = {
        code?: number
        data?: PageAnnouncement
        message?: string
    }

    type BaseResponsePageAnnouncementVO = {
        code?: number
        data?: PageAnnouncementVO
        message?: string
    }

    type BaseResponsePageConversion = {
        code?: number
        data?: PageConversion
        message?: string
    }

    type BaseResponsePageDiagram = {
        code?: number
        data?: PageDiagram
        message?: string
    }

    type BaseResponsePageDiagramRoom = {
        code?: number
        data?: PageDiagramRoom
        message?: string
    }

    type BaseResponsePageDiagramVO = {
        code?: number
        data?: PageDiagramVO
        message?: string
    }

    type BaseResponsePageFeedback = {
        code?: number
        data?: PageFeedback
        message?: string
    }

    type BaseResponsePageFeedbackVO = {
        code?: number
        data?: PageFeedbackVO
        message?: string
    }

    type BaseResponsePageMaterial = {
        code?: number
        data?: PageMaterial
        message?: string
    }

    type BaseResponsePageMaterialVO = {
        code?: number
        data?: PageMaterialVO
        message?: string
    }

    type BaseResponsePageRoomVO = {
        code?: number
        data?: PageRoomVO
        message?: string
    }

    type BaseResponsePageSpace = {
        code?: number
        data?: PageSpace
        message?: string
    }

    type BaseResponsePageSpaceVO = {
        code?: number
        data?: PageSpaceVO
        message?: string
    }

    type BaseResponsePageUser = {
        code?: number
        data?: PageUser
        message?: string
    }

    type BaseResponsePageUserVO = {
        code?: number
        data?: PageUserVO
        message?: string
    }

    type BaseResponseRoomMember = {
        code?: number
        data?: RoomMember
        message?: string
    }

    type BaseResponseRoomVO = {
        code?: number
        data?: RoomVO
        message?: string
    }

    type BaseResponseSpace = {
        code?: number
        data?: Space
        message?: string
    }

    type BaseResponseSpaceUser = {
        code?: number
        data?: SpaceUser
        message?: string
    }

    type BaseResponseSpaceVO = {
        code?: number
        data?: SpaceVO
        message?: string
    }

    type BaseResponseString = {
        code?: number
        data?: string
        message?: string
    }

    type BaseResponseUser = {
        code?: number
        data?: User
        message?: string
    }

    type BaseResponseUserVO = {
        code?: number
        data?: UserVO
        message?: string
    }

    type checkLockParams = {
        roomId: string
    }

    type Conversion = {
        /** 主键ID */
        id?: string
        /** 用户ID */
        userId?: string
        /** 图表ID */
        diagramId?: string
        /** 消息类型(user代表用户，ai代表AI回复) */
        messageType?: string
        /** 消息内容 */
        message?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否删除(0未删除，1已删除) */
        isDelete?: number
    }

    type CustomChatRequest = {
        /** 对话消息 */
        message?: string
        /** 图表ID */
        diagramId?: string
        /** 模型名称 */
        modelId?: string
        /** API接口地址 */
        baseUrl?: string
        /** API密钥 */
        apiKey?: string
    }

    type DeleteRequest = {
        id?: string
    }

    type Diagram = {
        /** 图表主键ID */
        id?: string
        /** 用户ID */
        userId?: string
        /** 图表代码 */
        diagramCode?: string
        /** 图表名称 */
        name?: string
        /** 图表描述 */
        description?: string
        /** 图片URL */
        pictureUrl?: string
        /** 空间id */
        spaceId?: string
        /** 矢量图URL */
        svgUrl?: string
        /** SVG文件大小（字节） */
        svgSize?: string
        /** PNG文件大小（字节） */
        pngSize?: string
        /** 图片总大小（字节） */
        picSize?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否删除（0未删除，1删除） */
        isDelete?: number
    }

    type DiagramAddRequest = {
        /** 图表标题 */
        name?: string
        /** 图表代码 */
        diagramCode?: string
        /** 空间id */
        spaceId?: string
        /** 图片URL */
        pictureUrl?: string
    }

    type DiagramEditRequest = {
        /** 图表ID */
        id?: string
        /** 图表标题 */
        name?: string
        /** 图表描述 */
        description?: string
        spaceId?: string
        /** 图表代码 */
        diagramCode?: string
        /** 图片URL */
        pictureUrl?: string
    }

    type DiagramQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 图表ID */
        id?: string
        /** 空间id（可选，空代表查询公共空间） */
        spaceId?: string
        /** 搜索关键词 */
        searchText?: string
        /** 图表标题 */
        title?: string
        /** 图表代码 */
        diagramCode?: string
        /** 是否只查询 spaceId 为 null 的数据 */
        nullSpaceId?: boolean
        /** 创建用户ID */
        userId?: string
    }

    type DiagramRoom = {
        /** 房间ID */
        id?: string
        /** 房间名称 */
        roomName?: string
        /** 图表ID */
        diagramId?: string
        /** 创建者ID */
        ownerId?: string
        /** 加密后的图表数据 */
        encryptedData?: string
        /** 访问地址 */
        roomUrl?: string
        /** 加密向量 */
        iv?: string
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 访问密码 */
        accessKey?: string
        /** 空间ID */
        spaceId?: string
    }

    type DiagramUpdateRequest = {
        /** 图表ID */
        id?: string
        /** 图表标题 */
        name?: string
        /** 图表代码 */
        diagramCode?: string
        /** 图片URL */
        pictureUrl?: string
        /** 图表描述 */
        description?: string
        /** 空间id */
        spaceId?: string
    }

    type DiagramUploadRequest = {
        /** 业务类型 */
        biz?: string
        /** 图表ID */
        diagramId?: string
        /** 用户ID */
        userId?: string
        /** 空间ID */
        spaceId?: string
    }

    type DiagramVO = {
        /** 图表ID */
        id?: string
        /** 图表标题 */
        name?: string
        /** 创建用户ID */
        userId?: string
        /** 图片URL */
        pictureUrl?: string
        /** 矢量图URL */
        svgUrl?: string
        /** 空间id */
        spaceId?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 图表描述 */
        description?: string
        /** 图表代码 */
        diagramCode?: string
        /** 创建用户信息 */
        userVO?: UserVO
    }

    type doChatParams = {
        message: string
        diagramId: string
        modelId: string
    }

    type downloadRemoteFileParams = {
        fileName?: string
        type: string
        diagramId: string
    }

    type Feedback = {
        id?: string
        userId?: string
        content?: string
        pictureUrl?: string
        createTime?: string
        updateTime?: string
        isDelete?: number
        isHandle?: number
    }

    type FeedbackAddRequest = {
        /** 反馈内容 */
        content?: string
        /** 反馈图片URL */
        pictureUrl?: string
    }

    type FeedbackQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 反馈ID */
        id?: string
        /** 用户ID */
        userId?: string
        /** 反馈内容（模糊搜索） */
        content?: string
    }

    type FeedbackUpdateRequest = {
        id?: string
        isHandle?: number
    }

    type FeedbackVO = {
        /** 反馈ID */
        id?: string
        /** 反馈内容 */
        content?: string
        /** 反馈图片URL */
        pictureUrl?: string
        /** 反馈用户ID */
        userId?: string
        /** 反馈用户信息 */
        userVO?: UserVO
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否处理（0 未处理，1处理） */
        isHandle?: number
    }

    type getAnnouncementByIdParams = {
        id: number | string
    }

    type getAnnouncementVOByIdParams = {
        id: number | string
    }

    type getDiagramRoomVOByIdParams = {
        id: number | string
    }

    type getDiagramVOByIdParams = {
        id: number | string
    }

    type getFeedbackByIdParams = {
        id: number | string
    }

    type getFeedbackVOByIdParams = {
        id: number | string
    }

    type getMaterialByIdParams = {
        id: number | string
    }

    type getMaterialVOByIdParams = {
        id: number | string
    }

    type getRoomDiagramVOParams = {
        diagramId: number | string
        roomId: number | string
    }

    type getSpaceByIdParams = {
        id: number | string
    }

    type getSpaceVOByIdParams = {
        id: number | string
    }

    type getUserByIdParams = {
        id: number | string
    }

    type getUserVOByIdParams = {
        id: number | string
    }

    type GrantedAuthority = {
        authority?: string
    }

    type listDiagramChatHistoryParams = {
        diagramId: string
        pageSize?: number | string
        lasteCreateTime?: string
    }

    type LoginUserVO = {
        /** 用户ID */
        id?: string
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        authorities?: SysAuthority[]
    }

    type Material = {
        id?: string
        userId?: string
        name?: string
        description?: string
        tags?: string
        diagramCode?: string
        pictureUrl?: string
        svgUrl?: string
        createTime?: string
        updateTime?: string
        isDelete?: number
    }

    type MaterialAddRequest = {
        /** 素材名称 */
        name?: string
        /** 素材描述 */
        description?: string
        /** 标签（JSON数组字符串） */
        tags?: string
        /** 图表代码 */
        diagramCode?: string
        /** PNG图片地址 */
        pictureUrl?: string
        /** SVG图片地址 */
        svgUrl?: string
    }

    type MaterialQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 素材ID */
        id?: string
        /** 素材名称 */
        name?: string
        /** 标签（JSON数组字符串） */
        tags?: string
        /** 创作者ID */
        userId?: string
    }

    type MaterialUpdateRequest = {
        /** 素材ID */
        id?: string
        /** 素材名称 */
        name?: string
        /** 素材描述 */
        description?: string
        /** 标签（JSON数组字符串） */
        tags?: string
        /** 图表代码 */
        diagramCode?: string
        /** PNG图片地址 */
        pictureUrl?: string
        /** SVG图片地址 */
        svgUrl?: string
    }

    type MaterialVO = {
        /** 素材ID */
        id?: string
        /** 素材名称 */
        name?: string
        /** 素材描述 */
        description?: string
        /** 标签（JSON数组字符串） */
        tags?: string
        /** 图表代码 */
        diagramCode?: string
        /** PNG图片地址 */
        pictureUrl?: string
        /** SVG图片地址 */
        svgUrl?: string
        /** 创建用户ID */
        userId?: string
        /** 创建用户信息 */
        userVO?: UserVO
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
    }

    type OrderItem = {
        column?: string
        asc?: boolean
    }

    type PageAnnouncement = {
        records?: Announcement[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageAnnouncementVO = {
        records?: AnnouncementVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageConversion = {
        records?: Conversion[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageDiagram = {
        records?: Diagram[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageDiagramRoom = {
        records?: DiagramRoom[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageDiagramVO = {
        records?: DiagramVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageFeedback = {
        records?: Feedback[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageFeedbackVO = {
        records?: FeedbackVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageMaterial = {
        records?: Material[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageMaterialVO = {
        records?: MaterialVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageRoomVO = {
        records?: RoomVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageSpace = {
        records?: Space[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageSpaceVO = {
        records?: SpaceVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageUser = {
        records?: User[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type PageUserVO = {
        records?: UserVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: string
        countId?: string
        pages?: number
    }

    type RoleAuthorityUpdateRequest = {
        /** 角色ID */
        roleId: string
        /** 权限ID列表 */
        authorityIds: string[]
    }

    type RoleWithAuthoritiesVO = {
        id?: string
        roleName?: string
        description?: string
        createTime?: string
        updateTime?: string
        authorities?: SysAuthority[]
    }

    type RoomAddRequest = {
        /** 房间名称 */
        roomName?: string
        /** 图表ID */
        diagramId?: string
        /** 空间ID */
        spaceId?: string
    }

    type RoomEditRequest = {
        /** 房间ID */
        id?: string
        /** 房间名称 */
        roomName?: string
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 访问地址 */
        roomUrl?: string
        /** 访问密码 */
        accessKey?: string
    }

    type RoomMember = {
        /** 房间成员表ID */
        id?: string
        /** 成员ID */
        userId?: string
        /** 房间ID */
        roomId?: string
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
        /** 创建时间 */
        createTime?: string
        /** 房间角色 */
        roomRole?: string
        /** 更新时间 */
        updateTime?: string
    }

    type RoomMemberAddRequest = {
        /** 房间ID */
        roomId: string
        /** 用户ID */
        userId: string
        /** 房间角色 */
        roomRole: string
    }

    type RoomMemberEditRequest = {
        /** 房间成员关系ID */
        id: string
        /** 房间角色 */
        roomRole: string
    }

    type RoomMemberQueryRequest = {
        /** 房间成员关系ID */
        id?: string
        /** 房间ID */
        roomId?: string
        /** 用户ID */
        userId?: string
        /** 房间角色 */
        roomRole?: string
    }

    type RoomMemberVO = {
        /** 房间成员关系ID */
        id?: string
        /** 房间ID */
        roomId?: string
        /** 用户ID */
        userId?: string
        /** 用户昵称 */
        userName?: string
        /** 用户账号 */
        userAccount?: string
        /** 用户头像 */
        userAvatar?: string
        /** 房间角色 */
        roomRole?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
    }

    type RoomQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 房间ID */
        id?: string
        /** 房间名称 */
        roomName?: string
        /** 搜索关键词 */
        searchText?: string
        /** 图表ID */
        diagramId?: string
        /** 创建者ID */
        owerId?: string
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 空间ID */
        spaceId?: string
        /** 是否查询空空间id的记录 */
        nullSpaceId?: boolean
    }

    type RoomUpdateRequest = {
        /** 房间ID */
        id?: string
        /** 房间名称 */
        roomName?: string
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 访问密码 */
        accessKey?: string
    }

    type RoomUrlEditRequest = {
        /** 房间ID */
        id?: string
        /** 访问地址 */
        roomUrl?: string
    }

    type RoomVO = {
        /** 房间ID */
        id?: string
        /** 房间名称 */
        roomName?: string
        /** 图表ID */
        diagramId?: string
        /** 创建者ID */
        ownerId?: string
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
        /** 创建时间 */
        createTime?: string
        /** 访问地址 */
        roomUrl?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 创建用户信息 */
        userVO?: UserVO
        /** 空间id */
        spaceId?: string
    }

    type saveParams = {
        roomId: string
    }

    type Space = {
        id?: string
        spaceName?: string
        spaceLevel?: number
        maxSize?: string
        maxCount?: string
        totalSize?: string
        totalCount?: string
        spaceType?: number
        userId?: string
        createTime?: string
        editTime?: string
        updateTime?: string
        isDelete?: number
    }

    type SpaceAddReqeust = {
        spaceName?: string
        spaceLevel?: number
        spaceType?: number
        userId?: string
    }

    type SpaceEditRequest = {
        id?: string
        spaceName?: string
    }

    type SpaceLevel = {
        /** 级别值 */
        value?: number
        /** 级别文本 */
        text?: string
        /** 最大图表数量 */
        maxCount?: number
        /** 最大总大小（字节） */
        maxSize?: number
    }

    type SpaceQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        id?: string
        userId?: string
        spaceName?: string
        spaceType?: number
        spaceLevel?: number
    }

    type SpaceUpdateRequest = {
        id?: string
        spaceName?: string
        spaceLevel?: number
        maxSize?: string
        maxCount?: string
        totalSize?: string
        totalCount?: string
    }

    type SpaceUser = {
        id?: string
        spaceId?: string
        userId?: string
        spaceRole?: string
        authorities?: GrantedAuthority[]
        createTime?: string
        updateTime?: string
        isDelete?: number
        enabled?: boolean
        username?: string
        password?: string
        accountNonExpired?: boolean
        accountNonLocked?: boolean
        credentialsNonExpired?: boolean
    }

    type SpaceUserAddRequest = {
        spaceId?: string
        userId?: string
        spaceRole?: string
    }

    type SpaceUserDeleteRequest = {
        spaceId?: string
        userId?: string
    }

    type SpaceUserEditRequest = {
        id?: string
        spaceRole?: string
    }

    type SpaceUserQueryRequest = {
        id?: string
        spaceId?: string
        userId?: string
        spaceRole?: string
    }

    type SpaceUserVO = {
        id?: string
        spaceId?: string
        userId?: string
        spaceRole?: string
        createTime?: string
        updateTime?: string
        user?: UserVO
        space?: SpaceVO
    }

    type SpaceVO = {
        id?: string
        spaceName?: string
        spaceType?: number
        spaceLevel?: number
        maxSize?: string
        maxCount?: string
        totalSize?: string
        totalCount?: string
        userId?: string
        createTime?: string
        editTime?: string
        updateTime?: string
        userVO?: UserVO
    }

    type SseEmitter = {
        timeout?: string
    }

    type SysAuthority = {
        id?: string
        parentId?: string
        name?: string
        description?: string
        authority?: string
        type?: number
        createTime?: string
        updateTime?: string
        isDelete?: number
    }

    type uploadFileParams = {
        uploadFileRequest: UploadFileRequest
    }

    type UploadFileRequest = {
        /** 业务类型 */
        biz?: string
    }

    type uploadSnapshotParams = {
        roomId: string
    }

    type User = {
        /** 用户ID */
        id?: string
        /** 用户账号 */
        userAccount?: string
        /** 用户密码 */
        userPassword?: string
        /** 开放平台ID */
        unionId?: string
        /** 公众号OpenID */
        mpOpenId?: string
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        authorities?: GrantedAuthority[]
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
        enabled?: boolean
        username?: string
        password?: string
        authoritieList?: SysAuthority[]
        accountNonExpired?: boolean
        accountNonLocked?: boolean
        credentialsNonExpired?: boolean
    }

    type UserAddRequest = {
        /** 用户昵称 */
        userName?: string
        /** 用户账号 */
        userAccount?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户角色 */
        userRole?: string
    }

    type UserLoginRequest = {
        /** 用户账号 */
        userAccount?: string
        /** 用户密码 */
        userPassword?: string
    }

    type UserQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 用户ID */
        id?: string
        /** 开放平台ID */
        unionId?: string
        /** 公众号OpenID */
        mpOpenId?: string
        /** 用户昵称 */
        userName?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
    }

    type UserRegisterRequest = {
        /** 用户账号 */
        userAccount?: string
        /** 用户密码 */
        userPassword?: string
        /** 确认密码 */
        checkPassword?: string
        /** 用户昵称 */
        userName?: string
    }

    type UserRoleUpdateRequest = {
        /** 用户ID */
        userId: string
        /** 角色ID列表 */
        roleIds: string[]
    }

    type UserUpdateMyRequest = {
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
    }

    type UserUpdateRequest = {
        /** 用户ID */
        id?: string
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
    }

    type UserVO = {
        /** 用户ID */
        id?: string
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
        authorities?: SysAuthority[]
        /** 创建时间 */
        createTime?: string
    }
}
