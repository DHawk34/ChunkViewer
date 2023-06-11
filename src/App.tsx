import React, { useState } from "react";
import "./App.css";
import { tauri } from "@tauri-apps/api";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";
import { ToolbarContainer } from "./components/ToolbarContainer/ToolbarContainer";
import dragImg from './components/ImageContainer/dragANDdrop.png';
import chunkHandler, { ChunkData, ChunkTypes, exportParameters } from "./scripts/chunks/chunkHandler";
import { getMatches } from '@tauri-apps/api/cli'
import { listen } from "@tauri-apps/api/event";
import { swap } from "./scripts/utils";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

export type AppState = {
  chunkArray: ChunkData[]
  imageUrl: string
}

export class App extends React.Component<{}, AppState>{
  argsLoaded: boolean = false;

  constructor(props: any) {
    super(props);
    this.state = {
      chunkArray: [],
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
    this.setupDragAndDrop()

    if (!this.argsLoaded) {
      this.loadImageFromArgs()
      this.argsLoaded = true
    }
  }

  setupDragAndDrop = () => {
    listen('tauri://file-drop', event => {
      var payloads = event.payload as string[]
      var imgPath = this.getImageFromPayloads(payloads)

      if (!imgPath) return

      this.loadImage(imgPath);
    })
  }

  loadImageFromArgs = () => {
    getMatches().then(async ({ args, subcommand }) => {
      let fileName = args['fileName'].value

      if (fileName && typeof (fileName) === 'string' && fileName !== '') {
        await tauri.invoke('extend_scope', { path: fileName })
        this.loadImage(fileName)
      }
    })
  }

  //#region chunks
  updateChunkArray = (newChunkArray: ChunkData[]) => {
    this.setState({ chunkArray: newChunkArray })
  }

  loadChunks = async (path: string): Promise<boolean> => {
    return chunkHandler.readChunks(path)
      .then(({ chunks, error, message }) => {
        if (error) {
          this.showMessage(message)
          console.log(message)
          return Promise.resolve(false);
        }

        if (message && message != '')
          this.showMessage(message);

        this.updateChunkArray(chunks)
        return Promise.resolve(true)
      })
      .catch(e => {
        this.showMessage('Не удалось загрузить картинку!');
        console.log(e)
        return Promise.resolve(false)
      })
  }
  //#endregion

  //#region Image loading
  getImageFromPayloads = (payloads: string[]) => {
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i];

      if (payload.endsWith('.png'))
        return payload
    }
  }

  loadImage = (imgPath: string) => {
    let apiPath = tauri.convertFileSrc(imgPath)
    this.loadChunks(apiPath)
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
    this.loadChunks(imgUrl)
  }



  showMessage = (message: string) => {
    alert(message)
  }

  dropChunk = (result: DropResult) => {
    console.log('fire')

    if (!result.destination)
      return;

    if (result.source.index === result.destination.index)
      return;

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    let newArr = [...this.state.chunkArray];

    swap(newArr, sourceIndex, destinationIndex)
    // const [oneElement] = newArr.splice(sourceIndex, 1)
    // newArr.splice(destinationIndex, 0, oneElement)

    this.setState({ chunkArray: newArr })
  }

  exportParams = () => {
    const chunks = this.state.chunkArray.filter(x => x.name === 'parameters' || x.name === 'extras' || x.name === 'postprocessing')
    if (chunks.length === 0) return

    exportParameters(chunks)
      .catch(e => console.log(e))
  }

  render(): React.ReactNode {
    return (
      <div id="#container">
        <ImageContainer imageUrl={this.state.imageUrl} />
        <DragDropContext onDragEnd={this.dropChunk} >
          <ChunkContainer chunkArray={this.state.chunkArray} OnChunksUpdated={this.updateChunkArray} />
        </DragDropContext>
        <ToolbarContainer OnExportImage={this.saveImage} OnExportParameters={this.exportParams} OnCopyChunks={this.replaceChunksFromAnotherImage} />
      </div>
    )
  }
}
