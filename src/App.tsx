import React, { useState } from "react";
import "./App.css";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";
import chunkHandler, { ReadSettings } from "./scripts/chunkHandler";
import { text } from "stream/consumers";

export type ChunkType = {
  name: string,
  text: string
}

export type AppState = {
  chunkArray: ChunkType[]
}

export class App extends React.Component<{}, AppState>{
  constructor(props: any) {
    super(props);
    this.state = {
      chunkArray: [
        {
          name: "TEXT",
          text: "some cool text"
        },
        {
          name: "TEXT222",
          text: "another cool text"
        }
      ]
    }
  }

  updateChunkArray = (newChunkArray: { name: string; text: string; }[]) => {
    this.setState({ chunkArray: newChunkArray })
  }

  loadChunks = (path: string) => {
    console.log("load chunks")
    chunkHandler.readChunks(path, new ReadSettings(false)).then((chunks) => {
      let result: { name: string; text: string; }[] = []
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(chunk)
        result.push({ name: chunk.name, text: chunk.value.toString() })
      }

      this.updateChunkArray(result)
    })
  }

  render(): React.ReactNode {
    return (
      <div id="#container">
        <ImageContainer OnImageLoaded={this.loadChunks} />
        <ChunkContainer chunkArray={this.state.chunkArray} OnChunksUpdated={this.updateChunkArray} />
        <div id="toolbar_container">
          <button className="toolbar_button">Test</button>
        </div>
      </div>
    );
  }

}

