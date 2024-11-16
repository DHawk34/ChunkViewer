import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { tauri } from "@tauri-apps/api";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ChunkContainer } from "./components/ChunkContainer/ChunkContainer";
import { ToolbarContainer } from "./components/ToolbarContainer/ToolbarContainer";
import dragImg from './components/ImageContainer/dragANDdrop.png';
import chunkHandler from "./scripts/chunks/chunkHandler";
import { getMatches } from '@tauri-apps/api/cli'
import { getFileNameFromUrlOrPath, removeExtFromFileName } from "./scripts/utils/utils";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { useLogger } from "./scripts/hooks/useLoggerHook";
import { varStore } from "./scripts/variableStore";
import { useDragEnterCounter } from "./scripts/hooks/useDragEnterCounterHook";
import toast, { Toaster, ToastBar, Toast } from 'react-hot-toast';
import { ToasterWithMax } from "./components/ToasterWithMax/ToasterWithMax";
import { settingsManager } from "./scripts/settings/settings";
import { Buffer } from 'buffer';
import { useChunkArray } from "./scripts/hooks/useChunkArray";
import "./App.css";

const cli_image_filename_arg_name = 'filename'
const cli_parent_window_arg_name = 'parent-window'

export function App() {
  const chunkArray = useChunkArray()
  const [imageUrl, setImageUrl] = useState<string>(dragImg)

  const logger = useLogger()
  const { logs, log, logError } = logger

  const enterCounter = useDragEnterCounter()
  const { enterCount, incrementDragEnterCount, decrementDragEnterCount, setDragEnterCount } = enterCounter

  useEffect(() => {
    loadImageOnStartUp()
    setupDragAndDrop()
  }, [])


  function logImageLoaded(fileName: string) {
    return log(`Loaded "${getFileNameFromUrlOrPath(fileName)}"`)
  }

  function setupDragAndDrop() {

    document.body.ondragenter = (ev) => {
      incrementDragEnterCount();
      ev.preventDefault()
      ev.stopPropagation()
    }

    document.body.ondragleave = (ev) => {
      decrementDragEnterCount();
      ev.preventDefault()
      ev.stopPropagation()
    }

    document.body.ondrop = (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      setDragEnterCount(0)

      if (!ev.dataTransfer)
        return;

      const { files } = ev.dataTransfer;

      if (files && files.length) {
        //console.log(files);
        var file = getImageFromFiles(files);

        if (!file) {
          logError('This file is not PNG!')
          toast.error('This file is not PNG!')
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
          const imgData: string = imgFromBrowser["imgData"];
          console.log(imgData)
          const imgDataBytes: Uint8Array = new Uint8Array(Buffer.from(imgData, 'base64'))
          const fileName: string = imgFromBrowser["fileName"];

          varStore.openedImageName = removeExtFromFileName(fileName)

          loadImage(imgDataBytes)
          logImageLoaded(fileName)
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
          if (chunk.crcIsBad) {
            toast.error('Bad CRC value!')
            logError(`Chunk '${chunk.name}' has bad CRC value! Export image to fix it.`)
          }
        })

        chunkArray.reset(chunks)
        //console.log('fire')
        setImageUrl(URL.createObjectURL(new Blob([fileData], { type: 'image/png' })))
      })
      .catch(e => {
        toast.error('Image load error!')
        logError(e?.message ?? e)
      })
  }



  return (
    <div id='container'>
      <ImageContainer imageUrl={imageUrl} loadImage={loadImage} />

      <ChunkContainer
        chunkArray={chunkArray} />

      <ToolbarContainer
        chunkArray={chunkArray}
        logger={logger}
        dragEnterCounter={enterCounter}
      />

      <ToasterWithMax
        max={1}
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          zIndex: 10,
          bottom: '35px',
        }}


        toastOptions={{
          // Define default options
          className: '',
          duration: 2000,
          style: {
            background: '#484a52',
            color: '#fff',
            pointerEvents: 'none'
          },
        }}
      />


      <StatusBar logs={logs} />
    </div>
  )
}
