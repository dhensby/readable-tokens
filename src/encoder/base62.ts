import base from 'base-x';

// base62 alphabet as noted: https://en.wikipedia.org/wiki/Base62
const { encode, decode } = base('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

export { encode, decode };
