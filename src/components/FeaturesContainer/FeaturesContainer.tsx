import { useRef } from 'react'
import { exportAllChunks, exportParams, replaceChunks, replaceChunksWithFileDialog, saveImage } from '@/scripts/features'
import { ChunkData } from '@/scripts/chunks/chunkHandler'
import { Logger } from '@/scripts/hooks/useLoggerHook'
import { height_0auto_startTransition, height_0auto_endTransition } from '@/scripts/frontend.utils'
import './FeaturesContainer.css'
import { DragEnterCounter, useDragEnterCounter } from '@/scripts/hooks/useDragEnterCounterHook'
import { ChunkInfoExtensionDialog } from './ChunkInfoExtensionDialog'

export interface FeaturesProps {
    chunkArray: ChunkData[]
    setChunkArray: React.Dispatch<React.SetStateAction<ChunkData[]>>
    logger: Logger
    dragEnterCounter: DragEnterCounter
}

export function FeaturesContainer(props: FeaturesProps) {
    const ref_chunkButtonsBlock = useRef<HTMLDivElement>(null)
    const ref_addExtensionDialog = useRef<HTMLDialogElement>(null)

    const { chunkArray, setChunkArray, logger, dragEnterCounter } = props

    const { logs, log, logError } = logger

    const { enterCount, incrementDragEnterCount, decrementDragEnterCount, setDragEnterCount } = dragEnterCounter

    const btn_exportImage = () => saveImage(chunkArray, logger)
    const btn_exportParameters = () => exportParams(chunkArray, logger)
    const btn_exportAllChunks = () => exportAllChunks(chunkArray, logger)
    const btn_replaceChunks = () => replaceChunksWithFileDialog(setChunkArray, logger)

    function expandButton_onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (!ref_chunkButtonsBlock.current) return
        const block = ref_chunkButtonsBlock.current
        const expandBtn = e.currentTarget

        const blockOpened = height_0auto_startTransition(block)
        expandBtn.className = blockOpened ? 'pressed' : ''
    }

    function handleDrop(ev: React.DragEvent<HTMLButtonElement>) {
        ev.preventDefault();
        ev.stopPropagation();

        decrementDragEnterCount()

        if (!ev.dataTransfer)
            return;

        const { files } = ev.dataTransfer;

        if (files && files.length) {
            //console.log(files);
            var file = getImageFromFiles(files);

            if (!file) {
                logError('Это не пнг!')
                return;
            }

            file.arrayBuffer().then(buff => {
                replaceChunks(new Uint8Array(buff), setChunkArray, logger)
            })
        }
    }

    function getImageFromFiles(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.name.endsWith('.png'))
                return file
        }
    }

    function openAddExtensionDialog() {
        ref_addExtensionDialog.current?.showModal()
    }



    // TODO: Chunk info extensions: кнопки добавить/редактировать/удалить extension
    return (
        <div id='features_container'>
            <button onClick={btn_exportImage}>Export Image</button>
            <button onClick={btn_exportParameters}>Export parameters</button>
            <button onClick={btn_exportAllChunks}>Export all chunks</button>
            <button className='drop_object' onClick={btn_replaceChunks} onDrop={handleDrop}>Replace chunks from image</button>

            <button onClick={expandButton_onClick}>Chunk info extensions</button>
            <div onTransitionEnd={height_0auto_endTransition} ref={ref_chunkButtonsBlock} className='groovedBlock' style={{ height: 0 }}>
                <button>Replace all with Boosty chunk</button>
                <button>Add upscale chunks</button>

                <button>Remove parameters chunk</button>
                <button>Remove parameters chunk</button>
                <button>Remove parameters chunk</button>

                <hr />
                <div className='plusMinusButtons'>
                    <button>Add</button>
                    <button>Remove</button>
                </div>
            </div>

            <button onClick={openAddExtensionDialog}>TEST</button>
            <ChunkInfoExtensionDialog ref={ref_addExtensionDialog} />
        </div >
    )
}
