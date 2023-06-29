import { InvalidTokenError, ReadableToken } from '../src/';
import { expect } from 'chai';

describe('readable token', () => {
    describe('generate()', () => {
        it('generates a token', async () => {
            const token = await ReadableToken.generate('test');
            expect(token).to.match(/^test_[A-Za-z0-9]{21,22}$/);
        });
        it('generates a token from a uuid', () => {
            const token = ReadableToken.generate('test', '00000000-0000-0000-0000-000000000000');
            expect(token).to.equal('test_0000000000000000');
        });
        it('generates a token of arbitrary length', async () => {
            const token = await ReadableToken.generate('test', 32);
            expect(token).to.match(/^test_[A-Za-z0-9]+$/);
        });
        it('generates a token from a buffer', () => {
            const token = ReadableToken.generate('test', Buffer.from('GQI42CPM9GC'));
            expect(token).to.equal('test_6x1dkcr9RRltaZX');
        });
        it('generates a token from encoded data', () => {
            const token = ReadableToken.generate('test', '+VlfOfBCSFtOHetE0cqE1w==', 'base64');
            expect(token).to.match(/^test_[A-Za-z0-9]{22}$/);
        });
        it('errors for invalid UUID', () => {
            try {
                ReadableToken.generate('test', 'not-a-uuid');
            } catch (e) {
                expect(e).to.be.instanceOf(TypeError);
                return;
            }
            expect.fail('expected to throw');
        });
    });
    describe('validate()', () => {
        it('validates a token', () => {
            const token = ReadableToken.validate('test_7aVvodScBkSK7FhYEES7tf');
            expect(token).to.deep.equal({
                prefix: 'test',
                raw: Buffer.from('+VlfOfBCSFtOHetE0cqE1w==', 'base64'),
            });
            expect(token.toString()).to.equal('test_7aVvodScBkSK7FhYEES7tf');
            expect(token.toString('base64')).to.equal('+VlfOfBCSFtOHetE0cqE1w==');
        });
        it('validates a UUID based token', () => {
            const token = ReadableToken.validate('test_KNJYokHOindxbwRAd4MRNhPA6a5');
            expect(token.toString('uuid')).to.equal('8ece30ba-b1fc-4944-8758-75b20ebc1cc7');
        });
        it('validates the prefix', () => {
            const token = ReadableToken.validate('test_KNJYokHOindxbwRAd4MRNhPA6a5', 'test');
            expect(token).to.have.property('prefix', 'test');
        });
        it('throws for unexpected prefix', () => {
            try {
                ReadableToken.validate('test_KNJYokHOindxbwRAd4MRNhPA6a5', 'testing');
            } catch (e) {
                expect(e).to.be.instanceOf(InvalidTokenError);
                expect(e).to.have.property('message', 'Prefix mismatch');
                return;
            }
            expect.fail('expected to throw');
        });
    });
});
