import { useEffect, useRef, useState } from "react";
import { tauri } from "@tauri-apps/api";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";
import { ToolbarContainer } from "./components/ToolbarContainer/ToolbarContainer";
import dragImg from './components/ImageContainer/dragANDdrop.png';
import chunkHandler, { ChunkData, ChunkTypes } from "./scripts/chunks/chunkHandler";
import { getMatches } from '@tauri-apps/api/cli'
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { swap } from "./scripts/utils";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import "./App.css";
import { SaveOptions } from "./scripts/chunks/chunkSaver";

export function App() {
  const [chunkArray, setChunkArray] = useState<ChunkData[]>([])
  const [imageUrl, setImageUrl] = useState<string>(dragImg)
  const unlistenDnd = useRef<UnlistenFn>()

  useEffect(() => {
    setupDragAndDrop()
    loadImageFromArgs()

    return () => {
      if (unlistenDnd.current)
        unlistenDnd.current()
    }
  }, [])

  async function setupDragAndDrop() {
    const unlisten = await listen('tauri://file-drop', event => {
      var payloads = event.payload as string[]
      var imgPath = getImageFromPayloads(payloads)

      if (!imgPath) return
      loadImage(imgPath)
    })

    unlistenDnd.current = unlisten
  }

  function loadImageFromArgs() {
    getMatches().then(async ({ args }) => {
      let fileName = args['fileName'].value

      if (fileName && typeof (fileName) === 'string' && fileName !== '') {
        await tauri.invoke('extend_scope', { path: fileName })
        loadImage(fileName)
      }
    })
  }

  //#region chunks
  function updateChunkArray(newChunkArray: ChunkData[]) {
    setChunkArray(newChunkArray)
  }

  async function loadChunks(path: string): Promise<boolean> {
    let succeeded = false

    await chunkHandler.readChunks(path)
      .then(({ chunks, message }) => {
        if (message && message !== '')
          showMessage(message)

        updateChunkArray(chunks)
        succeeded = true
      })
      .catch(e => {
        console.log(e)
        showMessage(e?.message ?? e)
        succeeded = false
      })

    return succeeded
  }
  //#endregion

  //#region Image loading
  function getImageFromPayloads(payloads: string[]) {
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i]

      if (payload.endsWith('.png'))
        return payload
    }
  }

  function loadImage(imgPath: string) {
    let apiPath = tauri.convertFileSrc(imgPath)
    loadChunks(apiPath)
      .then(succeeded => {
        if (succeeded)
          setImageUrl(apiPath)
      })
  }
  //#endregion



  function saveImage() {
    // TODO: retrieve ChunkTypes & allowUnsafeChunkNames from settings

    const saveOptions: SaveOptions = { chunkType: ChunkTypes.tEXt, allowUnsafeChunkNames: false }

    chunkHandler.saveImageWithNewChunks(chunkArray, saveOptions)
      .then(() => {
        console.log('Сохранилося )')
      })
      .catch((error) => {
        console.log('Не сохранилося (\n' + error)
      })
  }



  function showMessage(message: string) {
    alert(message)
  }

  function dropChunk(result: DropResult) {
    if (!result.destination)
      return

    if (result.source.index === result.destination.index)
      return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    const newArr = [...chunkArray]

    swap(newArr, sourceIndex, destinationIndex)
    setChunkArray(newArr)
  }

  function exportParams() {
    const chunks = chunkArray.filter(x => x.name === 'parameters' || x.name === 'extras' || x.name === 'postprocessing')
    if (chunks.length === 0) return

    chunkHandler.exportParameters(chunks)
      .catch(e => console.log(e))
  }

  function exportAllChunks() {
    if (chunkArray.length === 0) return

    chunkHandler.exportChunks(chunkArray)
      .catch(e => console.log(e))
  }

  return (
    <div id='container'>
      <ImageContainer imageUrl={imageUrl} />

      <DragDropContext onDragEnd={dropChunk} >
        <ChunkContainer
          chunkArray={chunkArray}
          OnChunksUpdated={updateChunkArray} />
      </DragDropContext>

      <ToolbarContainer
        OnExportImage={saveImage}
        OnExportParameters={exportParams}
        OnExportAllChunks={exportAllChunks}
        OnReplaceChunks={loadChunks}
      />
    </div>
  )
}
