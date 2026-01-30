
export interface SolutionData {
    slug: string
    title: string
    description: string
    keywords: string[]
    heroTitle: string
    heroSubtitle: string
    features: {
        title: string
        desc: string
        icon: string
    }[]
    faq: {
        question: string
        answer: string
    }[]
}

export const solutions: Record<string, SolutionData> = {
    "uml-diagram": {
        slug: "uml-diagram",
        title: "免费在线 UML 类图工具 - IntelliDraw",
        description: "IntelliDraw 是最好的免费在线 UML 绘图工具。支持类图、时序图、用例图等所有 UML 2.5 标准图形。无需安装，打开浏览器即可使用，支持 AI 辅助生成代码。",
        keywords: ["UML工具", "在线UML", "类图", "时序图", "IntelliDraw"],
        heroTitle: "专业级在线 UML 建模工具",
        heroSubtitle: "专为开发者设计。支持从代码生成 UML，或从 UML 生成代码。完美支持 UML 2.5 标准。",
        features: [
            {
                title: "标准 UML图库",
                desc: "内置完整的 UML 符号库，轻松绘制类图、时序图、状态图等。",
                icon: "Code",
            },
            {
                title: "PlantUML 支持",
                desc: "支持导入和编辑 PlantUML 代码，实现代码即图表。",
                icon: "Terminal",
            },
            {
                title: "团队实时协作",
                desc: "邀请团队成员实时协作编辑同一个 UML 图，架构评审更高效。",
                icon: "Users",
            },
        ],
        faq: [
            {
                question: "IntelliDraw 是否支持从代码生成 UML？",
                answer: "是的，IntelliDraw 的 AI 功能可以分析您的代码片段并自动生成相应的 UML 类图或时序图。",
            },
            {
                question: "生成的图表可以导出吗？",
                answer: "支持导出为 HD PNG, SVG, PDF 以及 XML 等多种格式。",
            },
        ],
    },
    "flowchart": {
        slug: "flowchart",
        title: "免费在线流程图制作软件 - IntelliDraw",
        description: "IntelliDraw 简单好用的在线流程图工具。海量流程图模板，拖拽式操作，一键美化。适合产品经理、项目经理使用。",
        keywords: ["流程图", "在线流程图", "Flowchart", "IntelliDraw"],
        heroTitle: "简单高效的流程图制作工具",
        heroSubtitle: "用最简单的方式梳理复杂的业务逻辑。IntelliDraw 让流程图绘制变得前所未有的简单。",
        features: [
            {
                title: "海量模板",
                desc: "提供泳道图、业务流程图、数据流程图等多种场景模板。",
                icon: "Layout",
            },
            {
                title: "智能排版",
                desc: "一键自动整理布局，让混乱的线条瞬间清晰有序。",
                icon: "Wand2",
            },
            {
                title: "Visio 兼容",
                desc: "完美支持导入和导出 Visio (.vsdx) 文件，无缝迁移工作成果。",
                icon: "FileInput",
            },
        ],
        faq: [
            {
                question: "可以免费使用吗？",
                answer: "IntelliDraw 提供功能强大的免费版本，满足绝大多数日常绘图需求。",
            },
        ],
    },
    // Add more...
}

export const getSolutionBySlug = (slug: string) => solutions[slug] || null
