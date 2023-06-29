import { expect } from 'chai';
import { Crc32Validator } from '../src';

describe('Crc32Validator', () => {
    it('has methods', () => {
        expect(Crc32Validator).to.have.property('check');
        expect(Crc32Validator).to.have.property('generate');
    });
});
