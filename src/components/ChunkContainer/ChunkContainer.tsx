import './ChunkContainer.css'
import React, { useState } from "react";
import { Chunk } from '../Chunk/Chunk';
import { Droppable } from 'react-beautiful-dnd';
import { Parameters } from '../../scripts/sdParamParser';
import { ChunkParams } from '../ChunkParams/ChunkParams';
import { StrictModeDroppable } from '../StrictModeDroppable';
import { ChunkData } from '../../scripts/chunks/chunkHandler';

type MyProps = {
    chunkArray: ChunkData[],
    OnChunksUpdated: (chunk: ChunkData[]) => void
};

export class ChunkContainer extends React.Component<MyProps, {}> {

    //a = ()=> console.log(this.props);
    // constructor(props: MyProps){
    //     super(props)
    //     console.log("const");
    // }


    addChunk = () => {
        let source = [...this.props.chunkArray, { name: 'New Chunk', value: '' }];
        // console.log(source);
        this.props.OnChunksUpdated(source)
    }

    chunkUpdate = (index: number, newValue: ChunkData) => {
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
        //console.log(this.props.chunkArray)
        let chunkElements = this.props.chunkArray.map((chunk: ChunkData, index: number) => {
            //if (typeof (item.value) === 'string') {
            return <Chunk index={index} chunk={chunk} OnDelete={this.chunkDelete} OnUpdate={this.chunkUpdate} key={index} />
            //}
            // else{
            //     return <ChunkParams index={index} chunk={{name: item.name, value: item.value}} OnDelete={this.chunkDelete} OnUpdate={this.chunkUpdate} key={index}/>
            // }
        })

        return (
            <div id="chunk_container">
                <StrictModeDroppable droppableId='chunks'>
                    {(provided) => (
                        <div id='drag_container'
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {chunkElements}
                            {provided.placeholder}
                        </div>
                    )}
                </StrictModeDroppable>
                <button id="add_chunk_button" className="button" onClick={this.addChunk}>+</button>
            </div>
        )
    }
}