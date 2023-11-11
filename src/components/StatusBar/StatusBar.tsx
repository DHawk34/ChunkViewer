import { useEffect, useState } from "react";
import { LogMessage, useLogger } from "../../scripts/hooks/useLoggerHook";
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
            {showWarning ? <svg id="warning_icon" color="red" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12z" fill="red"></path><path d="M12 14a1 1 0 0 1-1-1V7a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1zm-1.5 2.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z" fill="red"></path></svg> : <></>}
            <button onClick={toggleLogs}>{clicked ?
                <svg height="32px" width="32px" viewBox="0 0 32 32"> <path d="M14.8,20.8l-9.6-9.6c-0.9-0.9-0.9-2.3,0-3.2L6,7.2c0.9-0.9,2.3-0.9,3.2,0l7.3,7.3l7.3-7.3 c0.9-0.9,2.3-0.9,3.2,0L27.8,8c0.9,0.9,0.9,2.3,0,3.2l-9.6,9.6c-0.5,0.5-1.1,0.7-1.7,0.6C15.9,21.5,15.2,21.3,14.8,20.8z" fill="#ffffff" /></svg>
                :
                <svg height="32px" width="32px" viewBox="0 0 32 32"><path d="M18.221,7.206l9.585,9.585c0.879,0.879,0.879,2.317,0,3.195l-0.8,0.801c-0.877,0.878-2.316,0.878-3.194,0  l-7.315-7.315l-7.315,7.315c-0.878,0.878-2.317,0.878-3.194,0l-0.8-0.801c-0.879-0.878-0.879-2.316,0-3.195l9.587-9.585  c0.471-0.472,1.103-0.682,1.723-0.647C17.115,6.524,17.748,6.734,18.221,7.206z" fill="#ffffff" /></svg>
            }</button>
        </div>
    )
}