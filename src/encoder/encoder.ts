export interface Encoder {
    encode(data: Uint8Array): string;
    decode(data: string): Uint8Array;
}
