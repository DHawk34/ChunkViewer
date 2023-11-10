import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FeaturesContainer, FeaturesProps } from '../FeaturesContainer/FeaturesContainer';
import './ToolbarContainer.css'

export function ToolbarContainer(props: FeaturesProps) {
    return (
        <div id="toolbar_container">
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
                    <p>Comming soon!</p>
                </TabPanel>
            </Tabs>
        </div>
    )
}