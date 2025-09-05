import { appWindow } from "@tauri-apps/api/window"
import { MySettingsManager } from "./MySettingsManager"
import { ChunkTypes } from "../chunks/chunkSaver"
import { fs, path } from "@tauri-apps/api"
import settingsSchema from './schemas/settings.schema.json?raw'
import extensionsSchema from './schemas/extensions.schema.json?raw'

type SettingsSchema = {
    allowUnsafeChunkNames: boolean
    parseParamsOnLoad: boolean
    showOnlyBiggestBlock: boolean
    chunkType: ChunkTypes
}

type ExtensionSettingsSchema = {
    chunkExtensions: ChunkExtension[]
}

export type ChunkExtension = {
    name: string,
    removeAllChunks?: boolean
    chunksToRemove?: string[]
    chunksToAdd?: {
        name: string
        value: string
    }[]
}

export const settingsManager = new MySettingsManager<SettingsSchema>(
    { // defaults
        $schema: "./settings.schema.json",
        allowUnsafeChunkNames: false,
        parseParamsOnLoad: false,
        showOnlyBiggestBlock: false,
        chunkType: ChunkTypes.tEXt
    } as SettingsSchema,
    { // options
        prettify: true,
        fileName: 'settings'
    }
)

export const extensionSettingsManager = new MySettingsManager<ExtensionSettingsSchema>(
    { // default
        $schema: "./extensions.schema.json",
        chunkExtensions: []
    } as ExtensionSettingsSchema,
    { // options
        prettify: true,
        fileName: 'extensions'
    }
)



console.time('settings init')
await settingsManager.initialize()
await extensionSettingsManager.initialize()
console.timeEnd('settings init')



const settingsFolderPath = await path.dirname(settingsManager.path) + path.sep
const settingsSchemaFileName = "settings.schema.json"
const extensionsSchemaFileName = "extensions.schema.json"

if (!(await fs.exists(settingsFolderPath + settingsSchemaFileName))) {
    fs.writeTextFile(settingsFolderPath + settingsSchemaFileName, settingsSchema)
}

if (!(await fs.exists(settingsFolderPath + extensionsSchemaFileName))) {
    fs.writeTextFile(settingsFolderPath + extensionsSchemaFileName, extensionsSchema)
}



appWindow.onCloseRequested(() => {
    settingsManager.syncCache()
    extensionSettingsManager.syncCache()
})
