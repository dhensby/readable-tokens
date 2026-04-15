export interface Validator {
    append(encoded: string): string;
    verify(encoded: string): string;
}
