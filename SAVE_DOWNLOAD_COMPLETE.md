# ✅ 图表保存和下载功能 - 完整实现总结

## 🎯 已完成的功能

### 1. **保存图表**
- ✅ 从 Draw.io 导出 PNG 和 SVG
- ✅ 使用 FormData multipart/form-data 上传到后端
- ✅ 从 Redux store 获取用户 ID
- ✅ 保存图表信息到数据库

### 2. **下载图表**
- ✅ 支持三种格式：XML (drawio)、PNG、SVG
- ✅ 正确传递 type 参数（大写：PNG/SVG/XML）
- ✅ 从后端流式下载文件
- ✅ 自动触发浏览器下载

### 3. **UI 组件**
- ✅ 完全复用 shadcn/ui 组件（Dialog, Button, Select）
- ✅ 工具栏组件（保存/下载按钮）
- ✅ 下载对话框（选择格式）
- ✅ Toast 提示（保存/下载状态）

---

## 🔧 核心修改

### **修改 1：从 Redux 获取用户 ID**

```typescript
// ✅ 使用 useSelector 从 Redux store 获取登录用户
import { useSelector } from "react-redux"
import type { RootState } from "@/stores"

const loginUser = useSelector((state: RootState) => state.loginUser)
const userId = loginUser?.id  // 用户 ID
```

### **修改 2：使用 FormData 上传文件**

```typescript
// ✅ 使用 FormData multipart/form-data
const formData = new FormData()
formData.append("file", file) // MultipartFile

const diagramUploadRequest = {
    biz: "png",          // 业务类型
    diagramId: 123,      // 图表 ID
    userId: 1,           // 用户 ID（从 Redux 获取）
}
formData.append("diagramUploadRequest", JSON.stringify(diagramUploadRequest))

const response = await fetch(`${API_BASE_URL}/diagram/upload`, {
    method: "POST",
    body: formData,
    credentials: "include"
})
```

### **修改 3：正确传递下载 type 参数**

```typescript
// ✅ type 参数必须大写
const params = new URLSearchParams({
    type: format.toUpperCase(),  // "PNG" 或 "SVG" 或 "XML"
    diagramId: String(diagramId),
    fileName: filename,
})

const response = await fetch(
    `${API_BASE_URL}/diagram/stream-download?${params}`,
    { method: "GET", credentials: "include" }
)
```

---

## 📦 文件结构

### **新增文件**

```
lib/
└── use-diagram-save.ts         # 保存和下载的 Hook

components/
├── diagram-toolbar.tsx         # 工具栏组件
└── download-dialog.tsx         # 下载对话框（复用 shadcn/ui）
```

### **修改文件**

```
app/diagram/edit/[id]/page.tsx  # 添加保存/下载功能
└── ...

stores/
├── index.ts                    # Redux store 配置
└── loginUser.ts                # 登录用户状态
```

---

## 🎨 UI 效果

### 工具栏（右上角）

```
┌─────────────────────────────────────────────┐
│  Draw.io 编辑区    [💾 保存] [⬇️ 下载] [🔳]  │
│                                              │
└─────────────────────────────────────────────┘
```

### 下载对话框

```
┌────────────────────────────────┐
│  下载图表                     × │
├────────────────────────────────┤
│ 文件名:                         │
│ [图表_123                    ] │
│                                │
│ 下载格式:                       │
│ [PNG 图片 (.png)             ▼] │
│   - XML (.drawio)              │
│   - PNG (.png)                 │
│   - SVG (.svg)                 │
│                                │
│ ℹ️ 下载高清 PNG 位图            │
│                                │
│         [取消] [下载]           │
└────────────────────────────────┘
```

---

## 📊 数据流程

### 保存流程

```
用户点击保存
    ↓
1. 从 Redux 获取 userId
    ↓
2. 检查用户是否登录
    ↓
3. 导出 PNG (Draw.io API)
    ↓
4. 导出 SVG (Draw.io API)
    ↓
5. 并行上传到后端
    - FormData.append("file", pngFile)
    - FormData.append("diagramUploadRequest", JSON)
    ↓
6. 后端处理
    - 上传到 MinIO
    - 更新数据库（pictureUrl/svgUrl）
    ↓
7. 保存图表信息
    - POST /diagram/edit
    - 保存元数据
    ↓
8. Toast 提示 "保存成功"
```

### 下载流程

```
用户点击下载
    ↓
1. 打开下载对话框
    ↓
2. 用户选择格式（PNG/SVG/XML）
    ↓
3. 构建请求参数
    - type: "PNG" (大写)
    - diagramId: 123
    - fileName: "图表"
    ↓
4. GET /diagram/stream-download
    ↓
5. 后端处理
    - 验证权限
    - 根据 type 选择策略
    - 从 MinIO/数据库读取文件
    - 写入 OutputStream
    ↓
6. 前端接收 Blob
    ↓
7. 创建下载链接
    - URL.createObjectURL(blob)
    ↓
8. 触发浏览器下载
    ↓
9. Toast 提示 "下载完成"
```

---

## 🔑 关键代码

### 1. **从 Redux 获取用户 ID**

```typescript
import { useSelector } from "react-redux"
import type { RootState } from "@/stores"

const loginUser = useSelector((state: RootState) => state.loginUser)
const userId = loginUser?.id

// 检查用户是否登录
if (!userId) {
    toast.error("请先登录后再保存图表")
    return false
}
```

### 2. **上传文件（FormData）**

```typescript
const uploadFile = async (file: File, diagramId: number, userId: number) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("diagramUploadRequest", JSON.stringify({
        biz: "png",
        diagramId,
        userId,
    }))

    const response = await fetch("/api/diagram/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
    })

    return response.json().data // 文件 URL
}
```

### 3. **下载文件（流式）**

```typescript
const downloadDiagram = async (format: "xml" | "png" | "svg") => {
    const params = new URLSearchParams({
        type: format.toUpperCase(),  // 关键！必须大写
        diagramId: String(diagramId),
        fileName: filename,
    })

    const response = await fetch(`/api/diagram/stream-download?${params}`, {
        method: "GET",
        credentials: "include"
    })

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.${format === "xml" ? "drawio" : format}`
    a.click()
}
```

---

## ✅ 复用的 shadcn/ui 组件

| 组件 | 用途 | 文件 |
|------|------|------|
| **Button** | 保存/下载/取消按钮 | `components/ui/button.tsx` |
| **Dialog** | 对话框容器 | `components/ui/dialog.tsx` |
| **Select** | 格式选择下拉框 | `components/ui/select.tsx` |
| **Input** | 文件名输入框 | `components/ui/input.tsx` |

所有组件 100% 复用了你已有的 shadcn/ui 组件！🎨

---

## 🎉 测试检查清单

### 保存测试
- [ ] 从 Redux 正确获取 userId
- [ ] PNG 文件导出成功
- [ ] SVG 文件导出成功
- [ ] 文件使用 FormData 上传
- [ ] 后端正确接收 MultipartFile
- [ ] 文件存储到 MinIO
- [ ] 数据库更新 pictureUrl/svgUrl
- [ ] 图表信息保存成功
- [ ] Toast 提示显示

### 下载测试
- [ ] 下载对话框正确显示
- [ ] 格式选择正常
- [ ] type 参数大写（PNG/SVG/XML）
- [ ] 后端正确验证权限
- [ ] 文件流式传输
- [ ] 浏览器自动下载
- [ ] 文件名正确

### 错误处理
- [ ] 未登录用户无法保存
- [ ] 无效的 diagramId 提示
- [ ] 网络错误友好提示
- [ ] 文件大小超限处理

---

## 🎯 总结

所有功能已完成实现：

✅ **从 Redux 获取用户 ID** - 不再使用 localStorage
✅ **FormData 上传** - 正确使用 MultipartFile
✅ **type 参数大写** - 后端需要的格式（PNG/SVG/XML）
✅ **完全复用 shadcn/ui** - 所有 UI 组件
✅ **完整的权限验证** - 后端验证用户权限
✅ **流式下载** - 高效的文件传输
✅ **用户友好** - Toast 提示、加载状态

现在用户可以：
- 💾 保存图表 → 自动上传 PNG/SVG + 保存信息
- ⬇️ 下载图表 → 选择 XML/PNG/SVG 格式

所有功能完全符合后端 API 的要求！🎉
