import { ReadableTokenGenerator, BaseXEncoder } from '../src';
import { expect } from 'chai';

const base62Encoder = new BaseXEncoder({
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
});

describe('ReadableTokenGenerator without integrity', () => {
    const tokenType = ReadableTokenGenerator({
        encoder: base62Encoder,
    });

    describe('generate()', () => {
        it('generates a token', async () => {
            const token = await tokenType.generate('test');
            expect(token).to.match(/^test_[A-Za-z0-9]+$/);
        });
        it('generates a token from a uuid', () => {
            const token = tokenType.generate('test', '00000000-0000-0000-0000-000000000000');
            expect(token).to.equal('test_0000000000000000');
        });
    });

    describe('validate()', () => {
        it('validates a token without integrity checking', () => {
            const token = tokenType.validate('test_7aVvodScBkSK7FhYEES7tf');
            expect(token).to.have.property('prefix', 'test');
            expect(token.toString()).to.equal('test_7aVvodScBkSK7FhYEES7tf');
        });
        it('round-trips a generated token', () => {
            const generated = tokenType.generate('test', '8ece30ba-b1fc-4944-8758-75b20ebc1cc7');
            const validated = tokenType.validate(generated);
            expect(validated.toString('uuid')).to.equal('8ece30ba-b1fc-4944-8758-75b20ebc1cc7');
        });
    });
});
