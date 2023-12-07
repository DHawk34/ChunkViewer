import { appWindow } from "@tauri-apps/api/window"
import { SettingsManager } from "tauri-settings"
import { ChunkTypes } from "./chunks/chunkSaver"

type SettingsSchema = {
    allowUnsafeChunkNames: boolean
    chunkType: ChunkTypes
}

export const settingsManager = new SettingsManager<SettingsSchema>(
    { // defaults
        allowUnsafeChunkNames: false,
        chunkType: 'tEXt'
    },
    { // options
        prettify: true
    }
)

export function reloadSettingsFromStorage() {
    console.time('reload settings from storage')
    settingsManager.initialize()
    console.timeEnd('reload settings from storage')
}



console.time('settings init')
settingsManager.initialize().then(() => {
    console.timeEnd('settings init')
})

appWindow.onCloseRequested(() => {
    console.log('saving settings cache to storage...')
    settingsManager.syncCache()
})
