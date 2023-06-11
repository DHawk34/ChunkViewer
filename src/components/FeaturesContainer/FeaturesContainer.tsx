import React from "react";
import { tauri, dialog } from '@tauri-apps/api'
import './FeaturesContainer.css'

type MyProps = {
    // chunkArray: { name: string, value: string | Object }[] | null,
    // OnChunksUpdated: (chunk: { name: string, value: string | Object }[]) => void | null
    OnExportImage: () => void
    OnExportParameters: () => void
    OnReplaceChunks: (imgPath: string) => void
};

export class FeaturesContainer extends React.Component<MyProps, {}> {
    replaceChunks = () => {
        dialog.open({
            multiple: false,
            filters: [{
                name: 'Image',
                extensions: ['png']
            }]
        })
            .then((fileName) => {
                if (typeof (fileName) === 'string') {
                    const url = tauri.convertFileSrc(fileName)
                    this.props.OnReplaceChunks(url);
                }
            })
            .catch(() => { })
    }

    render(): React.ReactNode {
        return (
            <div id="features_container">
                <a className="button" onClick={this.props.OnExportImage}>Export Image</a>
                <a className="button" onClick={this.props.OnExportParameters}>Export parameters</a>
                <a className="button" onClick={this.replaceChunks}>Replace chunks from image</a>
            </div>
        )
    }
}