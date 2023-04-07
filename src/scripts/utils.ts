const PNG_HEADER_BYTES = [137, 80, 78, 71, 13, 10, 26, 10];
const PNG_HEADER_STRING: string = '�PNG\r\n\n';

export default {
    isPng, concatUInt8Arrays, bytes2UInt32BigEndian, uint32BigEndianToBytes
}



export function isPng(data: Uint8Array | String) : boolean {
    if (data instanceof Uint8Array) {
        return isPng_bytes(data);
    }

    if (data instanceof String) {
        return isPng_string(data);
    }

    return false;
}

function isPng_bytes(data: Uint8Array) : boolean {
    for (let i = 0; i < 8; i++) {
        if (data[i] != PNG_HEADER_BYTES[i]) {
            return false;
        }
    }
    return true;
}

function isPng_string(data: String) : boolean {
    for (let i = 0; i < 8; i++) {
        if (data[i] != PNG_HEADER_STRING[i]) {
            return false;
        }
    }
    return true;
}

export function concatUInt8Arrays(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
    let out = new Uint8Array(arr1.length + arr2.length);
    out.set(arr1);
    out.set(arr2, arr1.length);
    return out;
}

export function bytes2UInt32BigEndian(bytes: Uint8Array, offset: number): number {
    return (
        (bytes[offset + 3]) |
        (bytes[offset + 2] << 8) |
        (bytes[offset + 1] << 16) |
        (bytes[offset] << 24)
    ) >>> 0;
}

export function uint32BigEndianToBytes(number: number): Uint8Array {
    return new Uint8Array([
        number >>> 24,
        number >>> 16,
        number >>> 8,
        number,
    ]);
}

export function getSubArrayIndex(parentArr: Uint8Array, subArr: Uint8Array): number {
    let found = false;

    for (let i = 0, checkLength = parentArr.length - subArr.length; i <= checkLength; i++) {
        if (parentArr[i] == subArr[0]) {
            for (let j = 1; j < subArr.length; j++) {
                if (parentArr[i + j] != subArr[j]) {
                    found = false;
                    break;
                } else {
                    found = true;
                }
            }
        }
        if (found) {
            return i;
        }
    }
    return -1;
}
