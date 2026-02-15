"use client"

import JSZip from "jszip"
import {
    type FileMetadata,
    type ProjectMetadata,
    aggregateProject,
    generateDDDPrompt,
    initTreeSitter,
    parseJavaFile,
} from "./code-parser"

// ============================================================
// Configuration
// ============================================================

/** Directories to skip when scanning ZIP contents */
const SKIP_DIRS = [
    "node_modules",
    "build",
    "dist",
    "target",
    ".git",
    ".svn",
    ".idea",
    ".vscode",
    ".gradle",
    "bin",
    "out",
    "__pycache__",
    ".settings",
]

/** File patterns to skip */
const SKIP_PATTERNS = [
    /test/i,
    /Test\.java$/,
    /Tests\.java$/,
    /IT\.java$/,
    /Mock/i,
    /package-info\.java$/,
    /module-info\.java$/,
]

/** Max file size to parse (500KB per file) */
const MAX_FILE_SIZE = 500 * 1024

/** Max total files to parse */
const MAX_FILES = 300

// ============================================================
// Types
// ============================================================

export interface ZipProcessingResult {
    metadata: ProjectMetadata
    prompt: string
    zipName: string
    skippedFiles: number
    errors: string[]
}

export interface ZipProgressCallback {
    (phase: string, current: number, total: number): void
}

// ============================================================
// Core Processing
// ============================================================

/**
 * Check if a file path should be skipped.
 */
function shouldSkip(filePath: string): boolean {
    const parts = filePath.split("/")
    // Check if any directory in the path is in the skip list
    for (const part of parts) {
        if (SKIP_DIRS.includes(part)) return true
    }
    // Check skip patterns on the filename
    const fileName = parts[parts.length - 1]
    return SKIP_PATTERNS.some((pattern) => pattern.test(fileName))
}

/**
 * Check if a file is a Java source file.
 */
function isJavaFile(filePath: string): boolean {
    return filePath.endsWith(".java")
}

/**
 * Process a ZIP file: extract, parse Java files via Tree-sitter, and generate DDD prompt.
 *
 * @param file - The uploaded ZIP File object
 * @param onProgress - Optional callback for progress updates
 * @returns Processing result with metadata, prompt, and any errors
 */
export async function processZipFile(
    file: File,
    onProgress?: ZipProgressCallback,
): Promise<ZipProcessingResult> {
    const errors: string[] = []
    let skippedFiles = 0

    // Phase 1: Initialize Tree-sitter
    onProgress?.("初始化解析器...", 0, 1)
    try {
        await initTreeSitter()
    } catch (error) {
        throw new Error(`Tree-sitter 初始化失败: ${error}`)
    }

    // Phase 2: Extract ZIP
    onProgress?.("解压缩文件...", 0, 1)
    let zip: JSZip
    try {
        const arrayBuffer = await file.arrayBuffer()
        zip = await JSZip.loadAsync(arrayBuffer)
    } catch (error) {
        throw new Error(`ZIP 解压失败: ${error}`)
    }

    // Phase 3: Filter Java files
    const javaEntries: { path: string; zipObj: JSZip.JSZipObject }[] = []
    zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return
        if (!isJavaFile(relativePath)) return
        if (shouldSkip(relativePath)) {
            skippedFiles++
            return
        }
        javaEntries.push({ path: relativePath, zipObj: zipEntry })
    })

    if (javaEntries.length === 0) {
        throw new Error("ZIP 文件中未找到 Java 源代码文件")
    }

    // Limit the number of files to parse
    const entriesToParse = javaEntries.slice(0, MAX_FILES)
    if (javaEntries.length > MAX_FILES) {
        skippedFiles += javaEntries.length - MAX_FILES
        errors.push(
            `文件数量超过上限 (${MAX_FILES})，已跳过 ${javaEntries.length - MAX_FILES} 个文件`,
        )
    }

    // Phase 4: Parse each Java file with Tree-sitter
    const parsedFiles: FileMetadata[] = []
    for (let i = 0; i < entriesToParse.length; i++) {
        const entry = entriesToParse[i]
        onProgress?.("解析 Java 文件...", i + 1, entriesToParse.length)

        try {
            const content = await entry.zipObj.async("string")

            // Skip files that are too large
            if (content.length > MAX_FILE_SIZE) {
                skippedFiles++
                errors.push(`跳过大文件: ${entry.path} (${(content.length / 1024).toFixed(0)}KB)`)
                continue
            }

            const metadata = await parseJavaFile(entry.path, content)
            // Only include files that have meaningful content (classes/interfaces)
            if (metadata.classes.length > 0) {
                parsedFiles.push(metadata)
            }
        } catch (error) {
            errors.push(`解析失败: ${entry.path} (${error})`)
        }
    }

    if (parsedFiles.length === 0) {
        throw new Error(
            "未能从 ZIP 中提取到有效的 Java 类信息。请确保 ZIP 包含 Java 源代码文件。",
        )
    }

    // Phase 5: Aggregate and generate prompt
    onProgress?.("生成分析结果...", 1, 1)
    const projectMeta = aggregateProject(parsedFiles)
    const prompt = generateDDDPrompt(projectMeta, file.name)

    console.log(
        `[ZipProcessor] Parsed ${parsedFiles.length} files, ` +
        `${projectMeta.totalClasses} classes, ` +
        `skipped ${skippedFiles}, ` +
        `${errors.length} errors`,
    )

    return {
        metadata: projectMeta,
        prompt,
        zipName: file.name,
        skippedFiles,
        errors,
    }
}

/**
 * Check if a File object is a ZIP file.
 */
export function isZipFile(file: File): boolean {
    return (
        file.type === "application/zip" ||
        file.type === "application/x-zip-compressed" ||
        file.type === "application/x-zip" ||
        file.name.endsWith(".zip")
    )
}
