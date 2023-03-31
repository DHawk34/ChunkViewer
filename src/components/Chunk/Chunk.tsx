import './Chunk.css'
import React from "react";
import { appWindow } from "@tauri-apps/api/window";
import { event } from '@tauri-apps/api';

export type MyProps = {
    // using `interface` is also ok
    index: number,
    chunk: { name: string, text: string },
    OnUpdate: (index: number, newValue: { name: string, text: string }) => void,
    OnDelete: (index: number) => void
};

export class Chunk extends React.Component<MyProps, {}> {

    curInput: HTMLElement | undefined | null;
    constructor(props: MyProps) {
        super(props)
        appWindow.listen("tauri://resize", (event) => {
            if (this.curInput != null) {
                this.autoGrow(this.curInput)
            }
        })
    }


    spawnInput = (element: HTMLElement, index: number) => {
        let val: string = element.textContent as string;
        var input = document.createElement("textarea");
        this.curInput = input;
        input.setAttribute("class", "editable_textarea");

        input.oninput = () => {
            this.autoGrow(input)
        }

        input.value = val;
        input.onblur = () => {
            var val = input.value;
            element.textContent = val;

            if (element.tagName == 'DIV') {
                this.props.chunk.name = input.value;
                this.props.OnUpdate(index, this.props.chunk)
            }
            else {
                this.props.chunk.text = input.value;
                this.props.OnUpdate(index, this.props.chunk)
            }
            this.curInput = null
        }
        element.innerHTML = "";
        element.appendChild(input);
        input.focus();

        input.style.height = (input.scrollHeight) + "px";
    }

    deleteChunk = () => {
        this.props.OnDelete(this.props.index);
    }

    autoGrow = (element: HTMLElement) => {
        element.style.height = "auto";
        element.style.height = (element.scrollHeight) + "px";
    }

    render(): React.ReactNode {
        return (
            <div className="chunk" key={this.props.index}>
                <div className="chunk_header">
                    <div className="chunk_name" onDoubleClick={(e) => this.spawnInput(e.currentTarget, this.props.index)}>{this.props.chunk.name}</div>
                    <svg className="delete_chunk_button button" onClick={this.deleteChunk} aria-hidden="true" role="img" width="35" height="35" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>
                </div>
                <p className="chunk_text" onDoubleClick={(e) => this.spawnInput(e.currentTarget, this.props.index)}>{this.props.chunk.text}</p>
            </div>
        )
    }
}