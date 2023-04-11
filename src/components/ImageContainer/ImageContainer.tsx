import './ImageContainer.css'
import React, { useState } from "react";

type MyProps = {
    // using `interface` is also ok
    imageUrl: string
};

export class ImageContainer extends React.Component<MyProps, {}> {

    render(): React.ReactNode {
        return (
            <div id="image_container">
                <img id="preview" src={this.props.imageUrl} />
            </div>
        )
    }
}