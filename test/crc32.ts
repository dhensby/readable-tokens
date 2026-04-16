import { InvalidTokenError, Crc32Token } from '../src/';
import { expect } from 'chai';

describe('crc32 token', () => {
    describe('generate()', () => {
        it('generates a token', async () => {
            const token = await Crc32Token.generate('test');
            expect(token).to.match(/^test_[A-Za-z0-9]+$/);
        });
        it('generates a token from a uuid', () => {
            const token = Crc32Token.generate('test', '00000000-0000-0000-0000-000000000000');
            expect(token).to.equal('test_00000000000000002xwBRE');
        });
        it('generates a token of arbitrary length', async () => {
            const token = await Crc32Token.generate('test', 32);
            expect(token).to.match(/^test_[A-Za-z0-9]+$/);
        });
        it('generates a token from a buffer', () => {
            const token = Crc32Token.generate('test', Buffer.from('GQI42CPM9GC'));
            expect(token).to.equal('test_6x1dkcr9RRltaZX17ugkk');
        });
        it('generates a token from encoded data', () => {
            const token = Crc32Token.generate('test', '+VlfOfBCSFtOHetE0cqE1w==', 'base64');
            expect(token).to.equal('test_7aVvodScBkSK7FhYEES7tf3QG8Wp');
        });
        it('errors for invalid UUID', () => {
            try {
                Crc32Token.generate('test', 'not-a-uuid');
            } catch (e) {
                expect(e).to.be.instanceOf(TypeError);
                return;
            }
            expect.fail('expected to throw');
        });
    });
    describe('validate()', () => {
        it('validates a new-format token', () => {
            const token = Crc32Token.validate('test_7aVvodScBkSK7FhYEES7tf3QG8Wp');
            expect(token).to.deep.equal({
                prefix: 'test',
                raw: Buffer.from('+VlfOfBCSFtOHetE0cqE1w==', 'base64'),
            });
            expect(token.toString()).to.equal('test_7aVvodScBkSK7FhYEES7tf3QG8Wp');
            expect(token.toString('base64')).to.equal('+VlfOfBCSFtOHetE0cqE1w==');
        });
        it('validates a new-format UUID based token', () => {
            const token = Crc32Token.validate('test_4LT8ewoFYhhUGOo3VNcKxD1AiVPO');
            expect(token.toString('uuid')).to.equal('8ece30ba-b1fc-4944-8758-75b20ebc1cc7');
        });
        it('validates a real GitHub token', () => {
            const token = Crc32Token.validate('gh_31p2Q4YGYWVjOxvRDRpyzHMk5Vb1pw41EK8y');
            expect(token).to.have.property('prefix', 'gh');
        });
        it('validates the prefix', () => {
            const token = Crc32Token.validate('test_4LT8ewoFYhhUGOo3VNcKxD1AiVPO', 'test');
            expect(token).to.have.property('prefix', 'test');
        });
        it('throws for unexpected prefix', () => {
            try {
                Crc32Token.validate('test_4LT8ewoFYhhUGOo3VNcKxD1AiVPO', 'testing');
            } catch (e) {
                expect(e).to.be.instanceOf(InvalidTokenError);
                expect(e).to.have.property('message', 'Prefix mismatch');
                return;
            }
            expect.fail('expected to throw');
        });
        it('throws for missing prefix', () => {
            try {
                Crc32Token.validate('4LT8ewoFYhhUGOo3VNcKxD1AiVPO');
            } catch (e) {
                expect(e).to.be.instanceOf(InvalidTokenError);
                expect(e).to.have.property('message', 'Malformed token');
                return;
            }
            expect.fail('expected to throw');
        });
        it('throws for bad CRC value', () => {
            try {
                Crc32Token.validate('test_4LT8ewoFYhhUGOo3VNcKxD1AiVPX');
            } catch (e) {
                expect(e).to.be.instanceOf(InvalidTokenError);
                expect(e).to.have.property('message', 'Invalid CRC32 check value');
                return;
            }
            expect.fail('expected to throw');
        });
        it('throws for token body too short', () => {
            try {
                Crc32Token.validate('test_abc');
            } catch (e) {
                expect(e).to.be.instanceOf(InvalidTokenError);
                expect(e).to.have.property('message', 'Token body too short');
                return;
            }
            expect.fail('expected to throw');
        });
    });
    describe('backwards compatibility', () => {
        it('validates an old-format token', () => {
            const token = Crc32Token.validate('test_ZZqMrMaRd2OHnpaZPFk006KdGwE');
            expect(token).to.deep.equal({
                prefix: 'test',
                raw: Buffer.from('+VlfOfBCSFtOHetE0cqE1w==', 'base64'),
            });
            expect(token.toString('base64')).to.equal('+VlfOfBCSFtOHetE0cqE1w==');
        });
        it('validates an old-format UUID based token', () => {
            const token = Crc32Token.validate('test_KNJYokHOindxbwRAd4MRNhPA6a5');
            expect(token.toString('uuid')).to.equal('8ece30ba-b1fc-4944-8758-75b20ebc1cc7');
        });
        it('re-encodes old-format tokens in new format via toString()', () => {
            const token = Crc32Token.validate('test_ZZqMrMaRd2OHnpaZPFk006KdGwE');
            expect(token.toString()).to.equal('test_7aVvodScBkSK7FhYEES7tf3QG8Wp');
        });
    });
});
