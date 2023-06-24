const crcTable: number[] = [];

for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
        if (c & 1) {
            c = 0xedb88320 ^ (c >>> 1);
        } else {
            c = c >>> 1;
        }
    }
    crcTable[i] = c;
}



const initialCrc = 0xffffffff;

// startIndex is inclusive, endIndex is exclusive
function updateCrc(data: Uint8Array, start: number, end: number): number {
    let c = initialCrc;
    for (let i = start; i < end; i++) {
        c = crcTable[(c ^ data[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ initialCrc) >>> 0;
}

export function getCrc(data: Uint8Array, startIndex: number = 0, lenght?: number): number {
    const endIndexExclusive = lenght ? lenght + startIndex : data.length;
    return updateCrc(data, startIndex, endIndexExclusive);
}
