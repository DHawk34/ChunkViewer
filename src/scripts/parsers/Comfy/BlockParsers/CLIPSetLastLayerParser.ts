export default class CLIPSetLastLayerParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('stop_at_clip_layer'))
            block.stop_at_clip_layer = block[key].stop_at_clip_layer

        if (block[key].hasOwnProperty('clip'))
            block[key] = block[key].clip
    }
}