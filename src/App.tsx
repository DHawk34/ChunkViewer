import React, { useState } from "react";
import "./App.css";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";

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

  render(): React.ReactNode {
    return (
      <div id="#container">
        <ImageContainer OnImageLoaded={() => { }} />
        <ChunkContainer chunkArray={this.state.chunkArray} OnChunksUpdated={this.updateChunkArray} />
        <div id="toolbar_container">
          <button className="toolbar_button">Test</button>
        </div>
      </div>
    );
  }

}

