import './Chunk.css'
import trashcanIcon from './trash.svg'
import React from "react";

export type MyProps = {
    // using `interface` is also ok
    index: number,
    chunk: { name: string, text: string },
    OnUpdate: (index: number, newValue: { name: string, text: string }) => void,
    OnDelete: (index: number) => void
};

export class Chunk extends React.Component<MyProps, {}> {

    spawnInput = (element: HTMLElement, index: number) =>{
        let val: string = element.textContent as string;
        var input = document.createElement("textarea");
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
        }
        element.innerHTML = "";
        element.appendChild(input);
        input.focus();

        input.style.height = (input.scrollHeight) + "px";
    }

    deleteChunk = (index: number) => {
        this.props.OnDelete(index);
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
                    <img className="delete_chunk_button button" src={trashcanIcon} onClick={() => this.deleteChunk(this.props.index)}/>
                </div>
                <p className="chunk_text" onDoubleClick={(e) => this.spawnInput(e.currentTarget, this.props.index)}>{this.props.chunk.text}</p>
            </div>
        )
    }
}