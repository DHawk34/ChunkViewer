import React, { forwardRef, ReactNode, useEffect, useRef, useState } from "react";
import Arrow from '@/assets/arrowDown_bold.svg?react'
import styles from './Switcher.module.css'

type Props = {
    defaultChecked?: boolean
    OnChange?: (newValue: boolean) => void
}

export const Switcher = forwardRef(function Switcher(props: Props, ref: React.ForwardedRef<HTMLInputElement>) {

    function onSwitcherChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (props.OnChange)
            props.OnChange(e.currentTarget.checked)
    }

    return (
        <div className={styles.checkbox_wrapper}>
            <label className={styles.switch}>
                <input type="checkbox" ref={ref} defaultChecked={props.defaultChecked} onChange={onSwitcherChange} />
                <div className={styles.slider}>
                    <div className={styles.round}></div>
                </div>
            </label>
        </div>
    )
})
