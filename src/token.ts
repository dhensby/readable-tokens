import { rng } from './util/rng';
import { parse as parseUuid, stringify as formatUuid } from 'uuid';
import { InvalidTokenError } from './error';
import { Encoder } from './encoder';
import { Validator } from './validator';

export interface Token {
    prefix: string;
    raw: Uint8Array;
    toString(encoding?: BufferEncoding | 'uuid'): string;
}

export interface TokenGenerator {
    /**
     * Generate a token from an encoded string
     *
     * @param {string} prefix The token prefix to use
     * @param {string} data The data to create a token from
     * @param {BufferEncoding | 'uuid'} encoding The data encoding
     * @returns Promise<string>
     */
    generate(prefix: string, data: string, encoding: BufferEncoding | 'uuid'): string;

    /**
     * Create a token from a raw Uint8Array
     *
     * @param {string} prefix The token prefix to use
     * @param {Uint8Array} raw The raw data to encode
     * @returns Promise<string> The encoded token
     */
    generate(prefix: string, raw: Uint8Array): string;

    /**
     * Generate a token from a UUID
     *
     * This can be useful if your system runs off of UUIDs, but you want to
     * use tokens in the "public domain".
     *
     * @param {string} prefix The token prefix to use
     * @param {string} uuid The UUID to create a token from
     * @returns Promise<string>
     */
    generate(prefix: string, uuid: string): string;

    /**
     * Generate a random token of given byte length
     *
     * @param {string} prefix The token prefix to use
     * @param {number} byteLength
     * @returns Promise<string>
     */
    generate(prefix: string, byteLength: number): Promise<string>;

    /**
     * Generate a random token
     *
     * @param {string} prefix The token prefix to use
     * @returns Promise<string>
     */
    generate(prefix: string): Promise<string>;
    validate(token: string, prefix?: string): Token;
}

export interface TokenOpts {
    encoder: Encoder;
    integrity: Validator;
    prng?: typeof rng;
}

function generate(prefix: string, byteLength: number): Promise<string>;
function generate(prefix: string, data: string, encoding: BufferEncoding): string;
function generate(prefix: string, uuid: string): string;
function generate(prefix: string, raw: Uint8Array): string;
function generate(prefix: string): Promise<string>;
function generate(this: { prng: typeof rng, format: (prefix: string, val: Uint8Array) => string }, prefix: string, seed?: Uint8Array | number | string, encoding?: BufferEncoding | 'uuid'): string | Promise<string> {
    let payload = seed;
    // no seed, or seed length supplied
    if (typeof payload === 'number' || typeof payload === 'undefined') {
        return Promise.resolve(this.prng(payload ?? 16)).then((rand) => this.format(prefix, rand));
    }
    // a string (assume UUID) supplied
    if (typeof payload === 'string') {
        if (!encoding || encoding === 'uuid') {
            payload = parseUuid(payload);
        } else {
            payload = Buffer.from(payload, encoding);
        }
    }
    return this.format(prefix, payload);
}

export function ReadableTokenGenerator({ encoder, integrity, prng }: TokenOpts): TokenGenerator {
    const formatToken = (prefix: string, data: Uint8Array) => {
        return `${prefix}_${encoder.encode(integrity.generate(data))}`;
    };
    return {
        generate: generate.bind({ prng: prng ?? rng, format: formatToken }),
        validate(token: string, expectedPrefix?: string): Token {
            const parts = token.split('_');
            if (parts.length <= 1) {
                throw new InvalidTokenError('Malformed token');
            }
            const raw = integrity.check(encoder.decode(parts.pop() as string));
            const prefix = parts.join('_');
            if (expectedPrefix && expectedPrefix !== prefix) {
                throw new InvalidTokenError('Prefix mismatch');
            }
            const t: Token = {
                prefix,
                raw,
            };
            Object.defineProperty(t, 'toString', {
                value: (encoding?: BufferEncoding | 'uuid') => {
                    if (!encoding) {
                        return formatToken(prefix, raw);
                    }
                    if (encoding === 'uuid') {
                        return formatUuid(raw);
                    }
                    return Buffer.from(raw).toString(encoding);
                },
            });
            return t;
        },
    };
}
