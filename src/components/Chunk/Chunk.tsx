import React, { useEffect, useRef, useState } from "react";
import chunkHandler, { ChunkData } from '@/scripts/chunks/chunkHandler';
import { Param, parseParameters } from '@/scripts/sdParamParser';
import { Draggable } from 'react-beautiful-dnd';
import { UnlistenFn } from "@tauri-apps/api/event";
import { chunkNameIsUnsafe, maxChunkNameSize } from "@/scripts/chunks/chunkSaver";
import { settingsManager } from "@/scripts/settings/settings";
import { getSelectionLength } from "@/scripts/frontend.utils";
import ExportIcon from '@/assets/export.svg?react'
import TrashIcon from '@/assets/trash.svg?react'
import DragIcon from '@/assets/drag.svg?react'
import RefreshIcon from '@/assets/refresh.svg?react'
import './Chunk.css'

type Props = {
    index: number
    chunk: ChunkData
    OnUpdate: (newValue: ChunkData) => void
    OnDelete: () => void
}

export function Chunk(props: Props) {
    const [showParameters, setShowParameters] = useState(false)
    const [parsedParams, setParsedParams] = useState<Param[] | undefined>(undefined)
    const unlistenResize = useRef<UnlistenFn>()
    const chunkName = useRef<HTMLDivElement>(null)

    useEffect(() => {

        return () => {
            if (unlistenResize.current) unlistenResize.current()
        }
    }, [])

    // on chunk.name changed
    useEffect(() => {
        // if name is safe, just return
        if (!chunkNameIsUnsafe(props.chunk.name)) return () => { }

        const allowUnsafe = settingsManager.getCache('allowUnsafeChunkNames')
        onAllowUnsafeSettingChanged(allowUnsafe) // enable yellow coloring if needed

        // sub to event
        settingsManager
            .getValueUpdatedEvent('allowUnsafeChunkNames')
            .register(onAllowUnsafeSettingChanged)

        return () => {
            onAllowUnsafeSettingChanged(false) // disable yellow coloring

            // unsub from event
            settingsManager
                .getValueUpdatedEvent('allowUnsafeChunkNames')
                .unregister(onAllowUnsafeSettingChanged)
        }
    }, [props.chunk.name])

    // on chunk.value changed
    useEffect(() => {
        setParsedParams(undefined)
    }, [props.chunk.value])

    function onAllowUnsafeSettingChanged(value: boolean) {
        if (!chunkName.current) return
        chunkName.current.className = value ? 'chunk_name yellow' : 'chunk_name'
    }



    function deleteChunk() {
        props.OnDelete()
    }

    function changeView() {
        setShowParameters(!showParameters)
    }

    function exportChunk() {
        if (showParameters) {
            chunkHandler.exportParameters([props.chunk])
                .catch(e => console.log(e))
        }
        else {
            chunkHandler.exportChunk(props.chunk)
                .catch(e => console.log(e))
        }
    }

    function getParsedParams(): Param[] {
        if (parsedParams) {
            return parsedParams
        }

        const params = parseParameters(props.chunk.value, true)
        setParsedParams(params)

        return params
    }



    function chunkName_onBlur(e: React.FocusEvent<HTMLElement>) {
        e.currentTarget.contentEditable = 'false'

        // trim text just in case
        if (e.currentTarget.textContent && e.currentTarget.textContent.length > maxChunkNameSize) {
            e.currentTarget.textContent = e.currentTarget.textContent.substring(0, maxChunkNameSize)
        }

        // don't let chunkName be empty 
        let val = e.currentTarget.textContent?.substring(0, maxChunkNameSize).trim() ?? ''
        if (val.length === 0) val = '?'

        props.chunk.name = e.currentTarget.textContent = val
        props.OnUpdate(props.chunk)
    }

    function chunkValue_onBlur(e: React.FocusEvent<HTMLElement>) {
        e.currentTarget.contentEditable = 'false'
        props.chunk.value = e.currentTarget.textContent ?? ''
        props.OnUpdate(props.chunk)
    }

    function limitChunkNameMaxLength_onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
        if (e.ctrlKey || e.key === 'Backspace' || e.key === 'Delete' || e.key.includes('Arrow')) {
            return
        }

        const selectionLength = getSelectionLength(window)
        if (selectionLength > 0) return // we can enter only 1 symbol at a time, so it's ok

        const contentLength = e.currentTarget.textContent?.length ?? 0
        if (contentLength >= maxChunkNameSize) {
            e.preventDefault()
        }
    }

    function limitChunkNameMaxLength_onPaste(e: React.ClipboardEvent<HTMLElement>) {
        e.preventDefault()

        const currentTextLength = e.currentTarget.textContent?.length ?? 0
        const selectionLength = getSelectionLength(window)

        const text = e.clipboardData
            .getData('text')
            .substring(0, maxChunkNameSize - currentTextLength + selectionLength)

        // paste trimmed value
        document.execCommand('insertText', false, text)
    }



    const parameters = showParameters ? getParsedParams().map((param: Param, index: number) => {
        return <tr key={index}>
            <td className='param_name'>{param.key}</td>
            <td className='param_text'>{param.value}</td>
        </tr>
    }) : undefined

    return (
        <Draggable draggableId={props.index.toString()} key={props.index} index={props.index}>
            {(provided) => (
                <div className='chunk' key={props.index}
                    {...provided.draggableProps} ref={provided.innerRef}>
                    <div className='chunk_header'>
                        <div  {...provided.dragHandleProps} className='dragger' onMouseDown={() => {
                            document.querySelector<HTMLTextAreaElement>('.editable_textarea')?.blur()
                            document.querySelector<HTMLElement>('[contenteditable="plaintext-only"]')?.blur()
                        }
                        }><DragIcon width="16" height="35" /></div>

                        <div ref={chunkName} className='chunk_name' onDoubleClick={enterEditMode} onBlur={chunkName_onBlur} onKeyDown={limitChunkNameMaxLength_onKeyDown} onPaste={limitChunkNameMaxLength_onPaste}>
                            {props.chunk.name}
                        </div>
                        {
                            props.chunk.name === 'parameters' &&
                            <button className='change_view_chunk_button' onClick={changeView}><RefreshIcon width="25" height="25" /></button>
                        }

                        <button className='export_chunk_button' onClick={exportChunk}><ExportIcon width="25" height="25" /></button>
                        <button className='delete_chunk_button' onClick={deleteChunk}><TrashIcon width="25" height="25" /></button>
                    </div>
                    {
                        showParameters && props.chunk.name === 'parameters' ?
                            <table id='parameters_table'>
                                <colgroup>
                                    <col className='param_name_col' />
                                    <col className='param_value_col' />
                                </colgroup>
                                <tbody>
                                    {parameters}
                                </tbody>
                            </table>
                            :
                            <p className='chunk_text' onDoubleClick={enterEditMode} onBlur={chunkValue_onBlur}>
                                {props.chunk.value}
                            </p>
                    }
                </div>
            )}
        </Draggable>
    )
}



function enterEditMode(e: React.MouseEvent<HTMLElement>) {
    e.currentTarget.contentEditable = 'plaintext-only'
    e.currentTarget.focus()

    const selection = window.getSelection()
    selection?.getRangeAt(0).collapse()
}