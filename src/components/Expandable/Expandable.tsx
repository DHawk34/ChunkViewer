import React, { ReactNode, useEffect, useRef, useState } from "react";
import Arrow from '@/assets/arrowDown_bold.svg?react'
import styles from './Expandable.module.css'
import { useExpandContext } from "../ExpandableGroup/ExpandableGroup";

type Props = {
    header: string
    children?: ReactNode
}

export function Expandable(props: Props) {

    const expandContext = useExpandContext();
    const opened = expandContext?.activeExpandable === props.header

    const contentRef = useRef<HTMLDivElement>(null);
    // const [contentHeight, setHeight] = useState(0)

    // useEffect(() => {
    //     if (contentRef.current)
    //         setHeight(contentRef.current.scrollHeight + 10)

    // }, [])

    function openCloseExpandable(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (opened)
            expandContext?.changeActive(undefined)
        else
            expandContext?.changeActive(props.header)
    }

    const contentHeight = contentRef.current ? contentRef.current.scrollHeight + 10 : 0
    return (
        <div className={styles.expandable}>
            <div className={`${styles.expandable_header} ${opened ? styles.expanded : ''}`} onClick={openCloseExpandable}>
                <Arrow width="20" height="20" className={`${styles.expandable_arrow} ${expandContext?.activeExpandable === props.header ? '' : styles.rotated}`} />
                <p className={styles.expandable_name}>
                    {props.header}
                </p>
            </div>
            <div ref={contentRef} className={`${styles.expandable_content} ${opened ? styles.expanded : ''}`} style={opened ? { height: contentHeight } : {}}>
                {props.children}
            </div>
        </div>
    )
}
