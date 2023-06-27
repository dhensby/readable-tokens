# Readable Tokens

Inspired by [GitHub Tokens](https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats/), and 
[Stripe](https://dev.to/stripe/designing-apis-for-humans-object-ids-3o5a), this library allows the ability to create
random tokens that are "readable" by humans as well as verifiable.

## Usage

### Creating a random token

By default, the generate function will take a single argument representing the prefix of the token. A formatted token
is then returned.

```js
const { Crc32Token } = require('readable-tokens');

// generate a token
const token = await Crc32Token.generate('prefix'); // prefix_xxxxxxx
```

### Creating a token from a UUID

Often our applications will use UUIDs internally to identify objects in databases. This library can be used to represent
a UUID as a readable and verifiable token:

```js
const { Crc32Token } = require('readable-tokens');

const token = await Crc32Token.generate('prefix', '8ece30ba-b1fc-4944-8758-75b20ebc1cc7'); // test_KNJYokHOindxbwRAd4MRNhPA6a5
```

NB: It's important to note that this library isn't hiding or making the UUID a secret, it's just a different format to
represent the data that is encoded in a UUID.


## Token Types

There are two types of tokens available in the library by default. A "plain" `ReadableToken`, which has no integrity
checking, which means it is faster to generate, but at the trade-off that there is no ability to check the integrity of
tokens without hitting a database or token store. This could be something worth thinking about when you're thinking of 
trying to reject tokens [at the edge](https://en.wikipedia.org/wiki/Edge_computing), or when you want to be able to use
efficient [secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning).

As inspired by GitHub tokens, and to provide a way to be able to do some quick offline validation of tokens, there is
the `Crc32Token`, which integrates a [CRC32 check value](https://en.wikipedia.org/wiki/Cyclic_redundancy_check) into the
token value.

The token encoding is inspired by the GitHub tokens; they have a prefix, and then arbitrary binary data that is then
encoded in [base62](https://en.wikipedia.org/wiki/Base62), for a better developer experience (easy copy & paste).

### Custom tokens

The library allows you to provide your own encoder if you wish to use a different encoding scheme or alphabet. There is
also the ability to provide your own integrity checking logic if you don't want to use CRC32. 

Here is an example of a token that uses a truncated HMAC for integrity checking and native Base64 for encoding:

```js
const { createHmac, timingSafeEqual } = require('crypto');
const { ReadableTokenGenerator } = require('readable-tokens');

function truncatedHash(val) {
    const hash = createHmac('sha256', 'secret').update(val).digest();
    const offset = hash[hash.length - 1] & 0x0F;
    const truncated = (hash[offset] & 0x7F) << 24 |
        (hash[offset + 1] & 0xFF) << 16 |
        (hash[offset + 2] & 0xFF) <<  8 |
        (hash[offset + 3] & 0xFF);
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(truncated);
    return buf;
}

const customTokenType = new ReadableTokenGenerator({
    // encode as base64 using native buffer support
    encoder: {
        encode: (val) => Buffer.from(val).toString('base64').replace(/=+$/, ''),
        decode: (val) => Buffer.from(val, 'base64'),
    },
    integrity: {
        generate(val) {
            return Buffer.concat([val, truncatedHash(val)]);
        },
        check(val) {
            // everything up to the last 4 bytes is the raw data
            const payload = val.subarray(0, -4);
            const check = val.subarray(-4);
            if (timingSafeEqual(truncatedHash(val), check)) {
                // all good
                return payload;
            }
            throw new Error('HMAC did not validate');
        },
    },
});
```
