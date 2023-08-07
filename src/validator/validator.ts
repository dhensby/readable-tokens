export interface Validator {
    check(data: Uint8Array): Uint8Array;
    generate(data: Uint8Array): Uint8Array;
}
