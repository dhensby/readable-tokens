import base, { BaseConverter } from 'base-x';
import { Encoder } from './encoder';

export interface BaseXEncoderOpts {
    alphabet: string;
}

export class BaseXEncoder implements Encoder {
    private readonly encoder: BaseConverter;
    constructor(opts: BaseXEncoderOpts) {
        this.encoder = base(opts.alphabet);
    }

    encode(data: Uint8Array): string {
        return this.encoder.encode(data);
    }

    decode(data: string): Uint8Array {
        return this.encoder.decode(data);
    }
}
