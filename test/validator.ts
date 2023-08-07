import { expect } from 'chai';
import { Crc32Validator } from '../src';

describe('Crc32Validator', () => {
    it('has methods', () => {
        const inst = new Crc32Validator();
        expect(inst).to.have.property('check');
        expect(inst).to.have.property('generate');
    });
});
