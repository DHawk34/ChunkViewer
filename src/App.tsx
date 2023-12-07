import React from "react";
import { useEffect, useRef, useState } from "react";
import { tauri } from "@tauri-apps/api";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";
import { ToolbarContainer } from "./components/ToolbarContainer/ToolbarContainer";
import dragImg from './components/ImageContainer/dragANDdrop.png';
import chunkHandler, { ChunkData, ChunkTypes } from "./scripts/chunks/chunkHandler";
import { getMatches } from '@tauri-apps/api/cli'
import { getFileNameFromUrlOrPath, removeExtFromFileName, swap } from "./scripts/utils";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { useLogger } from "./scripts/hooks/useLoggerHook";
import { varStore } from "./scripts/variableStore";
import "./App.css";
import axios from "axios";

const cli_image_filename_arg_name = 'filename'
const cli_parent_window_arg_name = 'parent-window'

export function App() {
  const [chunkArray, setChunkArray] = useState<ChunkData[]>([])
  const [imageUrl, setImageUrl] = useState<string>(dragImg)

  const logger = useLogger()
  const { logs, log, logError } = logger

  useEffect(() => {
    loadImageOnStartUp()
    setupDragAndDrop();
  }, [])

  function logImageLoaded(fileName: string) {
    return log(`Loaded "${getFileNameFromUrlOrPath(fileName)}"`)
  }

  function setupDragAndDrop() {

    document.body.ondrop = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!ev.dataTransfer)
        return;

      const { files } = ev.dataTransfer;

      if (files && files.length) {
        //console.log(files);
        var file = getImageFromFiles(files);

        if (!file) {
          logError('Это не пнг!')
          return;
        }

        let fileName = file.name;

        varStore.openedImageName = removeExtFromFileName(getFileNameFromUrlOrPath(file.name));
        file.arrayBuffer().then(buff => {
          loadImage(new Uint8Array(buff));
          logImageLoaded(fileName)
        })
      }
    };

    document.body.ondragover = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  function getImageFromFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.name.endsWith('.png'))
        return file
    }
  }

  function loadImageOnStartUp() {
    getMatches().then(async ({ args }) => {
      const fileName = args[cli_image_filename_arg_name].value

      if (!fileName) {
        const parent_window = args[cli_parent_window_arg_name].value
        if (!parent_window)
          return

        var imgFromBrowser = JSON.parse(await tauri.invoke('return_inp'))
        console.log(imgFromBrowser)

        if (imgFromBrowser) {
          let imgUrl: string = imgFromBrowser["imgUrl"];
          if (imgUrl.startsWith('file:///')) {
            imgUrl = imgUrl.substring(8)
            imgUrl = decodeURIComponent(imgUrl)
            await loadFromLocal(imgUrl)
            return;
          }

          varStore.openedImageName = removeExtFromFileName(getFileNameFromUrlOrPath(imgUrl))

          axios.get(imgUrl, { responseType: 'arraybuffer' }).then(response => {
            loadImage(new Uint8Array(response.data))
          })
          logImageLoaded(imgUrl)
        }

        return
      }

      if (typeof (fileName) === 'string' && fileName !== '') {
        await loadFromLocal(fileName);
      }
    })
  }

  async function loadFromLocal(fileName: string) {
    await tauri.invoke('extend_scope', { path: fileName });
    loadImageFromLocalPath(fileName);
    logImageLoaded(fileName);
  }

  function loadImageFromLocalPath(imgPath: string) {
    varStore.openedImageName = removeExtFromFileName(getFileNameFromUrlOrPath(imgPath))
    const url = tauri.convertFileSrc(imgPath)

    axios.get(url, { responseType: 'arraybuffer' }).then(response => {
      loadImage(new Uint8Array(response.data))
    })
  }

  function loadImage(fileData: Uint8Array) {
    chunkHandler.readChunks(fileData, true)
      .then(({ chunks, message }) => {
        if (message && message !== '')
          log(message)

        chunks.forEach(chunk => {
          if (chunk.crcIsBad)
            logError(`Chunk '${chunk.name}' has bad CRC value! Export image to fix it.`)
        })

        setChunkArray(chunks)
        //console.log('fire')
        setImageUrl(URL.createObjectURL(new Blob([fileData], { type: 'image/png' })))
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
