export default class UpscaleModelLoaderParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('model_name')){
            block[key] = block[key].model_name
        }
    }
}