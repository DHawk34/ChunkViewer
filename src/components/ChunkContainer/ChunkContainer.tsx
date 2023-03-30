import './ChunkContainer.css'
import React, { useState } from "react";
import { Chunk } from '../Chunk/Chunk';

export type MyProps = {
    chunkArray: { name: string, text: string }[],
    OnChunksUpdated: (chunk: { name: string, text: string }[]) => void
};

export class ChunkContainer extends React.Component<MyProps, {}> {

    //a = ()=> console.log(this.props);
    // constructor(props: MyProps){
    //     super(props)
    //     console.log("const");
    // }


    addChunk = () => {

        let source = [...this.props.chunkArray, { name: "New Chunk", text: "" }];
        console.log(source);
        this.props.OnChunksUpdated(source)
    }

    chunkUpdate = (index: number, newValue: { name: string; text: string; }) => {
        let list = [...this.props.chunkArray];
        list[index] = newValue;
        this.props.OnChunksUpdated(list)
    }

    chunkDelete = (index: number) => {
        let list = [...this.props.chunkArray];
        list.splice(index, 1);
        this.props.OnChunksUpdated(list)
    }

    render(): React.ReactNode {
        let chunkElements = this.props.chunkArray.map((item: { name: string; text: string; }, index: number) => {
            return <Chunk index={index} chunk={item} OnDelete={this.chunkDelete} OnUpdate={this.chunkUpdate} key={index} />
        })

        return (
            <div id="chunk_container">
                {chunkElements}
                <a id="add_chunk_button" className="button" onClick={this.addChunk}>+</a>
            </div>
        )
    }
}