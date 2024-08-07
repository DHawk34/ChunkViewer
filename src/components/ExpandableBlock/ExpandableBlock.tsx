import React, { ReactNode, useEffect, useRef, useState } from "react";
import Arrow from '@/assets/arrowDown_bold.svg?react'
import styles from './ExpandableBlock.module.css'

type Props = {
    header?: string
    opened?: boolean
    children?: ReactNode
}

export function ExpandableBlock(props: Props) {

    const [opened, setOpened] = useState<boolean>()

    useEffect(() => {
        setOpened(props.opened ?? false)
    }, [props.opened])

    function openCloseExpandable(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setOpened(!opened)
    }

    return (
        <div className={styles.expandable}>
            <div className={styles.expandable_header} onClick={openCloseExpandable}>
                <Arrow width="25" height="25" className={`${styles.expandable_arrow} ${opened ? '' : styles.rotated}`} />
                <p className={styles.expandable_name}>
                    {props.header}
                </p>
            </div>
            <div className={`${styles.expandable_content} ${opened ? styles.expanded : ''}`}>
                    {props.children}
            </div>
        </div>
    )
}
