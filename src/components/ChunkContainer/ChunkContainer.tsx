import './ChunkContainer.css'
import { Chunk } from '../Chunk/Chunk';
import { StrictModeDroppable } from '../StrictModeDroppable';
import { ChunkData } from '@/scripts/chunks/chunkHandler';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { ChunkArray, ChunkDataWithId } from '@/scripts/hooks/useChunkArray';
import { useEffect } from 'react';

type Props = {
    chunkArray: ChunkArray
}

export function ChunkContainer(props: Props) {

    useEffect(() => {
        console.log(props.chunkArray.chunks)
    }, [props])

    function addChunk() {
        props.chunkArray.push({ name: 'New Chunk', value: '' })
    }

    function getUpdateFunc(chunkIndex: number) {
        return (newValue: ChunkData) => props.chunkArray.updateAt(chunkIndex, newValue)
    }

    function getDeleteFunc(chunkIndex: number) {
        return () => props.chunkArray.removeAt(chunkIndex)
    }

    function getDropEndFunc() {
        return (result: DropResult) => {
            if (!result.destination)
                return

            if (result.source.index === result.destination.index)
                return

            const sourceIndex = result.source.index
            const destinationIndex = result.destination.index

            props.chunkArray.swap(sourceIndex, destinationIndex)
        }
    }


    const chunkElements = props.chunkArray.chunks.map((chunk: ChunkDataWithId, index: number) => {
        //key={`${varStore.openedImageName}_${chunk.id}`}
        return <Chunk index={index} chunk={chunk} OnDelete={getDeleteFunc(index)} OnUpdate={getUpdateFunc(index)} key={`${chunk.id}`} />
    })

    return (
        <DragDropContext onDragEnd={getDropEndFunc()}>
            <div id='chunk_container'>
                <StrictModeDroppable droppableId='chunks'>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {chunkElements}
                            {provided.placeholder}
                        </div>
                    )}
                </StrictModeDroppable>
                <button id='add_chunk_button' onClick={addChunk}>+</button>
            </div>
        </DragDropContext>
    )
}
