import { appWindow } from "@tauri-apps/api/window"
import { MySettingsManager } from "./MySettingsManager"
import { ChunkTypes } from "../chunks/chunkSaver"

type SettingsSchema = {
    allowUnsafeChunkNames: boolean
    chunkType: ChunkTypes
}

export const settingsManager = new MySettingsManager<SettingsSchema>(
    { // defaults
        allowUnsafeChunkNames: false,
        chunkType: ChunkTypes.tEXt
    },
    { // options
        prettify: true
    }
)



console.time('settings init')
await settingsManager.initialize()
console.timeEnd('settings init')

appWindow.onCloseRequested(() => {
    settingsManager.syncCache()
})
