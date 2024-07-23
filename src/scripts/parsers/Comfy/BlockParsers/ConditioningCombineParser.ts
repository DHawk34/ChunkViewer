export default class ConditioningCombineParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {

        if (block[key].hasOwnProperty('conditioning_1') && block[key].hasOwnProperty('conditioning_2') &&
            block[key].conditioning_1.hasOwnProperty('display_value') && block[key].conditioning_2.hasOwnProperty('display_value')) {

            block[key].display_value = block[key].conditioning_1.display_value + block[key].conditioning_2.display_value

            if (!block[key].hasOwnProperty('add_info'))
                block[key].add_info = {}

            block[key].add_info.conditioning_1 = block[key].conditioning_1
            block[key].add_info.conditioning_2 = block[key].conditioning_2
            delete block[key].conditioning_1
            delete block[key].conditioning_2
        }

        if (block[key].hasOwnProperty('class_type')) {
            delete block[key].class_type
        }
    }
}