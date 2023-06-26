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

```js
const { createHmac } = require('crypto');
const { ReadableTokenGenerator } = require('readable-tokens');

const customTokenType = new ReadableTokenGenerator({
    // encode as base64 using native buffer support
    encoder: {
        encode: (val) => Buffer.from(val).toString('base64').replace(/=+$/, ''),
        decode: (val) => Buffer.from(val, 'base64'),
    },
    // append a sha256 hmac
    integrity: {
        generate(val) {
            return Buffer.concat([val, createHmac('sha256', 'secret').update(val).digest()]);
        },
        check(val) {
            // everything up to the last 32 bytes is the raw data
            const payload = val.subarray(0, -32);
            const hmac = val.subarray(-32);
            if (createHmac('sha256', 'secret').update(payload).digest().equals(hmac)) {
                // all good
                return payload;
            }
            throw new Error('HMAC did not validate');
        },
    },
});
```
