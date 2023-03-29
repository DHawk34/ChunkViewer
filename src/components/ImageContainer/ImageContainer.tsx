import testImg from './test.png';
import { listen } from '@tauri-apps/api/event'
import { tauri } from "@tauri-apps/api";
import './ImageContainer.css'
import React, { useState } from "react";


export type MyProps = {
    // using `interface` is also ok
    OnImageLoaded: (path: string) => void
};


export class ImageContainer extends React.Component<MyProps, {}> {

    constructor(props: MyProps) {
        super(props)

        listen('tauri://file-drop', event => {
            var a = event.payload as Array<any>;
            var img = document.getElementById("preview") as HTMLImageElement;
            console.log(a[0]);
            let apiPath = tauri.convertFileSrc(a[0])
            console.log(apiPath);
            img.src = apiPath;

            this.props.OnImageLoaded(a[0])
        })
    }

    render(): React.ReactNode {
        return (
            <div id="image_container">
                <img id="preview" src={testImg} />
            </div>
        )
    }
}