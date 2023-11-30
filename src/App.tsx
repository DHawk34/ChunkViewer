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
import { getFileNameFromPath, removeExtFromFileName, swap } from "./scripts/utils";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { useLogger } from "./scripts/hooks/useLoggerHook";
import { varStore } from "./scripts/variableStore";
import "./App.css";

const cli_image_filename_arg_name = 'filename'

export function App() {
  const [chunkArray, setChunkArray] = useState<ChunkData[]>([])
  const [imageUrl, setImageUrl] = useState<string>(dragImg)

  const logger = useLogger()
  const { logs, log, logError } = logger

  const unlistenDnd = useRef<UnlistenFn>()

  useEffect(() => {
    setupDragAndDrop()
    loadImageFromArgs()

    return () => {
      if (unlistenDnd.current)
        unlistenDnd.current()
    }
  }, [])



  function logImageLoaded(fileName: string) {
    return log(`Loaded "${getFileNameFromPath(fileName)}"`)
  }

  async function setupDragAndDrop() {
    const unlisten = await listen('tauri://file-drop', event => {
      const payloads = event.payload as string[]
      const imgPath = getImageFromPayloads(payloads)

      if (!imgPath) return
      loadImage(imgPath)
      logImageLoaded(imgPath)
    })

    unlistenDnd.current = unlisten
  }

  function loadImageFromArgs() {
    getMatches().then(async ({ args }) => {
      const fileName = args[cli_image_filename_arg_name].value

      if (fileName && typeof (fileName) === 'string' && fileName !== '') {
        await tauri.invoke('extend_scope', { path: fileName })
        loadImage(fileName)
        logImageLoaded(fileName)
      }
    })
  }



  function getImageFromPayloads(payloads: string[]) {
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i]
      if (payload.endsWith('.png'))
        return payload
    }
  }

  function loadImage(imgPath: string) {
    varStore.openedImageName = removeExtFromFileName(getFileNameFromPath(imgPath))
    const url = tauri.convertFileSrc(imgPath)

    chunkHandler.readChunks(url, true)
      .then(({ chunks, message }) => {
        if (message && message !== '')
          log(message)

        chunks.forEach(chunk => {
          if (chunk.crcIsBad)
            logError(`Chunk '${chunk.name}' has bad CRC value! Export image to fix it.`)
        })

        setChunkArray(chunks)
        setImageUrl(url)
      })
      .catch(e => logError(e?.message ?? e))
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



  return (
    <div id='container'>
      <ImageContainer imageUrl={imageUrl} />

      <DragDropContext onDragEnd={dropChunk} >
        <ChunkContainer
          chunkArray={chunkArray}
          OnChunksUpdated={setChunkArray} />
      </DragDropContext>

      <ToolbarContainer
        chunkArray={chunkArray}
        setChunkArray={setChunkArray}
        logger={logger}
      />

      <StatusBar logs={logs} />
    </div>
  )
}
