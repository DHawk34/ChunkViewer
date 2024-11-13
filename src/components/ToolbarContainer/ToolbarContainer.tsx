import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FeaturesContainer, FeaturesProps } from '../FeaturesContainer/FeaturesContainer';
import { SettingsContainer } from "../SettingsContainer/SettingsContainer";
import { settingsManager } from "@/scripts/settings/settings";
import './ToolbarContainer.css'


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
                        dragEnterCounter={props.dragEnterCounter}
                    />
                </TabPanel>

                <TabPanel>
                    <SettingsContainer />
                </TabPanel>
            </Tabs>
        </div>
    )
}

function saveSettings(index: number, last: number) {
    if (index === last) return
    settingsManager.syncCache()
}