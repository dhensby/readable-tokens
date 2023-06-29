import { rng } from '../src/util/rng';
import { expect } from 'chai';
import crypto from 'crypto';

function randomBytes(num: number, cb: (err: Error | null, buf?: Buffer) => void): void;
function randomBytes(num: number): Buffer;
function randomBytes(num: number, cb?: (err: Error | null, buf?: Buffer) => void): Buffer | void {
    if (cb) {
        cb(new Error('synthetic error'));
    } else {
        throw new Error('synthetic error');
    }
}

describe('util', () => {
    describe('mocked randomBytes', () => {
        const rb = crypto.randomBytes;
        before('mock randomBytes', () => {
            crypto.randomBytes = randomBytes;
        });
        after('restore randomBytes', () => {
            crypto.randomBytes = rb;
        });
        it('rejects when error', async () => {
            try {
                await rng(16);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                return;
            }
            expect.fail('expected to throw');
        });
    });
    describe('sync errors', () => {
        it('throws for invalid byte length', async () => {
            try {
                await rng(-1);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                return;
            }
            expect.fail('expected to throw');
        });
    });
});
