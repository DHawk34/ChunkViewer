import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FeaturesContainer, FeaturesProps } from '../FeaturesContainer/FeaturesContainer';
import { SettingsContainer } from "../SettingsContainer/SettingsContainer";
import { getVersion } from '@tauri-apps/api/app';
import { settingsManager } from "../../scripts/settings/settings";
import './ToolbarContainer.css'

const appVersion = await getVersion()

export function ToolbarContainer(props: FeaturesProps) {
    return (
        <div id='toolbar_container'>
            <Tabs className={'tabs'} onSelect={saveSettings}>
                <TabList>
                    <Tab>Features</Tab>
                    <Tab>Options</Tab>
                </TabList>

                <TabPanel>
                    <FeaturesContainer
                        chunkArray={props.chunkArray}
                        setChunkArray={props.setChunkArray}
                        logger={props.logger}
                    />
                </TabPanel>

                <TabPanel>
                    <SettingsContainer />
                    <p id='version_label'>v {appVersion}</p>
                </TabPanel>
            </Tabs>
        </div>
    )
}

function saveSettings(index: number, last: number) {
    if (index === last) return
    settingsManager.syncCache()
}