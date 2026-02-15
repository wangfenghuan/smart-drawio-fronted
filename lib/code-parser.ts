"use client"

// web-tree-sitter types: Parser is default export, Node/Tree/Language are named exports
import type { Node as TSNode, Tree as TSTree, Language as TSLanguage } from "web-tree-sitter"

// ============================================================
// Types
// ============================================================

export interface ClassInfo {
    name: string
    type: "class" | "interface" | "enum" | "abstract_class" | "record"
    annotations: string[]
    extends: string | null
    implements: string[]
    methods: string[]
}

export interface FileMetadata {
    filePath: string
    language: "java"
    packageName: string
    imports: string[]
    classes: ClassInfo[]
}

export interface ProjectMetadata {
    totalFiles: number
    totalClasses: number
    languages: string[]
    files: FileMetadata[]
}

// ============================================================
// Tree-sitter singleton (use `any` for parser instance to avoid WASM type issues)
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let parserInstance: any = null
let javaLanguage: TSLanguage | null = null
let initPromise: Promise<void> | null = null

/**
 * Initialize Tree-sitter WASM parser with Java grammar (singleton).
 * WASM files are served from /wasm/ in the public directory.
 */
export async function initTreeSitter(): Promise<void> {
    if (parserInstance && javaLanguage) return
    if (initPromise) return initPromise

    initPromise = (async () => {
        try {
            // Dynamic import to avoid SSR issues
            // Use patched version to avoid 'fs/promises' build error
            // @ts-ignore - Importing JS file directly
            const TreeSitterModule = await import("./web-tree-sitter")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Parser = (TreeSitterModule as any).default || TreeSitterModule
            
            await Parser.init({
                locateFile: (scriptName: string) => `/wasm/${scriptName}`,
            })

            parserInstance = new Parser()
            javaLanguage = await Parser.Language.load("/wasm/tree-sitter-java.wasm")
            parserInstance.setLanguage(javaLanguage)

            console.log("[CodeParser] Tree-sitter Java parser initialized")
        } catch (error) {
            console.error("[CodeParser] Failed to initialize Tree-sitter:", error)
            initPromise = null
            throw error
        }
    })()

    return initPromise
}

// ============================================================
// AST Walking Helpers
// ============================================================

function getNodeText(node: TSNode): string {
    return node.text.trim()
}

/**
 * Extract the package declaration from the AST root.
 */
function extractPackage(tree: TSTree): string {
    const root = tree.rootNode
    for (let i = 0; i < root.childCount; i++) {
        const child = root.child(i)
        if (!child) continue
        if (child.type === "package_declaration") {
            const scopedId = child.childForFieldName("name")
                ?? child.children.find((c: TSNode) => c.type === "scoped_identifier" || c.type === "identifier")
            return scopedId ? getNodeText(scopedId) : ""
        }
    }
    return ""
}

/**
 * Extract all import declarations.
 */
function extractImports(tree: TSTree): string[] {
    const imports: string[] = []
    const root = tree.rootNode
    for (let i = 0; i < root.childCount; i++) {
        const child = root.child(i)
        if (!child) continue
        if (child.type === "import_declaration") {
            let text = getNodeText(child)
            text = text.replace(/^import\s+/, "").replace(/;$/, "").trim()
            imports.push(text)
        }
    }
    return imports
}

/**
 * Sanitize annotation string values (replace string content with ***).
 */
function sanitizeAnnotation(node: TSNode): string {
    let text = getNodeText(node)
    text = text.replace(/"[^"]*"/g, '"***"')
    return text
}

/**
 * Extract annotations from a node's modifiers.
 */
function extractAnnotations(node: TSNode): string[] {
    const annotations: string[] = []
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i)
        if (!child) continue
        if (child.type === "modifiers") {
            for (let j = 0; j < child.childCount; j++) {
                const mod = child.child(j)
                if (!mod) continue
                if (mod.type === "marker_annotation" || mod.type === "annotation") {
                    annotations.push(sanitizeAnnotation(mod))
                }
            }
        }
    }
    return annotations
}

/**
 * Extract the superclass from a class declaration.
 */
function extractSuperclass(node: TSNode): string | null {
    const superclass = node.childForFieldName("superclass")
    if (superclass) {
        const typeNode = superclass.children.find(
            (c: TSNode) => c.type === "type_identifier" || c.type === "generic_type"
        )
        return typeNode ? getNodeText(typeNode) : getNodeText(superclass).replace(/^extends\s+/, "")
    }
    return null
}

/**
 * Extract implemented interfaces.
 */
function extractInterfaces(node: TSNode): string[] {
    const interfaces: string[] = []
    const impl = node.childForFieldName("interfaces")
    if (impl) {
        for (let i = 0; i < impl.childCount; i++) {
            const child = impl.child(i)
            if (!child) continue
            if (child.type === "type_identifier" || child.type === "generic_type") {
                interfaces.push(getNodeText(child))
            } else if (child.type === "type_list") {
                for (let j = 0; j < child.childCount; j++) {
                    const typeChild = child.child(j)
                    if (!typeChild) continue
                    if (typeChild.type === "type_identifier" || typeChild.type === "generic_type") {
                        interfaces.push(getNodeText(typeChild))
                    }
                }
            }
        }
    }
    return interfaces
}

/**
 * Extract method names from a class body.
 */
function extractMethods(bodyNode: TSNode): string[] {
    const methods: string[] = []
    for (let i = 0; i < bodyNode.childCount; i++) {
        const child = bodyNode.child(i)
        if (!child) continue
        if (child.type === "method_declaration" || child.type === "constructor_declaration") {
            const nameNode = child.childForFieldName("name")
            if (nameNode) {
                methods.push(getNodeText(nameNode))
            }
        }
    }
    return methods
}

/**
 * Check if a class has the abstract modifier.
 */
function isAbstractClass(node: TSNode): boolean {
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i)
        if (!child) continue
        if (child.type === "modifiers") {
            for (let j = 0; j < child.childCount; j++) {
                const mod = child.child(j)
                if (mod && mod.text === "abstract") return true
            }
        }
    }
    return false
}

/**
 * Recursively extract class/interface/enum declarations from a subtree.
 */
function extractClassDeclarations(node: TSNode): ClassInfo[] {
    const classes: ClassInfo[] = []
    const declarationTypes = [
        "class_declaration",
        "interface_declaration",
        "enum_declaration",
        "record_declaration",
    ]

    if (declarationTypes.includes(node.type)) {
        const nameNode = node.childForFieldName("name")
        if (nameNode) {
            let classType: ClassInfo["type"] = "class"
            if (node.type === "interface_declaration") classType = "interface"
            else if (node.type === "enum_declaration") classType = "enum"
            else if (node.type === "record_declaration") classType = "record"
            else if (isAbstractClass(node)) classType = "abstract_class"

            const body = node.childForFieldName("body")
            classes.push({
                name: getNodeText(nameNode),
                type: classType,
                annotations: extractAnnotations(node),
                extends: extractSuperclass(node),
                implements: extractInterfaces(node),
                methods: body ? extractMethods(body) : [],
            })
        }
    }

    // Recurse into children for top-level declarations and inner classes
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i)
        if (!child) continue
        if (
            child !== node &&
            (!declarationTypes.includes(child.type) ||
                node.type === "program" || node.type === "class_body")
        ) {
            classes.push(...extractClassDeclarations(child))
        }
    }

    return classes
}

// ============================================================
// Main Parse Function
// ============================================================

/**
 * Parse a single Java source file and extract metadata using Tree-sitter AST.
 */
export async function parseJavaFile(
    filePath: string,
    content: string,
): Promise<FileMetadata> {
    await initTreeSitter()

    if (!parserInstance) {
        throw new Error("Tree-sitter parser not initialized")
    }

    const tree: TSTree = parserInstance.parse(content)

    const metadata: FileMetadata = {
        filePath,
        language: "java",
        packageName: extractPackage(tree),
        imports: extractImports(tree),
        classes: extractClassDeclarations(tree.rootNode),
    }

    tree.delete()

    return metadata
}

/**
 * Aggregate multiple file metadata into a project-level summary.
 */
export function aggregateProject(files: FileMetadata[]): ProjectMetadata {
    return {
        totalFiles: files.length,
        totalClasses: files.reduce((sum, f) => sum + f.classes.length, 0),
        languages: ["java"],
        files,
    }
}

/**
 * Generate a DDD analysis prompt for the AI from project metadata.
 */
export function generateDDDPrompt(projectMeta: ProjectMetadata, zipName: string): string {
    const metaJSON = JSON.stringify(projectMeta, null, 2)

    return `[代码分析: ${zipName}]

我从代码压缩包中提取了以下项目结构元数据。元数据包含类名、引用关系（Import）、注解（Annotation）和继承/实现关系，以 JSON 格式表示。

总计: ${projectMeta.totalFiles} 个文件, ${projectMeta.totalClasses} 个类/接口

\`\`\`json
${metaJSON}
\`\`\`

请根据 DDD（领域驱动设计）原则分析这些类和引用关系：
1. 识别限界上下文（Bounded Contexts）和聚合根（Aggregates）
2. 分析模块之间的依赖关系
3. 推导出合理的模块划分
4. 生成一个架构图，展示模块间的关系和依赖`
}
