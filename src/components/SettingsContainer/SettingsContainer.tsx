import { useEffect, useRef } from "react";
import { ChunkTypes } from "@/scripts/chunks/chunkSaver";
import { settingsManager } from "@/scripts/settings/settings";
import './SettingsContainer.css'

export function SettingsContainer() {
    const comboBox = useRef<HTMLSelectElement>(null)
    const checkBox = useRef<HTMLInputElement>(null)

    // init state from settings
    useEffect(() => {
        if (checkBox.current) checkBox.current.checked = get_allowUnsafeChunkNames()
        if (comboBox.current) comboBox.current.value = get_chunkType()
    }, [])

    return (
        <div id='settings_container'>
            <label>Chunk type when saving</label>
            
            <select ref={comboBox} onChange={update_chunkType}>
                <option value={ChunkTypes.tEXt}> {ChunkTypes.tEXt} (default) </option>
                <option value={ChunkTypes.iTXt}> {ChunkTypes.iTXt} </option>
                <option value={ChunkTypes.zTXt}> {ChunkTypes.zTXt} </option>
            </select>

            <hr />

            <label>
                <input ref={checkBox} type="checkbox" onChange={update_allowUnsafeChunkNames} />
                Allow <span className="tooltip">unsafe
                    <span className="tooltiptext">If chunk name is 4-character, save it as code rather than text</span>
                </span> chunk names
            </label>
        </div>
    )
}



// chunk type
function get_chunkType() {
    return settingsManager.getCache('chunkType')
}

function update_chunkType(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as ChunkTypes
    settingsManager.setCache('chunkType', value)
}

// unsafe chunk names
function get_allowUnsafeChunkNames() {
    return settingsManager.getCache('allowUnsafeChunkNames')
}

function update_allowUnsafeChunkNames(e: React.ChangeEvent<HTMLInputElement>) {
    const checked: boolean = e.target.checked
    settingsManager.setCache('allowUnsafeChunkNames', checked)
}
