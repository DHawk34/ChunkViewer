import { useEffect, useRef, useState } from "react";
import { appWindow } from "@tauri-apps/api/window";
import chunkHandler, { ChunkData } from '../../scripts/chunks/chunkHandler';
import { parseParameters } from '../../scripts/sdParamParser';
import { Draggable } from 'react-beautiful-dnd';
import { objectToArray } from '../../scripts/utils';
import { UnlistenFn } from "@tauri-apps/api/event";
import './Chunk.css'

const maxChunkNameSize: number = 79

type Props = {
    index: number
    chunk: ChunkData
    OnUpdate: (index: number, newValue: ChunkData) => void
    OnDelete: (index: number) => void
}

export function Chunk(props: Props) {
    const [showParameters, setShowParameters] = useState(false)
    const [curInput, setCurInput] = useState<HTMLElement | undefined>()
    const [needReParse, setNeedReParse] = useState(false)
    const [parsedParams, setParsedParams] = useState<{ key: string, value: string }[]>([])
    const unlistenResize = useRef<UnlistenFn>()

    useEffect(() => {
        sub2Event()

        return () => {
            if (unlistenResize.current) unlistenResize.current()
        }
    }, [])

    useEffect(() => {
        setNeedReParse(true)
    }, [props.chunk.value])

    async function sub2Event() {
        const unlisten = await appWindow.listen('tauri://resize', () => {
            if (curInput) {
                autoGrow(curInput)
            }
        })

        unlistenResize.current = unlisten
    }

    function spawnInput(element: HTMLElement, index: number) {
        if (element.querySelector('.editable_textarea'))
            return

        const val: string = element.textContent as string;
        const input = document.createElement('textarea')
        setCurInput(input)
        input.setAttribute('class', 'editable_textarea')

        if (element.className === 'chunk_name') {
            input.setAttribute('maxlength', maxChunkNameSize.toString())
        }

        input.oninput = () => {
            autoGrow(input)
        }

        input.value = val;
        input.onblur = () => {
            if (element.className === 'chunk_name') {
                let val = input.value.substring(0, maxChunkNameSize).trim()
                if (val.length === 0) val = '?'

                props.chunk.name = element.textContent = val
                props.OnUpdate(index, props.chunk)
            }
            else {
                props.chunk.value = element.textContent = input.value
                props.OnUpdate(index, props.chunk)
            }
            setCurInput(undefined)
        }
        element.innerHTML = ''
        element.appendChild(input)
        input.focus()

        input.style.height = input.scrollHeight + 'px'
    }

    function deleteChunk() {
        props.OnDelete(props.index)
    }

    function autoGrow(element: HTMLElement) {
        element.style.height = 'auto'
        element.style.height = element.scrollHeight + 'px'
    }

    function changeView() {
        setShowParameters(!showParameters)
        // parseParameters
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

    function getParsedParams() {
        if (!needReParse)
            return parsedParams
        else {
            setNeedReParse(false)
            var params = objectToArray<string>(parseParameters(props.chunk.value, true));
            setParsedParams(params)
            return params;
        }
    }

    const parameters = getParsedParams()?.map((param: { key: string, value: string }, index: number) => {
        return <tr key={index}>
            <td className='param_name'>{param.key}</td>
            <td className='param_text'>{param.value}</td>
        </tr>
    })

    return (
        <Draggable draggableId={props.index.toString()} key={props.index} index={props.index}>
            {(provided) => (
                <div className='chunk' key={props.index}
                    {...provided.draggableProps} ref={provided.innerRef}>
                    <div className='chunk_header'>
                        <div  {...provided.dragHandleProps} id='chunk_dragger' onMouseDown={() => document.querySelector<HTMLTextAreaElement>('.editable_textarea')?.blur()}><svg width={16} height={35} fill='white' viewBox="64 -11.5 128 256"><rect width="128" height="256" fill="none" /><circle cx="92" cy="60" r="12" /><circle cx="164" cy="60" r="12" /><circle cx="92" cy="128" r="12" /><circle cx="164" cy="128" r="12" /><circle cx="92" cy="196" r="12" /><circle cx="164" cy="196" r="12" /></svg></div>
                        <div className='chunk_name' onDoubleClick={(e) => spawnInput(e.currentTarget, props.index)}>{props.chunk.name}</div>
                        {
                            props.chunk.name === 'parameters' &&
                            <button className='change_view_chunk_button' onClick={changeView}><svg width="25" height="25" viewBox="0 0 109.927 122.881"><g><path fill='currentColor' d="M38.884,13.221c-0.041,1.756,0.255,2.601,1.781,2.603h36.71 c6.647,0.521,12.596,2.272,17.625,5.684c3.492,2.369,6.04,5.183,7.963,8.302c3.412,5.537,5.34,13.521,6.384,19.967 c0.45,2.787,0.661,5.392,0.18,6.6c-0.228,0.569-0.565,0.953-1.023,1.135c-2.524,1.011-5.192-2.464-6.614-4.127 c-6.77-7.918-16.61-11.194-28.212-11.809h-33.56c-1.201,0.208-1.627,1.096-1.507,2.466v9.451c-0.07,3.141-1.654,4.21-4.794,3.15 L4.92,33.966l-2.842-2.231l-0.727-0.57c-2.323-2.089-1.368-3.991,0.717-5.633l2.206-1.736L31.964,1.999 c3.379-2.661,6.92-3.373,6.92,2.362V13.221L38.884,13.221z M71.042,109.66c0.041-1.757-0.254-2.602-1.78-2.604h-36.71 c-6.647-0.521-12.596-2.271-17.625-5.684c-3.514-2.384-6.072-5.217-7.998-8.358c-3.485-5.686-5.757-14.941-6.591-21.583 c-0.266-2.119-0.321-3.966,0.063-4.927c0.227-0.569,0.565-0.953,1.022-1.136c2.524-1.011,5.192,2.464,6.614,4.127 c6.771,7.918,16.611,11.194,28.213,11.809h33.56c1.2-0.207,1.627-1.096,1.507-2.466v-9.451c0.07-3.141,1.654-4.21,4.794-3.15 l28.896,22.677l2.843,2.231l0.727,0.57c2.323,2.089,1.367,3.991-0.718,5.633l-2.205,1.736l-27.689,21.797 c-3.38,2.661-6.921,3.373-6.921-2.362V109.66L71.042,109.66z" /></g></svg></button>
                        }
                        <button className='export_chunk_button' onClick={exportChunk}><svg width="25" height="25" viewBox="0 0 35 35"><path d="M4.4,29.2c3.6-5.4,8.8-7.9,16-7.9v6.4l10.2-10.9L20.4,5.8v6.2C10.2,13.6,5.8,21.4,4.4,29.2z" fill="currentColor"></path></svg></button>
                        <button className='delete_chunk_button' onClick={deleteChunk}><svg aria-hidden="true" role="img" width="25" height="25" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg></button>
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
                            <p className='chunk_text' onDoubleClick={(e) => spawnInput(e.currentTarget, props.index)}>{props.chunk.value.toString()}</p>
                    }
                </div>
            )}
        </Draggable>
    )
}