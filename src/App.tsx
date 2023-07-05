import React from "react";
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
import { SaveOptions } from "./scripts/chunks/chunkSaver";
import { StatusBar, logMessage } from "./components/StatusBar/StatusBar";
import "./App.css";

export function App() {
  const [chunkArray, setChunkArray] = useState<ChunkData[]>([])
  const [imageUrl, setImageUrl] = useState<string>(dragImg)
  const [logs, setLogs] = useState<logMessage[]>([])

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
      const payloads = event.payload as string[]
      const imgPath = getImageFromPayloads(payloads)

      if (!imgPath) return
      loadImage(imgPath)
      addLogImageLoaded(imgPath)
    })

    unlistenDnd.current = unlisten
  }

  function loadImageFromArgs() {
    getMatches().then(async ({ args }) => {
      const fileName = args['fileName'].value

      if (fileName && typeof (fileName) === 'string' && fileName !== '') {
        await tauri.invoke('extend_scope', { path: fileName })
        loadImage(fileName)
        addLogImageLoaded(fileName)
      }
    })
  }

  function getFileNameFromPath(filePath: string): string {
    return filePath.replace(/^.*(\\|\/|:)/, '')
  }



  async function loadChunks(path: string, rememberImageBytes?: boolean): Promise<boolean> {
    let succeeded = false

    await chunkHandler.readChunks(path, rememberImageBytes)
      .then(({ chunks, message }) => {
        if (message && message !== '')
          addLog(message)

        setChunkArray(chunks)
        succeeded = true
      })
      .catch(e => {
        addLog(e?.message ?? e, true)
        succeeded = false
      })

    return succeeded
  }



  //#region Image loading
  function getImageFromPayloads(payloads: string[]) {
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i]

      if (payload.endsWith('.png'))
        return payload
    }
  }

  function loadImage(imgPath: string) {
    const apiPath = tauri.convertFileSrc(imgPath)

    loadChunks(apiPath, true)
      .then(succeeded => {
        if (succeeded)
          setImageUrl(apiPath)
      })
  }

  function saveImage() {
    // TODO: retrieve ChunkTypes & allowUnsafeChunkNames from settings

    const saveOptions: SaveOptions = { chunkType: ChunkTypes.tEXt, allowUnsafeChunkNames: false }

    chunkHandler.saveImageWithNewChunks(chunkArray, saveOptions)
      .then(() => addLog('Image saved'))
      .catch(e => addLog(e, true))
  }
  //#endregion



  function addLog(message: string, error: boolean = false) {
    if (message.startsWith('AbortError')) return
    if (error) {
      console.log(message)
      message = 'ERROR: ' + message
    }

    setLogs(logs => {
      return [{ message: `${getTime()} ${message}`, error: error }, ...logs];
    })
  }

  function addLogImageLoaded(fileName: string) {
    return addLog(`Loaded "${getFileNameFromPath(fileName)}"`)
  }

  function getTime() {
    return `[${new Date().toLocaleTimeString()}]`
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
      .then(() => addLog('Parameters are exported'))
      .catch(e => addLog(e, true))
  }

  function exportAllChunks() {
    if (chunkArray.length === 0) return

    chunkHandler.exportChunks(chunkArray)
      .then(() => addLog('All chunks are exported'))
      .catch(e => addLog(e, true))
  }


  
  return (
    <div id='container'>
      <ImageContainer imageUrl={imageUrl} />

      <DragDropContext onDragEnd={dropChunk} >
        <ChunkContainer
          chunkArray={chunkArray}
          OnChunksUpdated={setChunkArray} />
      </DragDropContext>

      <ToolbarContainer
        OnExportImage={saveImage}
        OnExportParameters={exportParams}
        OnExportAllChunks={exportAllChunks}
        OnReplaceChunks={loadChunks}
      />

      <StatusBar
        logMessages={logs}
      />
    </div>
  )
}
