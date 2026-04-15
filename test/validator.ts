import { expect } from 'chai';
import { Crc32Validator, BaseXEncoder, InvalidTokenError } from '../src';

describe('Crc32Validator', () => {
    const encoder = new BaseXEncoder({
        alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    });
    const validator = new Crc32Validator(encoder);

    it('has methods', () => {
        expect(validator).to.have.property('append');
        expect(validator).to.have.property('verify');
    });
    it('appends a 6-character checksum', () => {
        const result = validator.append('hello');
        expect(result).to.equal(`hello${result.slice(-6)}`);
        expect(result.slice(-6)).to.have.lengthOf(6);
    });
    it('round-trips append and verify', () => {
        const appended = validator.append('somePayload');
        const payload = validator.verify(appended);
        expect(payload).to.equal('somePayload');
    });
    it('verifies a real GitHub token body', () => {
        const body = '31p2Q4YGYWVjOxvRDRpyzHMk5Vb1pw41EK8y';
        const payload = validator.verify(body);
        expect(payload).to.equal('31p2Q4YGYWVjOxvRDRpyzHMk5Vb1pw');
    });
    it('verifies an old-format token body', () => {
        const payload = validator.verify('ZZqMrMaRd2OHnpaZPFk006KdGwE');
        // Should return re-encoded payload (without CRC bytes)
        expect(payload).to.equal('7aVvodScBkSK7FhYEES7tf');
    });
    it('throws for invalid checksum', () => {
        try {
            validator.verify('somePayloadXXXXXX');
        } catch (e) {
            expect(e).to.be.instanceOf(InvalidTokenError);
            expect(e).to.have.property('message', 'Invalid CRC32 check value');
            return;
        }
        expect.fail('expected to throw');
    });
    it('throws for body too short', () => {
        try {
            validator.verify('abcdef');
        } catch (e) {
            expect(e).to.be.instanceOf(InvalidTokenError);
            expect(e).to.have.property('message', 'Token body too short');
            return;
        }
        expect.fail('expected to throw');
    });
    it('pads checksum to 6 characters for small CRC values', () => {
        const result = validator.append('0000000000000000');
        expect(result.slice(-6)).to.have.lengthOf(6);
        const payload = validator.verify(result);
        expect(payload).to.equal('0000000000000000');
    });
});
