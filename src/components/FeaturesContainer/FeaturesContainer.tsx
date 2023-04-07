import React, { useState } from "react";
import { save } from '@tauri-apps/api/dialog';
import './FeaturesContainer.css'

type MyProps = {
    // chunkArray: { name: string, value: string | Object }[] | null,
    // OnChunksUpdated: (chunk: { name: string, value: string | Object }[]) => void | null
    OnExportImage: (filePath: string) => void
};

export class FeaturesContainer extends React.Component<MyProps, {}> {

    getImgSavePath = async () => {
        const filePath = await save({
            filters: [{
                name: "img file",
                extensions: ['png']
            }]
        });

        if (filePath == null)
            return;

        this.props.OnExportImage(filePath);
    }

    render(): React.ReactNode {
        return (
            <div id="features_container">
                <a className="button" onClick={this.getImgSavePath}>Export Image</a>
            </div>
        )
    }
}