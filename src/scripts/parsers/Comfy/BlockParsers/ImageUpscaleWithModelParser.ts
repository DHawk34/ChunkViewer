export default class ImageUpscaleWithModelParser implements IBlockParser {

    parseBlock(block: { [key: string]: any }, key: string): void {
        
        if (block[key].hasOwnProperty('class_type')) {
            delete block[key].class_type
        }

        const newKey = 'image_before_upscale'
        block[newKey] = {}

        if (block[key].hasOwnProperty('width') && block[key].hasOwnProperty('height')) {
            block[newKey].display_value = `${block[key].width} x ${block[key].height}`
        }

        if(block[key].hasOwnProperty('upscale_model')){
            block.upscale_model = block[key].upscale_model
            delete block[key].upscale_model
        }

        const childKeys = Object.keys(block[key])

        if (childKeys.length > 0) {
            if (!block[key].hasOwnProperty('add_info'))
                block[newKey].add_info = {}

            childKeys.forEach(cKey => {
                if (cKey === 'display_value')
                    return

                block[newKey]['add_info'][cKey] = block[key][cKey]
            })
        }

        delete block[key]
    }
}