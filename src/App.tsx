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
import { StatusBar, logMessage } from "./components/StatusBar/StatusBar";
import React from "react";

export function App() {
  const [chunkArray, setChunkArray] = useState<ChunkData[]>([])
  const [imageUrl, setImageUrl] = useState<string>(dragImg)
  const [logs, setLogs] = useState<logMessage[]>([])


  const unlistenDnd = useRef<UnlistenFn>()
  const statusBarRef = React.createRef();

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
      addLog('Load ' + imgPath.replace(/^.*(\\|\/|:)/, ''))
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
        console.log(e)
        addLog('ERROR: ' + e?.message ?? e, true)
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
    loadChunks(apiPath, true)
      .then(succeeded => {
        if (succeeded)
          setImageUrl(apiPath)
      })
  }
  //#endregion


  function addLog(message: string, error: boolean = false) {
    // let newLogs = [...logs, { message: `${getTime()} ${message}`, error: error }];
    // console.log('logs ' + logs.length)
    // console.log('newLogs ' +newLogs.length);
    setLogs((logs) => {
      let newLogs = [...logs, { message: `${getTime()} ${message}`, error: error }];
      return newLogs;
    });
  }

  function getTime() {
    return `[${new Date().toLocaleTimeString()}]`
  }

  function saveImage() {
    // TODO: retrieve ChunkTypes & allowUnsafeChunkNames from settings

    const saveOptions: SaveOptions = { chunkType: ChunkTypes.tEXt, allowUnsafeChunkNames: false }

    chunkHandler.saveImageWithNewChunks(chunkArray, saveOptions)
      .then(() => {
        addLog('Image saved')
        console.log('Сохранилося )')
      })
      .catch((error) => {
        addLog('ERROR: ' + error, true)
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
      .then(() => addLog('Parameters exported'))
      .catch(e => {
        addLog('ERROR: ' + e, true)
        console.log(e)
      })
  }

  function exportAllChunks() {
    if (chunkArray.length === 0) return

    chunkHandler.exportChunks(chunkArray)
      .then(() => addLog('All chunks exported'))
      .catch(e => {
        addLog('ERROR: ' + e, true)
        console.log(e)
      })
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
        logMessage={logs}
      />
    </div>
  )
}
