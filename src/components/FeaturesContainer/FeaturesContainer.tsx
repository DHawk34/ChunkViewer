import { exportAllChunks, exportParams, replaceChunks, saveImage } from '../../scripts/features'
import { ChunkData } from '../../scripts/chunks/chunkHandler'
import { Logger } from '../../scripts/hooks/useLoggerHook'
import './FeaturesContainer.css'

export interface FeaturesProps {
    chunkArray: ChunkData[]
    setChunkArray: React.Dispatch<React.SetStateAction<ChunkData[]>>
    // TODO: transfer settings
    logger: Logger
    imageName: string
}

export function FeaturesContainer(props: FeaturesProps) {
    const {imageName, chunkArray, setChunkArray, logger } = props

    const btn_exportImage = () => saveImage(imageName, chunkArray, logger)
    const btn_exportParameters = () => exportParams(imageName, chunkArray, logger)
    const btn_exportAllChunks = () => exportAllChunks(imageName, chunkArray, logger)
    const btn_replaceChunks = () => replaceChunks(setChunkArray, logger)

    return (
        <div id='features_container'>
            <button onClick={btn_exportImage}>Export Image</button>
            <button onClick={btn_exportParameters}>Export parameters</button>
            <button onClick={btn_exportAllChunks}>Export all chunks</button>
            <button onClick={btn_replaceChunks}>Replace chunks from image</button>
        </div>
    )
}