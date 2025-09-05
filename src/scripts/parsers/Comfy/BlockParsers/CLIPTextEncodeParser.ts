export default class CLIPTextEncodeParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('class_type')) {
            delete block[key].class_type
        }

        if (block[key].hasOwnProperty('text')) {
            block[key].display_value = block[key].text
        }

        const childKeys = Object.keys(block[key])

        if (childKeys.length > 0) {
            if (!block[key].hasOwnProperty('add_info'))
                block[key].add_info = {}

            childKeys.forEach(cKey => {
                if (cKey === 'display_value')
                    return

                block[key]['add_info'][cKey] = block[key][cKey]
                delete block[key][cKey]
            })
        }
    }
}