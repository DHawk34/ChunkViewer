import React, { useState } from "react";
import "./App.css";
import { tauri } from "@tauri-apps/api";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";
import { ToolbarContainer } from "./components/ToolbarContainer/ToolbarContainer";
import dragImg from './components/ImageContainer/dragANDdrop.png';
import chunkHandler, { ChunkTypes, ReadSettings } from "./scripts/chunks/chunkHandler";
import { getMatches } from '@tauri-apps/api/cli'
import { listen } from "@tauri-apps/api/event";
import { swap } from "./scripts/utils";
import { Parameters, parseParameters } from "./scripts/sdParamParser";
import { dialog } from '@tauri-apps/api'
import { DragDropContext, DropResult } from "react-beautiful-dnd";

export type AppState = {
  chunkArray: { name: string, value: string }[],
  imageUrl: string
}

export class App extends React.Component<{}, AppState>{
  argsLoaded: boolean = false;

  constructor(props: any) {
    super(props);
    this.state = {
      chunkArray: [{
        name: "TEST",
        value: "param1: param"
      }],
      imageUrl: dragImg
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

  componentDidMount(): void {
    this.setupDragAndDrop();

    if (!this.argsLoaded) {
      this.loadImageFromArgs();
      this.argsLoaded = true;
    }
  }

  setupDragAndDrop = () => {
    listen('tauri://file-drop', event => {
      var payloads = event.payload as Array<string>;
      var imgPath = this.getImageFromPayloads(payloads)

      if (imgPath == null)
        return

      this.loadImage(imgPath);
    })
  }

  loadImageFromArgs = () => {
    getMatches().then(async ({ args, subcommand }) => {
      let fileName = args['fileName'].value;

      if (fileName && typeof (fileName) === 'string' && fileName != '') {
        await tauri.invoke('extend_scope', { path: fileName })
        this.loadImage(fileName)
      }
    })
  }

  //#region chunks
  updateChunkArray = (newChunkArray: { name: string; value: string }[]) => {
    this.setState({ chunkArray: newChunkArray })
  }

  loadChunks = async (path: string, readSettings: ReadSettings): Promise<boolean> => {
    return chunkHandler.readChunks(path, readSettings)
      .then(({ chunks, error, message }) => {
        if (error) {
          this.showMessage(message)
          console.log(message)
          return Promise.resolve(false);
        }

        if (message && message != '')
          this.showMessage(message);

        let chunkArray: { name: string, value: string }[] = []

        chunks.forEach(chunk => {
          chunkArray.push({ name: chunk.name, value: chunk.value })
        });

        this.updateChunkArray(chunkArray)
        return Promise.resolve(true)
      })
      .catch((err) => {
        this.showMessage('Не удалось загрузить картинку!');
        console.log(err)
        return Promise.resolve(false)
      })
  }
  //#endregion

  //#region Image loading
  getImageFromPayloads = (payloads: Array<string>) => {
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i];
      if (payload.endsWith(".png"))
        return payload
    }
  }

  loadImage = (imgPath: string) => {
    let apiPath = tauri.convertFileSrc(imgPath)
    this.loadChunks(apiPath, new ReadSettings(false, true))
      .then((succeeded) => {
        if (succeeded)
          this.setState({ imageUrl: apiPath })
      })
  }
  //#endregion



  saveImage = () => {
    // TODO: retrieve ChunkTypes from settings
    chunkHandler.saveImageWithNewChunks(this.state.chunkArray, ChunkTypes.tEXt)
      .then(() => {
        console.log('Сохранилося )')
      })
      .catch((error) => {
        console.log('Не сохранилося (\n' + error)
      })
  }


  replaceChunksFromAnotherImage = (imgUrl: string) => {
    this.loadChunks(imgUrl, new ReadSettings(false, false))
  }



  showMessage = (message: string) => {
    alert(message)
  }

  dropChunk = (result: DropResult) => {
    if (!result.destination)
      return;

    if (result.source.index === result.destination.index)
      return;

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    let newArr = [...this.state.chunkArray];
    //console.log(newArr);

    //[newArr[sourceIndex], newArr[destinationIndex]] = [newArr[destinationIndex], newArr[sourceIndex]]
    swap(newArr, destinationIndex, sourceIndex);

    // console.log(newArr);

    this.setState({ chunkArray: newArr })
  }


  render(): React.ReactNode {
    return (
      <div id="#container">
        <ImageContainer imageUrl={this.state.imageUrl} />
        <DragDropContext onDragEnd={this.dropChunk} >
          <ChunkContainer chunkArray={this.state.chunkArray} OnChunksUpdated={this.updateChunkArray} />
        </DragDropContext>
        <ToolbarContainer OnExportImage={this.saveImage} OnCopyChunks={this.replaceChunksFromAnotherImage} />
      </div>
    );
  }
}
