import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FeaturesContainer, FeaturesProps } from '../FeaturesContainer/FeaturesContainer';
import { SettingsContainer } from "../SettingsContainer/SettingsContainer";
import { getVersion } from '@tauri-apps/api/app';
import './ToolbarContainer.css'

const appVersion = await getVersion()

export function ToolbarContainer(props: FeaturesProps) {
    return (
        <div id='toolbar_container'>
            <Tabs>
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
                </TabPanel>
            </Tabs>
            <p id='version_label'>v {appVersion}</p>
        </div>
    )
}