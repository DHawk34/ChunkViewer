import './ToolbarContainer.css'
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import React from "react";
import { FeaturesContainer } from '../FeaturesContainer/FeaturesContainer';

type MyProps = {
    // chunkArray: { name: string, value: string | Object }[] | null,
    // OnChunksUpdated: (chunk: { name: string, value: string | Object }[]) => void | null
    OnExportImage: () => void,
    OnCopyChunks: (imgPath: string) => void
};

export class ToolbarContainer extends React.Component<MyProps, {}> {
    render(): React.ReactNode {
        return (
            <div id="toolbar_container">
                <Tabs className="Tabs">
                    <TabList>
                        <Tab>Features</Tab>
                        <Tab>Options</Tab>
                    </TabList>
                    <TabPanel>
                        <FeaturesContainer OnExportImage={this.props.OnExportImage} OnReplaceChunks={this.props.OnCopyChunks}/>
                    </TabPanel>
                    <TabPanel>
                        <p>Comming soon!</p>
                    </TabPanel>
                </Tabs>
            </div>
        )
    }
}