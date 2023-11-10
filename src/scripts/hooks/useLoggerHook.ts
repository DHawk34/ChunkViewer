import { useState } from "react";
import { getTime } from "../utils";

export type LogMessage = {
    message: string
    type: 'message' | 'error'
}

export function useLogger() {
    const [logs, setLogs] = useState<LogMessage[]>([])

    function log(message: string) {
        log_internal({ message, type: 'message' })
    }

    function logError(message: string) {
        console.log(message)
        message = 'ERROR: ' + message

        log_internal({ message, type: 'error' })
    }



    function log_internal(log: LogMessage) {
        if (log.message.startsWith('AbortError')) return

        log.message = `[${getTime()}] ${log.message}`
        setLogs(logs => [log, ...logs])
    }

    return { logs, setLogs, log, logError }
}
