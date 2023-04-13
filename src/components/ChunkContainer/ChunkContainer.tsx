import './ChunkContainer.css'
import React, { useState } from "react";
import { Chunk } from '../Chunk/Chunk';

type MyProps = {
    chunkArray: { name: string, value: string | Object }[],
    OnChunksUpdated: (chunk: { name: string, value: string | Object }[]) => void
};

export class ChunkContainer extends React.Component<MyProps, {}> {

    //a = ()=> console.log(this.props);
    // constructor(props: MyProps){
    //     super(props)
    //     console.log("const");
    // }


    addChunk = () => {
        let source = [...this.props.chunkArray, { name: "New Chunk", value: "" }];
        console.log(source);
        this.props.OnChunksUpdated(source)
    }

    chunkUpdate = (index: number, newValue: { name: string; value: string | Object }) => {
        let list = [...this.props.chunkArray];
        list[index] = newValue;
        this.props.OnChunksUpdated(list)
    }

    chunkDelete = (index: number) => {
        let list = this.props.chunkArray;
        list.splice(index, 1);
        this.props.OnChunksUpdated(list)
    }

    render(): React.ReactNode {
        let chunkElements = this.props.chunkArray.map((item: { name: string; value: string | Object; }, index: number) => {
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