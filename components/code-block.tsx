"use client"

import { Highlight, themes } from "prism-react-renderer"

interface CodeBlockProps {
    code: string
    language?: "xml" | "json"
}

export function CodeBlock({ code, language = "xml" }: CodeBlockProps) {
    return (
        <div className="overflow-hidden w-full">
            <Highlight theme={themes.github} code={code} language={language}>
                {({
                    className: _className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps,
                }) => (
                    <pre
                        className="text-[11px] leading-relaxed scrollbar-thin"
                        style={{
                            ...style,
                            fontFamily:
                                "var(--font-mono), ui-monospace, monospace",
                            backgroundColor: "transparent",
                            margin: 0,
                            padding: "12px",
                            overflowX: "auto",
                            overflowY: "auto",
                            wordBreak: "break-all",
                            whiteSpace: "pre-wrap",
                            maxHeight: "300px",
                        }}
                    >
                        {tokens.map((line, i) => (
                            <div
                                key={i}
                                {...getLineProps({ line })}
                                style={{ wordBreak: "break-all" }}
                            >
                                {line.map((token, key) => (
                                    <span
                                        key={key}
                                        {...getTokenProps({ token })}
                                    />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    )
}
