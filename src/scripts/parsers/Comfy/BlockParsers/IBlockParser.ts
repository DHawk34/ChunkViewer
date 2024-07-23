interface IBlockParser {
    parseBlock(block: { [key: string]: any }, key: string): void
}