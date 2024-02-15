import { useEffect, useState } from "react";
import { LogMessage, useLogger } from "../../scripts/hooks/useLoggerHook";
import WarningIcon from '../../assets/warning.svg?react'
import ArrowUpIcon from '../../assets/arrowUp_bold.svg?react'
import ArrowDownIcon from '../../assets/arrowDown_bold.svg?react'
import './StatusBar.css'

export function StatusBar(props: { logs: LogMessage[] }) {
    const [clicked, setClicked] = useState<boolean>(false)
    const [showWarning, setShowWarning] = useState<boolean>(false)
    const logger = useLogger()

    useEffect(() => {
        const eventHandler = () => setShowWarning(true)
        logger.errorWasLoggedEvent.register(eventHandler)

        return () => {
            logger.errorWasLoggedEvent.unregister(eventHandler)
        }
    }, [])

    function toggleLogs() {
        setClicked(!clicked)

        const container = document.getElementById('status_bar_container')

        if (clicked) {
            container?.classList.remove('full_open')
        }
        else {
            container?.classList.add('full_open')
            setShowWarning(false)
        }
    }

    const logMessageElements = props.logs.map((msg: LogMessage, index: number) => {
        return <p key={index} className={msg.type === 'error' ? 'error' : ''}>{msg.message}</p>
    })

    function getLastMessage() {
        const msg = props.logs[0]
        return <p className={msg?.type === 'error' ? 'error' : ''}>{msg?.message}</p>
    }

    return (
        <div id='status_bar_container'>
            <div id='log_container'>
                {clicked ? logMessageElements :
                    getLastMessage()
                }
            </div>
            {showWarning && <WarningIcon />}

            <button onClick={toggleLogs}>{clicked ?
                <ArrowDownIcon height="32px" width="32px" />
                :
                <ArrowUpIcon height="32px" width="32px" />
            }</button>
        </div>
    )
}