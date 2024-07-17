import fs from 'fs'
import path from 'path';
import { expect, test } from "vitest";
import { parsePrompt } from "@/scripts/parsers/sdComfyPromptParser";

test('empty_string_returns_empty_array', () => {
    const result = parsePrompt('')
    expect(result).toEqual([])
})

test('invalid_input_returns_empty_array', () => {
    const result = parsePrompt('.')
    expect(result).toEqual([])
})

test('empty_block_returns_empty_array', () => {
    // arrange
    const input_1 = JSON.stringify({
        "1": {
            "class_type": "EmptyBlock"
        }
    })

    const input_2 = JSON.stringify({
        "1": {}
    })

    // act
    const result_1 = parsePrompt(input_1)
    const result_2 = parsePrompt(input_2)

    // assert
    expect(result_1).toEqual([])
    expect(result_2).toEqual([])
})

test('invalid_block_id_returns_undefined', () => {
    // arrange
    const input = JSON.stringify({
        "2": {
            "inputs": {
                "someValue": 100,
                "link": [
                    "999",
                    0
                ]
            },
            "class_type": "TestBlock"
        }
    })

    const expected = [{
        id: '2',
        name: 'TestBlock',
        value: {
            someValue: 100,
            link: undefined
        }
    }]

    // act
    const result = parsePrompt(input)

    // assert
    expect(result).toEqual(expected)
})

test('tree_simplify_works_as_expected', () => {
    // arrange
    const input = JSON.stringify({
        "2": {
            "inputs": {
                "someValue": 100,
                "parent": {
                    "child": "111"
                },
                "first": {
                    "second": {
                        "third": "222"
                    }
                },
                "first2": {
                    "second2": {
                        "third2": "333"
                    },
                    "second3": 100
                }
            },
            "class_type": "TestBlock"
        }
    })

    const expected = [{
        id: '2',
        name: 'TestBlock',
        value: {
            someValue: 100,
            'parent/child': '111',
            'first/second/third': '222',
            'first2': {
                'second2/third2': '333',
                'second3': 100
            }
        }
    }]

    // act
    const result = parsePrompt(input)

    // assert
    expect(result).toEqual(expected)
})

test('tree_simplify_with_block_ids_works_as_expected', () => {
    // arrange
    const input = JSON.stringify({
        "1": {
            "inputs": {
                "first": 100,
            },
            "class_type": "TestBlock"
        },
        "2": {
            "inputs": {
                "second": 100,
                "link": [
                    "1",
                    0
                ]
            },
            "class_type": "TestBlock"
        }
    })

    const expected = [{
        id: '2',
        name: 'TestBlock',
        value: {
            second: 100,
            'link/first': 100
        }
    }]

    // act
    const result = parsePrompt(input)

    // assert
    expect(result).toEqual(expected)
})

test('test_1_returns_expected', () => {
    // arrange
    const input = readFile('input_1.json')
    const expected = JSON.parse(readFile('output_1.json'))

    // act
    const result = parsePrompt(input)

    // assert
    expect(result).toEqual(expected)
})



function readFile(filename: string): string {
    return fs.readFileSync(path.resolve(__dirname, filename), 'utf-8')
}
