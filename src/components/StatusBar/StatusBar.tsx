import { useEffect, useState } from "react";
import './StatusBar.css'

export type logMessage = {
    message: string
    error: boolean
}

export function StatusBar(props: { logMessage: logMessage[] }) {
    const [clicked, setClicked] = useState<boolean>(false);

    // useEffect(() => {
    //     var log_message = document.getElementById('log_message');
    //     if (props.logMessage.slice(-1).at(0)?.error) {
    //         log_message?.classList.add('error')
    //     } else {
    //         log_message?.classList.remove('error')
    //     }

    // }, [props])

    function toggleLogs() {
        setClicked(!clicked);

        let container = document.getElementById('status_bar_container');

        if (clicked) {
            console.log(props.logMessage.length)
            container?.classList.remove('full_open');
        }
        else {
            container?.classList.add('full_open')
        }
    }

    const logMessageElements = props.logMessage.map((msg: { message: string, error: boolean }, index: number) => {
        return <p key={index} className={msg.error ? 'error' : ''}>{msg.message}</p>
    })

    function getLastMessage() {
        let msg = props.logMessage.slice(-1).at(0);
        return <p className={msg?.error ? 'error' : ''}>{msg?.message}</p>
    }

    return (
        <div id='status_bar_container'>
            <div id='log_container'>
                {clicked ? logMessageElements :
                    getLastMessage()
                }
            </div>
            <button onClick={toggleLogs}>{clicked ?
                <svg height="32px" width="32px" viewBox="0 0 32 32"> <path d="M14.8,20.8l-9.6-9.6c-0.9-0.9-0.9-2.3,0-3.2L6,7.2c0.9-0.9,2.3-0.9,3.2,0l7.3,7.3l7.3-7.3 c0.9-0.9,2.3-0.9,3.2,0L27.8,8c0.9,0.9,0.9,2.3,0,3.2l-9.6,9.6c-0.5,0.5-1.1,0.7-1.7,0.6C15.9,21.5,15.2,21.3,14.8,20.8z" fill="#ffffff" /></svg>
                :
                <svg height="32px" width="32px" viewBox="0 0 32 32"><path d="M18.221,7.206l9.585,9.585c0.879,0.879,0.879,2.317,0,3.195l-0.8,0.801c-0.877,0.878-2.316,0.878-3.194,0  l-7.315-7.315l-7.315,7.315c-0.878,0.878-2.317,0.878-3.194,0l-0.8-0.801c-0.879-0.878-0.879-2.316,0-3.195l9.587-9.585  c0.471-0.472,1.103-0.682,1.723-0.647C17.115,6.524,17.748,6.734,18.221,7.206z" fill="#ffffff" /></svg>
            }</button>
        </div>
    )
}