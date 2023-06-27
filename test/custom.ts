import { ReadableTokenGenerator } from '../src';
import { createHmac, timingSafeEqual } from 'crypto';
import { expect } from 'chai';

function truncatedHash(val: Uint8Array): Uint8Array {
    const hash = createHmac('sha256', 'secret').update(val).digest();
    const offset = hash[hash.length - 1] & 0x0F;
    const truncated = (hash[offset] & 0x7F) << 24 |
        (hash[offset + 1] & 0xFF) << 16 |
        (hash[offset + 2] & 0xFF) <<  8 |
        (hash[offset + 3] & 0xFF);
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(truncated);
    return buf;
}

const customTokenType = ReadableTokenGenerator({
    // encode as base64 using native buffer support
    encoder: {
        encode: (val) => Buffer.from(val).toString('base64').replace(/=+$/, ''),
        decode: (val) => Buffer.from(val, 'base64'),
    },
    // append a sha256 hmac
    integrity: {
        generate(val) {
            return Buffer.concat([val, truncatedHash(val)]);
        },
        check(val) {
            // everything up to the last 4 bytes is the raw data
            const payload = val.subarray(0, -4);
            const check = val.subarray(-4);
            if (timingSafeEqual(truncatedHash(payload), check)) {
                // all good
                return payload;
            }
            throw new Error('HMAC did not validate');
        },
    },
});

describe('custom token', () => {
    describe('generate()', () => {
        it('generates a token', async () => {
            const token = await customTokenType.generate('test');
            expect(token).to.match(/^test_[A-Za-z0-9+/]{27}$/);
        });
        it('generates a token from a uuid', () => {
            const token = customTokenType.generate('test', '00000000-0000-0000-0000-000000000000');
            expect(token).to.equal('test_AAAAAAAAAAAAAAAAAAAAAKlC6A0');
        });
        it('generates a token of arbitrary length', async () => {
            const token = await customTokenType.generate('test', 32);
            expect(token).to.match(/^test_[A-Za-z0-9+/]+$/);
        });
        it('generates a token from a buffer', () => {
            const token = customTokenType.generate('test', Buffer.from('GQI42CPM9GC'));
            expect(token).to.equal('test_R1FJNDJDUE05R0PGUq8f');
        });
        it('generates a token from encoded data', () => {
            const token = customTokenType.generate('test', '+VlfOfBCSFtOHetE0cqE1w==', 'base64');
            console.log(token);
            expect(token).to.equal('test_+VlfOfBCSFtOHetE0cqE19cbEGA');
        });
        it('errors for invalid UUID', () => {
            try {
                customTokenType.generate('test', 'not-a-uuid');
            } catch (e) {
                expect(e).to.be.instanceOf(TypeError);
                return;
            }
            expect.fail('expected to throw');
        });
    });
    describe('validate()', () => {
        it('validates a token', () => {
            const token = customTokenType.validate('test_+VlfOfBCSFtOHetE0cqE19cbEGA');
            expect(token).to.deep.equal({
                prefix: 'test',
                raw: Buffer.from('+VlfOfBCSFtOHetE0cqE1w==', 'base64'),
            });
            expect(token.toString()).to.equal('test_+VlfOfBCSFtOHetE0cqE19cbEGA');
            expect(token.toString('base64')).to.equal('+VlfOfBCSFtOHetE0cqE1w==');
        });
        it('validates a UUID based token', () => {
            const token = customTokenType.validate('test_js4wurH8SUSHWHWyDrwcx4Hr3Cc');
            expect(token.toString('uuid')).to.equal('8ece30ba-b1fc-4944-8758-75b20ebc1cc7');
        });
        it('validates the prefix', () => {
            const token = customTokenType.validate('test_js4wurH8SUSHWHWyDrwcx4Hr3Cc', 'test');
            expect(token).to.have.property('prefix', 'test');
        });
        it('throws for unexpected prefix', () => {
            try {
                customTokenType.validate('test_js4wurH8SUSHWHWyDrwcx4Hr3Cc', 'testing');
            } catch (e) {
                expect(e).to.have.property('message', 'Prefix mismatch');
                return;
            }
            expect.fail('expected to throw');
        });
    });
});
