const crcTable: number[] = [];

for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
        if (c & 1) {
            c = 0xedb88320 ^ (c >>> 1);
        } else {
            c = c >>> 1;
        }
    }
    crcTable[n] = c;
}



function updateCrc(data: Uint8Array, length: number): number {
    let c = 0xffffffff;
    for (let n = 0; n < length; n++) {
        c = crcTable[(c ^ data[n]) & 0xff] ^ (c >>> 8);
    }
    return c ^ 0xffffffff;
}

export function getCrc(data: Uint8Array, length: number): number {
    return updateCrc(data, length) >>> 0;
}
