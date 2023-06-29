import { expect } from 'chai';
import { Base62Encoder } from '../src';

describe('Base62Encoder', () => {
    it('has methods', () => {
        expect(Base62Encoder).to.have.property('encode');
        expect(Base62Encoder).to.have.property('decode');
    });
});
