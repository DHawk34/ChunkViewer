import React, { useEffect, useRef, useState } from "react";
import chunkHandler, { ChunkData } from '@/scripts/chunks/chunkHandler';
import { Param, parseParameters } from '@/scripts/sdParamParser';
import { Draggable } from 'react-beautiful-dnd';
import { UnlistenFn } from "@tauri-apps/api/event";
import { chunkNameIsUnsafe, maxChunkNameSize } from "@/scripts/chunks/chunkSaver";
import { settingsManager } from "@/scripts/settings/settings";
import { ScrollStateSaver } from "@/scripts/ScrollStateSaver";
import ExportIcon from '@/assets/export.svg?react'
import TrashIcon from '@/assets/trash.svg?react'
import DragIcon from '@/assets/drag.svg?react'
import RefreshIcon from '@/assets/refresh.svg?react'
import autosize from 'autosize';
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

    function spawnInput(element: HTMLElement) {
        if (element.querySelector('.editable_textarea')) return

        const input = document.createElement('textarea')
        input.setAttribute('class', 'editable_textarea')

        if (element.className.includes('chunk_name')) {
            input.setAttribute('maxlength', maxChunkNameSize.toString())
        }

        const scrollSaver = new ScrollStateSaver(element)

        input.value = element.textContent as string
        input.onblur = () => {

            scrollSaver.captureScrollState()

            if (element.className.includes('chunk_name')) {
                let val = input.value.substring(0, maxChunkNameSize).trim()
                if (val.length === 0) val = '?'

                props.chunk.name = element.textContent = val
                props.OnUpdate(props.chunk)
            }
            else {
                props.chunk.value = element.textContent = input.value
                props.OnUpdate(props.chunk)
            }

            scrollSaver.restoreState()
        }

        scrollSaver.captureScrollState()

        element.textContent = ''
        element.appendChild(input)
        input.focus()
        autosize(input) // DON'T put this above input.focus() or else scroll breaks

        scrollSaver.restoreState()
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

        // Don't let chunkName be empty 
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
                        <div  {...provided.dragHandleProps} id='chunk_dragger' onMouseDown={() => {
                            document.querySelector<HTMLTextAreaElement>('.editable_textarea')?.blur()
                            document.querySelector<HTMLElement>('[contenteditable="plaintext-only"]')?.blur()
                        }
                        }><DragIcon width="16" height="35" /></div>

                        <div ref={chunkName} className='chunk_name' onDoubleClick={e => spawnInput(e.currentTarget)} onBlur={chunkName_onBlur}>
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