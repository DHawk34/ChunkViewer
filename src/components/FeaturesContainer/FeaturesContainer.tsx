import { tauri, dialog } from '@tauri-apps/api'
import './FeaturesContainer.css'

type Props = {
    OnExportImage: () => void
    OnExportParameters: () => void
    OnExportAllChunks: () => void
    OnReplaceChunks: (imgPath: string) => void
}

export function FeaturesContainer(props: Props) {
    function replaceChunks() {
        dialog.open({
            multiple: false,
            filters: [{
                name: 'Image',
                extensions: ['png']
            }]
        }).then(fileName => {
            if (typeof (fileName) === 'string') {
                const url = tauri.convertFileSrc(fileName)
                props.OnReplaceChunks(url);
            }
        }).catch(() => { })
    }

    return (
        <div id="features_container">
            <button onClick={props.OnExportImage}>Export Image</button>
            <button onClick={props.OnExportParameters}>Export parameters</button>
            <button onClick={props.OnExportAllChunks}>Export all chunks</button>
            <button onClick={replaceChunks}>Replace chunks from image</button>
        </div>
    )
}