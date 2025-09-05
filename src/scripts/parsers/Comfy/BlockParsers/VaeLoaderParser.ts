export default class VAELoaderParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('vae_name'))
            block[key] = block[key].vae_name
    }
}