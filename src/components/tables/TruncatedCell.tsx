"use client"

import { Tooltip } from "@heroui/react"
import { useEffect, useRef, useState } from "react"

export function TruncatedCell({ text }: Readonly<{ text: string }>) {
    const textRef = useRef<HTMLSpanElement>(null)
    const [isTruncated, setIsTruncated] = useState(false)

    useEffect(() => {
        const element = textRef.current
        if (element) {
            setIsTruncated(element.scrollHeight > element.clientHeight)
        }
    }, [text])

    const content = (
        <span ref={textRef} className="line-clamp-2 max-w-md">
            {text}
        </span>
    )

    if (isTruncated) {
        return (
            <Tooltip content={text} delay={300} closeDelay={0}>
                <span className="cursor-help">{content}</span>
            </Tooltip>
        )
    }

    return content
}
