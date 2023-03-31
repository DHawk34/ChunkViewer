import testImg from './test.png';
import { listen } from '@tauri-apps/api/event'
import { tauri } from "@tauri-apps/api";
import './ImageContainer.css'
import React, { useState } from "react";


type MyProps = {
    // using `interface` is also ok
    OnImageLoaded: (path: string) => void
};


export class ImageContainer extends React.Component<MyProps, {}> {

    constructor(props: MyProps) {
        super(props)

        listen('tauri://file-drop', event => {
            var payloads = event.payload as Array<string>;
            var imgPath = this.getImage(payloads)

            if (imgPath == null)
                return

            var img = document.getElementById("preview") as HTMLImageElement;

            let apiPath = tauri.convertFileSrc(imgPath)
            img.src = apiPath;

            this.props.OnImageLoaded(apiPath)
        })
    }

    getImage = (payloads: Array<string>) => {

        for (let i = 0; i < payloads.length; i++) {
            const payload = payloads[i];
            if (payload.endsWith(".png"))
                return payload
        }
    }

    render(): React.ReactNode {
        return (
            <div id="image_container">
                <img id="preview" src={testImg} />
            </div>
        )
    }
}