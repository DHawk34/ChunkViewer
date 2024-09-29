import { useEffect, useRef } from "react";
import { ChunkTypes } from "@/scripts/chunks/chunkSaver";
import { extensionSettingsManager, settingsManager } from "@/scripts/settings/settings";
import './SettingsContainer.css'
import { Expandable } from "../Expandable/Expandable";
import { ExpandableGroup } from "../ExpandableGroup/ExpandableGroup";
import { Switcher } from "../Switcher/Switcher";
import { MySelect } from "../MySelect/MySelect";
import { tauri } from "@tauri-apps/api";

export function SettingsContainer() {
    const comboBox = useRef<HTMLSelectElement>(null)
    const chunkTypeDefaulValue = get_chunkType()

    // init state from settings
    useEffect(() => {
        if (comboBox.current) comboBox.current.value = get_chunkType()
    }, [])

    return (
        <div id='settings_container'>
            <h3 className="settings_header">General</h3>
            <hr className="settings_hr" />
            <div className="settings_panel">
                <div className="setting_row">
                    <p className="setting_name">Chunk type when saving</p>
                    <MySelect defaultValue={{ label: chunkTypeDefaulValue, value: chunkTypeDefaulValue }} values={
                        [
                            { label: `${ChunkTypes.tEXt} (default)`, value: ChunkTypes.tEXt },
                            { label: ChunkTypes.iTXt, value: ChunkTypes.iTXt },
                            { label: ChunkTypes.zTXt, value: ChunkTypes.zTXt }
                        ]
                    } onChange={update_chunkType} />
                </div>

                <div className="setting_row">
                    <p className="setting_name">Allow <span className="tooltip">unsafe <span className="tooltiptext">If chunk name is 4-character, save it as code rather than text</span></span> chunk names</p>
                    <div className="setting_input">
                        <Switcher defaultChecked={get_allowUnsafeChunkNames()} OnChange={update_allowUnsafeChunkNames} />
                    </div>
                </div>

                <button>Check for Update</button>
            </div>


            {/* <div className="test"> */}
            {/* <label htmlFor="chunk_type">Chunk type when saving</label>

                        <select id="chunk_type" ref={comboBox} onChange={update_chunkType}>
                            <option value={ChunkTypes.tEXt}> {ChunkTypes.tEXt} (default) </option>
                            <option value={ChunkTypes.iTXt}> {ChunkTypes.iTXt} </option>
                            <option value={ChunkTypes.zTXt}> {ChunkTypes.zTXt} </option>
                        </select>

                        <label>
                            Allow <span className="tooltip">unsafe
                                <span className="tooltiptext">If chunk name is 4-character, save it as code rather than text</span>
                            </span> chunk names

                            <input ref={checkBox} id="unsafe_chunkname_checkbox" type="checkbox" onChange={update_allowUnsafeChunkNames} />
                        </label> */}

            {/* <SettingsPanel /> */}
            {/* </div> */}
            <h3 className="settings_header">Stable Diffusion</h3>
            <hr className="settings_hr" />
            <div className="settings_panel">
                <div className="setting_row">
                    <p className="setting_name">Parse params on image load</p>
                    <div className="setting_input">
                        <Switcher defaultChecked={false} OnChange={() => { }} />
                    </div>
                </div>
                <div className="setting_row">
                    <p className="setting_name">Show only biggest chunk (ComfyUI)</p>
                    <div className="setting_input">
                        <Switcher defaultChecked={false} OnChange={() => { }} />
                    </div>
                </div>
            </div>

            <h3 className="settings_header"></h3>
            <hr className="settings_hr" />
            <div className="settings_panel">
                <button onClick={openSettingsFolder}>Open extensions folder</button>
            </div>
        </div>
    )
}



// chunk type
function get_chunkType() {
    return settingsManager.getCache('chunkType')
}

function update_chunkType(newValue: string) {
    const value = newValue as ChunkTypes
    settingsManager.setCache('chunkType', value)
}

// unsafe chunk names
function get_allowUnsafeChunkNames() {
    return settingsManager.getCache('allowUnsafeChunkNames')
}

function update_allowUnsafeChunkNames(newValue: boolean) {
    settingsManager.setCache('allowUnsafeChunkNames', newValue)
}

async function openSettingsFolder() {
    tauri.invoke('show_in_folder', { path: extensionSettingsManager.path })
}
