import './ChunkContainer.css'
import { Chunk } from '../Chunk/Chunk';
import { StrictModeDroppable } from '../StrictModeDroppable';
import { ChunkData } from '@/scripts/chunks/chunkHandler';
import { DragDropContext } from 'react-beautiful-dnd';
import { getDropEndFunc } from '@/scripts/utils';

type Props = {
    chunkArray: ChunkData[]
    setChunkArray: (chunk: ChunkData[]) => void
}

export function ChunkContainer(props: Props) {
    function addChunk() {
        const list = [...props.chunkArray, { name: 'New Chunk', value: '' }]
        props.setChunkArray(list)
    }

    function updateChunk(newValue: ChunkData, index: number) {
        const list = [...props.chunkArray]
        list[index] = newValue
        props.setChunkArray(list)
    }

    function deleteChunk(index: number) {
        const list = props.chunkArray.toSpliced(index, 1)
        props.setChunkArray(list)
    }

    function getUpdateFunc(chunkIndex: number) {
        return (newValue: ChunkData) => updateChunk(newValue, chunkIndex)
    }

    function getDeleteFunc(chunkIndex: number) {
        return () => deleteChunk(chunkIndex)
    }



    const chunkElements = props.chunkArray.map((chunk: ChunkData, index: number) =>
        <Chunk index={index} chunk={chunk} OnDelete={getDeleteFunc(index)} OnUpdate={getUpdateFunc(index)} key={index} />
    )

    return (
        <DragDropContext onDragEnd={getDropEndFunc(props.chunkArray, props.setChunkArray)}>
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