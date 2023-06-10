import './ImageContainer.css'
import React, { useState } from "react";

type MyProps = {
    // using `interface` is also ok
    imageUrl: string
};

type MyState = {
    imageSize: { width: number, height: number }
}

export class ImageContainer extends React.Component<MyProps, MyState> {

    constructor(props: any) {
        super(props);

        this.state = {
            imageSize: {
                height: 0,
                width: 0
            }
        }
    }

    getImgSize(imgSrc: string) {
        var newImg = new Image();

        newImg.onload = () => {
            var height = newImg.height;
            var width = newImg.width;

            this.setState({ imageSize: { width, height } })
        }
        newImg.src = imgSrc; // this must be done AFTER setting onload
    }

    componentDidMount(): void {
        var image = document.getElementById("preview") as HTMLImageElement;
        // if (image)
        image.onload = (ev) => {
            this.getImgSize(image.src)
        }
    }


    render(): React.ReactNode {
        return (
            <div id="image_container">
                <img id="preview" src={this.props.imageUrl} />
                <p>{`${this.state.imageSize.width}x${this.state.imageSize.height}`}</p>
            </div>
        )
    }
}