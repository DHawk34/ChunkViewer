import React from "react";
import './FeaturesContainer.css'

type MyProps = {
    // chunkArray: { name: string, value: string | Object }[] | null,
    // OnChunksUpdated: (chunk: { name: string, value: string | Object }[]) => void | null
    OnExportImage: () => void
};

export class FeaturesContainer extends React.Component<MyProps, {}> {
    render(): React.ReactNode {
        return (
            <div id="features_container">
                <a className="button" onClick={this.props.OnExportImage}>Export Image</a>
            </div>
        )
    }
}