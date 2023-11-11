import './ChunkContainer.css'
import { Chunk } from '../Chunk/Chunk';
import { StrictModeDroppable } from '../StrictModeDroppable';
import { ChunkData } from '../../scripts/chunks/chunkHandler';

type Props = {
    chunkArray: ChunkData[]
    imageName: string
    OnChunksUpdated: (chunk: ChunkData[]) => void
}

export function ChunkContainer(props: Props) {
    function addChunk() {
        const source = [...props.chunkArray, { name: 'New Chunk', value: '' }]
        props.OnChunksUpdated(source)
    }

    function chunkUpdate(index: number, newValue: ChunkData) {
        const list = [...props.chunkArray]
        list[index] = newValue
        props.OnChunksUpdated(list)
    }

    function chunkDelete(index: number) {
        const list = [...props.chunkArray]
        list.splice(index, 1)
        props.OnChunksUpdated(list)
    }



    const chunkElements = props.chunkArray.map((chunk: ChunkData, index: number) =>
        <Chunk index={index} chunk={chunk} imageName={props.imageName} OnDelete={chunkDelete} OnUpdate={chunkUpdate} key={index} />
    )

    return (
        <div id='chunk_container'>
            <StrictModeDroppable droppableId='chunks'>
                {(provided) => (
                    <div id='drag_container'
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
    )
}