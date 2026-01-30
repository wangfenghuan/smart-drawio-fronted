export interface WikiArticle {
    slug: string
    title: string
    description: string
    category: string
    content: string // Markdown content
    relatedTemplates: string[]
}

export const wikiArticles: Record<string, WikiArticle> = {
    "what-is-uml-diagram": {
        slug: "what-is-uml-diagram",
        title: "什么是 UML 图？UML 建模入门指南",
        description: "本文详细介绍了什么是统一建模语言 (UML)，UML 图的 14 种类型，以及如何使用 IntelliDraw 快速绘制标准的 UML 图。",
        category: "UML",
        relatedTemplates: ["uml-class", "uml-sequence"],
        content: `
# 什么是 UML 图？

**统一建模语言 (Unified Modeling Language, UML)** 是一种标准化的通用建模语言，主要用于软件工程领域。它可以帮助开发人员、架构师和业务分析师可视化、构建和记录软件系统的构件。

## UML 图的分类

UML 2.5 标准定义了 14 种类型的图表，主要分为两大类：

### 1. 结构图 (Structure Diagrams)
展示系统的静态结构。
- **类图 (Class Diagram)**: 最常用的 UML 图，描述系统的类、属性、方法及其关系。
- **组件图 (Component Diagram)**: 描述组件及其相互依赖关系。
- **部署图 (Deployment Diagram)**: 描述硬件的拓扑结构以及软件在硬件上的部署。

### 2. 行为图 (Behavior Diagrams)
展示系统的动态行为。
- **用例图 (Use Case Diagram)**: 描述用户与系统的交互。
- **序列图/时序图 (Sequence Diagram)**: 展示对象之间交互的时间顺序。
- **状态图 (State Machine Diagram)**: 描述对象在生命周期中的状态变化。

## 为什么要使用 UML？

1. **标准化沟通**: 使用统一的符号，消除沟通歧义。
2. **可视化架构**: 帮助理清复杂的系统依赖关系。
3. **文档化**: 为后续维护提供清晰的文档支持。

## 如何使用 IntelliDraw 绘制 UML 图？

IntelliDraw 提供了完整的 UML 符号库和 AI 辅助功能：

1. 打开 [IntelliDraw 编辑器](/diagram/new)。
2. 在左侧图形库中勾选 "UML"。
3. 拖拽 "Class" 或 "Interface" 图形到画布。
4. 或者，使用 AI 功能，输入 "帮我生成一个电商系统的类图"，即可自动生成。

> [!TIP]
> 这里的 AI 生成功能是 IntelliDraw 的核心优势，能够极大提高建模效率。

`,
    },
    "how-to-draw-flowchart": {
        slug: "how-to-draw-flowchart",
        title: "流程图绘制最佳实践：从入门到精通",
        description: "学习如何绘制清晰、专业的流程图。包含标准符号说明、布局技巧以及常见错误规避。",
        category: "Flowchart",
        relatedTemplates: ["flow-swimlane", "flow-basic"],
        content: `
# 流程图绘制最佳实践

流程图是梳理业务逻辑、算法思路最有效的工具。一个好的流程图应该清晰、易读、逻辑严密。

## 标准符号指南

- **起止框 (椭圆)**: 表示流程的开始或结束。
- **处理框 (矩形)**: 表示一个具体的步骤或操作。
- **判断框 (菱形)**: 表示需要做决策的节点，通常有两个出口 (Yes/No)。
- **输入/输出 (平行四边形)**: 表示数据的输入或输出。

## 绘制技巧

1. **统一流向**: 尽量从左到右，从上到下。
2. **避免交叉**: 尽量减少连线的交叉，使用跨线或连接点。
3. **大小一致**: 相同类型的图形保持大小一致，视觉更整洁。

## 使用 IntelliDraw 快速绘图

在 IntelliDraw 中，你只需要：
- 拖拽图形，吸附对齐。
- 点击图形边缘的箭头，自动连接下一个图形。
- 使用 **"一键美化"** 功能自动整理混乱的连接线。

立即尝试 [免费绘制流程图](/diagram/new)！
`,
    },
}

export const getWikiBySlug = (slug: string) => wikiArticles[slug] || null
