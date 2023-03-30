const PNG_HEADER_BYTES = [137, 80, 78, 71, 13, 10, 26, 10];
const PNG_HEADER_STRING: string = '�PNG\r\n\n';

export default {
    isPng, bytes2UInt32BigEndian
}

export {
    isPng, bytes2UInt32BigEndian
}



function isPng(data: Uint8Array | String) : boolean {
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

function bytes2UInt32BigEndian(bytes: Uint8Array, index: number) {
    return (
        (bytes[index + 3]) |
        (bytes[index + 2] << 8) |
        (bytes[index + 1] << 16) |
        (bytes[index] << 24)
    );
}