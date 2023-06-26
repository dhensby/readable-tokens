import { Crc32Validator } from './validator';
import { Base62Encoder } from './encoder';
import * as Token from './token';

const Crc32Token = Token.ReadableTokenGenerator({
    integrity: Crc32Validator,
    encoder: Base62Encoder,
});

const ReadableToken = Token.ReadableTokenGenerator({
    integrity: {
        check: (data: Uint8Array) => data,
        generate: (data: Uint8Array) => data,
    },
    encoder: Base62Encoder,
});

export {
    Crc32Validator,
    Base62Encoder,
    ReadableToken,
    Crc32Token,
};

export * from './token';
