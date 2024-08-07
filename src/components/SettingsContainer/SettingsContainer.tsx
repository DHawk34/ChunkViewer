import { useEffect, useRef } from "react";
import { ChunkTypes } from "@/scripts/chunks/chunkSaver";
import { settingsManager } from "@/scripts/settings/settings";
import './SettingsContainer.css'
import { Expandable } from "../Expandable/Expandable";
import { ExpandableGroup } from "../ExpandableGroup/ExpandableGroup";
import { Switcher } from "../Switcher/Switcher";

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
            <ExpandableGroup>
                <Expandable header="General">
                    <div className="settings_panel">
                        <div className="setting_row">
                            <p className="setting_name">Allow <span className="tooltip">unsafe <span className="tooltiptext">If chunk name is 4-character, save it as code rather than text</span></span> chunk names</p>
                            <div className="setting_input">
                                <Switcher />
                            </div>
                        </div>

                        <div className="setting_row">
                            <p className="setting_name">Chunk type when saving</p>
                            <select className="setting_input" id="chunk_type" ref={comboBox} onChange={update_chunkType}>
                                <option value={ChunkTypes.tEXt}> {`${ChunkTypes.tEXt} (default)`}</option>
                                <option value={ChunkTypes.iTXt}> {ChunkTypes.iTXt} </option>
                                <option value={ChunkTypes.zTXt}> {ChunkTypes.zTXt} </option>
                            </select>
                        </div>

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
                </Expandable>

                <Expandable header="Stable Diffusion">
                    <div className="test">
                        <label htmlFor="chunk_type">Chunk type when saving</label>

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
                        </label>

                        <label htmlFor="chunk_type">Chunk type when saving</label>

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
                        </label>

                    </div>
                </Expandable>
            </ExpandableGroup>

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
