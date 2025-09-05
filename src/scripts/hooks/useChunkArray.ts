import { useState } from "react";
import { ChunkData } from "../chunks/chunkHandler";
import { swap as swap_utils } from '@/scripts/utils/utils'

export interface ChunkDataWithId extends ChunkData {
    id: number
}

export type ChunkArray = {
    chunks: ChunkDataWithId[]
    reset: (chunks: ChunkData[]) => void
    edit: (action: (chunks: ChunkData[]) => ChunkData[]) => void
    push: (chunk: ChunkData) => void
    updateAt: (index: number, newValue: ChunkData) => void
    removeAt: (index: number) => void
    swap: (index1: number, index2: number) => void
}

function getChunkIdGenerator(initialValue: number) {
    let nextChunkId = initialValue
    return () => nextChunkId++
}


export function useChunkArray(): ChunkArray {
    const [chunks, setChunks_internal] = useState<ChunkDataWithId[]>([])
    const [getNextChunkId, setChunkIdGenerator] = useState<() => number>(() => getChunkIdGenerator(0))

    function setNextChunkId(value: number) { return setChunkIdGenerator(() => getChunkIdGenerator(value)) }

    function reset(chunks: ChunkData[]) {
        const chunksWithId: ChunkDataWithId[] = chunks.map((chunk, index) => ({ id: index, name: chunk.name, value: chunk.value }))

        setChunks_internal(chunksWithId)
        setNextChunkId(chunksWithId.length)
    }

    function edit(action: (chunks: ChunkData[]) => ChunkData[]) {
        setChunks_internal(chunks => {
            const editedChunks = action(chunks)

            return editedChunks.map(chunk => {
                if ((chunk as ChunkDataWithId).id !== undefined) {
                    return chunk as ChunkDataWithId
                }

                const chunkWithId: ChunkDataWithId = { id: getNextChunkId(), name: chunk.name, value: chunk.value }
                return chunkWithId
            })
        })
    }

    function push(chunk: ChunkData) {
        const chunkWithId: ChunkDataWithId = { id: getNextChunkId(), name: chunk.name, value: chunk.value }
        setChunks_internal([...chunks, chunkWithId])
    }

    function updateAt(index: number, newValue: ChunkData) {
        const existingValue = chunks[index]

        const copy = [...chunks]
        copy[index] = { id: existingValue.id, name: newValue.name, value: newValue.value }

        setChunks_internal(copy)
    }

    function removeAt(index: number) {
        const copy = chunks.toSpliced(index, 1)
        setChunks_internal(copy)
    }

    function swap(index1: number, index2: number) {
        const copy = [...chunks]
        swap_utils(copy, index1, index2)

        setChunks_internal(copy)
    }

    return { chunks, reset, edit, push, updateAt, removeAt, swap }
}
