import { buf } from 'crc-32';
import { timingSafeEqual } from 'crypto';
import { InvalidTokenError } from '../error';
import { Validator } from './validator';

function calculateCrc32(val: Uint8Array): Buffer {
    const crc32 = Buffer.allocUnsafe(4);
    crc32.writeInt32LE(buf(val));
    return crc32;
}

export class Crc32Validator implements Validator {
    /**
     * Calculates the CRC32 check value for a given buffer
     *
     * @param {Buffer} val
     * @returns {Buffer}
     */
    generate(val: Uint8Array): Uint8Array {
        return Buffer.concat([val, calculateCrc32(val)]);
    }

    /**
     * Validates the CRC32 check value for given input
     *
     * @param {Uint8Array} val The value to check
     * @returns Uint8Array
     */
    check(val: Uint8Array): Uint8Array {
        const data = val.subarray(0, -4);
        const crc32 = val.subarray(-4);
        if (!timingSafeEqual(crc32, calculateCrc32(data))) {
            throw new InvalidTokenError('Invalid CRC32 check value');
        }
        return data;
    }
}
