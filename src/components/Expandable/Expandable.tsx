import React, { ReactNode, useEffect, useRef, useState } from "react";
import Arrow from '@/assets/arrowDown_bold.svg?react'
import './Expandable.css'

type Props = {
    header?: string
    opened?: boolean
    children?: ReactNode
}

export function Expandable(props: Props) {

    const [opened, setOpened] = useState<boolean>()

    useEffect(() => {
        setOpened(props.opened ?? false)
    }, [props.opened])

    function openCloseExpandable(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setOpened(!opened)
    }

    return (
        <div className="expandable">
            <div className='expandable_header' onClick={openCloseExpandable}>
                <Arrow width="25" height="25" className={`expandable_arrow ${opened ? '' : 'rotated'}`} />
                <p className='expandable_name'>
                    {props.header}
                </p>
            </div>
            <div className={`expandable_content ${opened ? 'expanded' : ''}`}>
                    {props.children}
            </div>
        </div>
    )
}
