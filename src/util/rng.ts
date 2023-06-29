import { randomBytes } from 'crypto';

export async function rng(length: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            randomBytes(length, (err, buf) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buf);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}
