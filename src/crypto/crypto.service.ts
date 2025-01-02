import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  randomBytes,
} from 'crypto';

export type CipherTypes = 'aes-256-cbc' | 'aes-192-cbc' | 'aes-128-cbc';

@Injectable()
export class CryptoService {
  encrypt(
    data: string,
    passphrase: string,
    options?: {
      alg: CipherTypes;
    },
  ): string {
    const iv = randomBytes(16);
    const [key, salt] = this.createKeyFromPassphrase(passphrase, options);
    const cipher = createCipheriv(options?.alg ?? 'aes-256-cbc', key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([salt, encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(
    data: string,
    passphrase: string,
    options?: {
      alg: CipherTypes;
    },
  ): string {
    const [iv, encrypted] = data
      .split(':')
      .map((part) => Buffer.from(part, 'hex'));

    const salt = encrypted.subarray(0, 16);
    const [key] = this.createKeyFromPassphrase(passphrase, {
      ...options,
      salt,
    });
    const content = encrypted.subarray(16);
    const decipher = createDecipheriv(options?.alg ?? 'aes-256-cbc', key, iv);
    let decrypted = decipher.update(content);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  private createKeyFromPassphrase(
    passphrase: string,
    options?: {
      alg: CipherTypes;
      salt?: Buffer;
    },
  ): [Buffer, Buffer] {
    const sizeMapping = {
      'aes-256-cbc': 32,
      'aes-192-cbc': 24,
      'aes-128-cbc': 16,
    };

    const keySize = sizeMapping[options?.alg ?? 'aes-256-cbc'];
    const salt = options?.salt ?? randomBytes(16);
    return [pbkdf2Sync(passphrase, salt, 1000, keySize, 'sha256'), salt];
  }
}
