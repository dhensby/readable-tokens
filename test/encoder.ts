import { expect } from 'chai';
import { BaseXEncoder } from '../src';

describe('Base62Encoder', () => {
    it('has methods', () => {
        const inst = new BaseXEncoder({
            alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        });
        expect(inst).to.have.property('encode');
        expect(inst).to.have.property('decode');
    });
});
