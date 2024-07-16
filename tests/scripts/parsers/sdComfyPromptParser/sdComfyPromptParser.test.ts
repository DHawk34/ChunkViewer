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
