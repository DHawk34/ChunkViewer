export default class SaveImageParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('class_type')) {
            delete block[key].class_type
        }

        if (block[key].hasOwnProperty('filename_prefix')) {
            delete block[key].filename_prefix
        }

        Object.keys(block[key]).forEach(childKeys => {
            block[childKeys] = block[key][childKeys]
        })

        delete block[key]
    }
}