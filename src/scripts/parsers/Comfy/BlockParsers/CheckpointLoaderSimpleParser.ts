export default class CheckpointLoaderSimpleParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('ckpt_name'))
            block[key] = block[key].ckpt_name
    }
}