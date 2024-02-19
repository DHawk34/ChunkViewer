import { forwardRef, useEffect, useRef, useState } from "react"
import { ChunkContainer } from "../ChunkContainer/ChunkContainer"
import { ChunkData } from "@/scripts/chunks/chunkHandler"
import { useCloseDialog_clickHandler } from "@/scripts/frontend.utils"
import CloseBoldIcon from '@/assets/close_bold.svg?react'
import autosize from "autosize"
import './ChunkInfoExtensionDialog.css'

export const ChunkInfoExtensionDialog = forwardRef<HTMLDialogElement>((_, ref) => {
    const { mouseDown, mouseUp } = useCloseDialog_clickHandler()
    const [chunksToAdd, setChunksToAdd] = useState<ChunkData[]>([])
    const [removeAllChunks, setRemoveAllChunks] = useState(false)
    const ref_textarea = useRef<HTMLTextAreaElement>(null)
    const ref_name = useRef<HTMLInputElement>(null)
    const ref_removeAll = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!ref_textarea.current) return
        autosize(ref_textarea.current)
    }, [])

    function save_extension() {
        // TODO: save_extension
    }

    function close_dialog() {
        const dialog = ref as React.RefObject<HTMLDialogElement>
        dialog?.current?.close()
    }

    function confirm_close() {
        save_extension()

        close_dialog()
        clear_state()
    }

    function clear_state() {
        setChunksToAdd([])
        setRemoveAllChunks(false)

        if (ref_removeAll.current)
            ref_removeAll.current.checked = false

        if (ref_name.current)
            ref_name.current.value = ''

        if (ref_textarea.current)
            ref_textarea.current.value = ''
    }



    return (
        <dialog onMouseDown={mouseDown} onMouseUp={mouseUp} ref={ref}>
            <h2>Add chunk info extension</h2>

            <div>
                <label id='chunkInfoExtentionButtonName_label' htmlFor='chunkInfoExtentionButtonName'>Extension name</label>
                <input id='chunkInfoExtentionButtonName' type='text' ref={ref_name}></input>
            </div>

            <p>Chunks to remove</p>
            <div className='fieldset'>
                <label>
                    <input type='checkbox' onChange={e => setRemoveAllChunks(e.target.checked)} ref={ref_removeAll}></input>
                    Remove all chunks
                </label>

                <p>Chunk names (one per line):</p>
                <textarea disabled={removeAllChunks} ref={ref_textarea}></textarea>
            </div>

            <p>Chunks to paste</p>
            <div className='fieldset'>
                <ChunkContainer
                    chunkArray={chunksToAdd}
                    setChunkArray={setChunksToAdd}
                />
            </div>

            <div className="buttons">
                <button onClick={confirm_close} className="confirm_button">Confirm</button>
                <button onClick={close_dialog} className="cancel_button">Cancel</button>
            </div>

            <button onClick={close_dialog} className='close_button'>
                <CloseBoldIcon color="whitesmoke" />
            </button>

        </dialog>
    )
})