export default class DefaultParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('class_type')) {
            delete block[key].class_type
        }

        Object.keys(block[key]).forEach(childKeys => {
            block[childKeys] = block[key][childKeys]
        })

        delete block[key]
    }
}