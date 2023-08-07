import { Crc32Validator } from './validator';
import { BaseXEncoder } from './encoder';
import * as Token from './token';

const base62Encoder = new BaseXEncoder({
    // base62 alphabet by default noted: https://en.wikipedia.org/wiki/Base62
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
});

const crc32Validator = new Crc32Validator();

const Crc32Token = Token.ReadableTokenGenerator({
    integrity: crc32Validator,
    encoder: base62Encoder,
});

const ReadableToken = Token.ReadableTokenGenerator({
    integrity: {
        check: (data: Uint8Array) => data,
        generate: (data: Uint8Array) => data,
    },
    encoder: base62Encoder,
});

export {
    Crc32Token,
    ReadableToken,
};

export * from './validator';
export * from './encoder';
export * from './token';
export * from './error';
