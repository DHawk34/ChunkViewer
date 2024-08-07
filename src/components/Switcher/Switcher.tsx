import React, { ReactNode, useEffect, useRef, useState } from "react";
import Arrow from '@/assets/arrowDown_bold.svg?react'
import styles from './Switcher.module.css'

type Props = {
    header?: string
    opened?: boolean
    children?: ReactNode
}

export function Switcher(props: Props) {
    return (
        <div className={styles.checkbox_wrapper}>
            <label className={styles.switch}>
                <input type="checkbox" />
                <div className={styles.slider}>
                    <div className={styles.round}></div>
                </div>
            </label>
        </div>
    )
}
