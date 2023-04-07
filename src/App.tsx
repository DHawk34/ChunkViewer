import React, { useState } from "react";
import "./App.css";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";
import { ToolbarContainer } from "./components/ToolbarContainer/ToolbarContainer";
import chunkHandler, { ReadSettings } from "./scripts/chunkHandler";
import { text } from "stream/consumers";

export type AppState = {
  chunkArray: { name: string, value: string | Object }[]
}

export class App extends React.Component<{}, AppState>{
  constructor(props: any) {
    super(props);
    this.state = {
      chunkArray:[]
    }
    // this.state = {
    //   chunkArray: [
    //     {
    //       name: "TEXT",
    //       value: "some cool text"
    //     },
    //     {
    //       name: "TEXT222",
    //       value: "another cool text"
    //     }
    //   ]
    // }
  }

  updateChunkArray = (newChunkArray: { name: string; value: string | Object }[]) => {
    this.setState({ chunkArray: newChunkArray })
  }

  loadChunks = (path: string) => {
    chunkHandler.readChunks(path, new ReadSettings(false, false)).then(({ chunks, message }) => {
      console.log(message)
      let result: { name: string; value: string; }[] = []
      // if (message != '') {
      //   result.push({ name: 'message', text: message })
      // }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(chunk)
        result.push({ name: chunk.name, value: chunk.value.toString() })
      }

      this.updateChunkArray(result)
    })
  }

  render(): React.ReactNode {
    return (
      <div id="#container">
        <ImageContainer OnImageLoaded={this.loadChunks} />
        <ChunkContainer chunkArray={this.state.chunkArray} OnChunksUpdated={this.updateChunkArray} />
        <ToolbarContainer OnExportImage={(p) => {console.log(p)}}/>
      </div>
    );
  }

}

