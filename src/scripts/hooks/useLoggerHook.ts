import { useState } from "react";
import { getTime } from "../utils";
import { Event, EventDispatcher } from "../event";

export type LogMessage = {
    message: string
    type: 'message' | 'error'
}

export type Logger = {
    logs: LogMessage[]
    setLogs: React.Dispatch<React.SetStateAction<LogMessage[]>>
    log: (message: any) => void
    logError: (message: any) => void

    // events
    messageWasLoggedEvent: Event<string>
    errorWasLoggedEvent: Event<string>
}

// create event dispatchers
const messageWasLoggedEventDispatcher = new EventDispatcher<string>()
const errorWasLoggedEventDispatcher = new EventDispatcher<string>()



export function useLogger(): Logger {
    const [logs, setLogs] = useState<LogMessage[]>([])

    function log(message: any) {
        message = message.toString()
        if (!filter(message)) return

        log_internal({ message, type: 'message' })
        messageWasLoggedEventDispatcher.dispatch(message)
    }

    function logError(message: any) {
        message = message.toString()
        if (!filter(message)) return

        console.log(message)
        message = 'ERROR: ' + message

        log_internal({ message, type: 'error' })
        errorWasLoggedEventDispatcher.dispatch(message)
    }



    function log_internal(log: LogMessage) {
        log.message = `[${getTime()}] ${log.message}`
        setLogs(logs => [log, ...logs])
    }

    return { logs, setLogs, log, logError, messageWasLoggedEvent: messageWasLoggedEventDispatcher, errorWasLoggedEvent: errorWasLoggedEventDispatcher }
}



function filter(message: string): boolean {
    if (message.startsWith('AbortError')) return false

    return true
}
