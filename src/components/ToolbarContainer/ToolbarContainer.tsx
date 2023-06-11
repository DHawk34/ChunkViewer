import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FeaturesContainer } from '../FeaturesContainer/FeaturesContainer';
import './ToolbarContainer.css'

type Props = {
    OnExportImage: () => void
    OnExportParameters: () => void
    OnExportAllChunks: () => void
    OnReplaceChunks: (imgPath: string) => void
}

export function ToolbarContainer(props: Props) {
    return (
        <div id="toolbar_container">
            <Tabs>
                <TabList>
                    <Tab>Features</Tab>
                    <Tab>Options</Tab>
                </TabList>
                <TabPanel>
                    <FeaturesContainer
                        OnExportImage={props.OnExportImage}
                        OnExportParameters={props.OnExportParameters}
                        OnExportAllChunks={props.OnExportAllChunks}
                        OnReplaceChunks={props.OnReplaceChunks}
                    />
                </TabPanel>
                <TabPanel>
                    <p>Comming soon!</p>
                </TabPanel>
            </Tabs>
        </div>
    )
}