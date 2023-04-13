const NEGATIVE_PROMPT_TEXT = 'Negative prompt: ';
const STEPS_TEXT = 'Steps: ';

export interface Parameters {
    [key: string]: string
}

export function parseParameters(parameters: string): Parameters | string {
    const backUp = parameters;
    let result: Parameters = {};
    parameters = parameters.replaceAll('\n', ''); // regex: replace(/\n/g, "")

    if (parameters.length == 0) {
        return backUp;
    }

    // Get positive & negative prompt
    retreivePosNegPrompt();

    // Get other parameters
    let params = parameters.split(', ');
    params[0] = STEPS_TEXT + params[0]; // Возвращаем на место "Steps: "

    for (let i = 0; i < params.length; i++) {
        let out = params[i].split(': ');
        let name = out[0];
        result[name] = out[1] ?? '';
    }

    return result;

    

    // local functions
    function retreivePosNegPrompt() {
        let positive = '';
        let negative = '';
    
        let out = parameters.split(STEPS_TEXT);
        let posNeg = out[0];
        parameters = out[1] ?? '';
    
        if (posNeg.includes(NEGATIVE_PROMPT_TEXT)) {
            out = posNeg.split(NEGATIVE_PROMPT_TEXT);
            positive = out[0];
            negative = out[1] ?? '';
        }
        else {
            positive = posNeg;
            negative = '';
        }
    
        result['positive'] = positive;
        result['negative'] = negative;
    }
}

// toString ?