import React, { useEffect, useRef, useState } from "react";
import chunkHandler, { ChunkData } from '@/scripts/chunks/chunkHandler';
import { Param, parseParameters, parseParametersToJson } from '@/scripts/parsers/sdWebUIParamParser';
import { Draggable } from 'react-beautiful-dnd';
import { UnlistenFn } from "@tauri-apps/api/event";
import { chunkNameIsUnsafe, maxChunkNameSize } from "@/scripts/chunks/chunkSaver";
import { settingsManager } from "@/scripts/settings/settings";
import { enableContentEditable, getSelectionLength } from "@/scripts/utils/frontend.utils";
import ExportIcon from '@/assets/export.svg?react'
import TrashIcon from '@/assets/trash.svg?react'
import DragIcon from '@/assets/drag.svg?react'
import RefreshIcon from '@/assets/refresh.svg?react'

import './Chunk.css'
import { ComfyBlock, parsePrompt } from "@/scripts/parsers/Comfy/comfyPromptParser";
import { ExpandableBlock } from "../ExpandableBlock/ExpandableBlock";
import { ParamsTable } from "../ParamsTable/ParamsTable";
import { ParamsTableWithExpandle } from "../ParamsTableWithExpandle/ParamsTableWithExpandle";
import { Dictionary } from "@/scripts/utils/utils";
import { varStore } from "@/scripts/variableStore";

type Props = {
    index: number
    chunk: ChunkData
    OnUpdate: (newValue: ChunkData) => void
    OnDelete: () => void
}

export function Chunk(props: Props) {
    const [showAnotherView, setShowParameters] = useState<boolean>(getDefaultAnotherView())
    const [parsedParams, setParsedParams] = useState<Dictionary<string> | undefined>(undefined)
    const [parsedBlocks, setParsedBlocks] = useState<ComfyBlock[] | undefined>(undefined)
    const [showOnlyBiggest, setShowOnlyBiggest] = useState<boolean>(getDefaultShowOnlyBiggest())

    // const [parsedBlocks, setParsedBlocks] = useState<ComfyBlock[] | undefined>(undefined)

    const chunkName = useRef<HTMLDivElement>(null)

    // on chunk.value changed

    useEffect(() => {
        if (showAnotherView && props.chunk.name === 'parameters') {
            setParsedParams(parseParametersToJson(props.chunk.value, true))
        }
        else {
            setParsedParams(undefined)
        }

        if (showAnotherView && props.chunk.name === 'prompt') {
            const blocks = getParsedPrompt(props.chunk.value)
            setParsedBlocks(blocks)
        }
        else {
            setParsedBlocks(undefined)
        }

    }, [props.chunk.value])

    useEffect(() => {
        if (showAnotherView && props.chunk.name === 'parameters') {
            getParsedParams()
        }

        if (showAnotherView && props.chunk.name === 'prompt') {
            getParsedPrompts()
        }
    }, [showAnotherView])

    useEffect(() => {
        if (props.chunk.name !== 'parameters' && props.chunk.name !== 'prompt') {
            setShowParameters(false)
        }

        if (props.chunk.name === 'prompt') {
            settingsManager
                .getValueUpdatedEvent('showOnlyBiggestBlock')
                .register(onShowBiggestBlockChanged)
        }

        return () => {
            // unsub from event
            // if (props.chunk.name !== 'prompt') {
            settingsManager
                .getValueUpdatedEvent('showOnlyBiggestBlock')
                .unregister(onShowBiggestBlockChanged)
            // }
        }
    }, [props.chunk.name])

    // useEffect(() => {

    //     // sub to event
    //     if (props.chunk.name === 'prompt') {
    //         settingsManager
    //             .getValueUpdatedEvent('showOnlyBiggestBlock')
    //             .register(onShowBiggestBlockChanged)
    //     }

    //     return () => {
    //         onShowBiggestBlockChanged(false)

    //         // unsub from event
    //         // if (props.chunk.name !== 'prompt') {
    //             settingsManager
    //                 .getValueUpdatedEvent('showOnlyBiggestBlock')
    //                 .unregister(onShowBiggestBlockChanged)
    //         // }
    //     }
    // }, [])
    // const unlistenResize = useRef<UnlistenFn>()

    // useEffect(() => {

    //     return () => {
    //         if (unlistenResize.current) unlistenResize.current()
    //     }
    // }, [])

    // useEffect(() => {
    //     if (props.chunk.name === 'parameters' || props.chunk.name === 'prompt')
    //         setShowParameters(settingsManager.getCache('parseParamsOnLoad'))
    // }, [])

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

    function getDefaultAnotherView() {
        return (props.chunk.name === 'parameters' || props.chunk.name === 'prompt') && settingsManager.getCache('parseParamsOnLoad')
    }

    function getDefaultShowOnlyBiggest() {
        return (props.chunk.name === 'prompt') && settingsManager.getCache('showOnlyBiggestBlock')
    }

    function onShowBiggestBlockChanged(value: boolean) {
        setShowOnlyBiggest(value)
    }

    function onAllowUnsafeSettingChanged(value: boolean) {
        if (!chunkName.current) return
        chunkName.current.className = value ? 'chunk_name yellow' : 'chunk_name'
    }


    function deleteChunk() {
        props.OnDelete()
    }

    function changeView() {
        setShowParameters(!showAnotherView)
    }

    function exportChunk() {
        if (showAnotherView) {
            if (props.chunk.name === 'parameters') {
                chunkHandler.exportParameters([props.chunk])
                    .catch(e => console.log(e))
            }

            return
        }

        let isJson = false
        if (props.chunk.name === 'workflow' || props.chunk.name === 'prompt')
            isJson = true

        chunkHandler.exportChunk(props.chunk, isJson)
            .catch(e => console.log(e))
    }

    function getParsedParams() {
        if (parsedParams) {
            return
        }

        const params = parseParametersToJson(props.chunk.value, true)

        setParsedParams(params)
    }

    function getParsedPrompt(value: string) {
        let blocks = parsePrompt(value)

        setParsedBlocks(blocks)

        return blocks
    }

    function getBiggestBlock() {
        if (parsedBlocks && parsedBlocks.length > 0) {
            let t = [...parsedBlocks]
            const biggestBlock = t.reduce(function (prev, current) {
                return (prev && prev.keysCount > current.keysCount) ? prev : current
            })
            return biggestBlock
        }

        return undefined
    }

    function getParsedPrompts() {
        if (parsedBlocks) {
            return
        }

        const blocks = getParsedPrompt(props.chunk.value)
        setParsedBlocks(blocks)
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

    function showChankValue() {
        if (showAnotherView) {
            if (props.chunk.name === 'parameters') {
                return <ParamsTableWithExpandle id="sdwebuitable" opened params={parsedParams} />
            }
            else if (props.chunk.name === 'prompt') {
                return comfyBlocks
            }
        }
        else {
            return <p className='chunk_text' onDoubleClick={enableContentEditable} onBlur={chunkValue_onBlur}>
                {props.chunk.value}
            </p>
        }
    }

    const comfyBlocks = showAnotherView && props.chunk.name === 'prompt' ?
        showOnlyBiggest ? <ParamsTableWithExpandle id={`biggest_comfyParamTable`} opened params={getBiggestBlock()?.value} /> :
            parsedBlocks?.map(block => {
                return <ExpandableBlock header={`${block.id}. ${block.name}`} opened key={block.id}>
                    <ParamsTableWithExpandle id={`${block.id}_${block.name}_comfyParamTable`} opened params={block.value} />
                </ExpandableBlock>
            }) : undefined

    return (
        <div>
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

                            <p ref={chunkName} className='chunk_name' onDoubleClick={enableContentEditable} onBlur={chunkName_onBlur} onKeyDown={limitChunkNameMaxLength_onKeyDown} onPaste={limitChunkNameMaxLength_onPaste}>
                                {props.chunk.name}
                            </p>
                            {
                                (props.chunk.name === 'parameters' || props.chunk.name === 'prompt') &&
                                <button className='change_view_chunk_button' onClick={() => changeView()}><RefreshIcon width="25" height="25" /></button>
                            }
                            <button className='export_chunk_button' onClick={exportChunk}><ExportIcon width="25" height="25" /></button>
                            <button className='delete_chunk_button' onClick={deleteChunk}><TrashIcon width="25" height="25" /></button>
                        </div>
                        {
                            showChankValue()
                        }
                    </div>
                )}
            </Draggable>
        </div>
    )
}
