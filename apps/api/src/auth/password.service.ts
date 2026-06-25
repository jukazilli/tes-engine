import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65_536,
  timeCost: 3,
  parallelism: 1,
} as const;

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    this.assertPolicy(password);
    return await argon2.hash(password, ARGON2_OPTIONS);
  }

  async verify(password: string, encodedHash: string): Promise<boolean> {
    if (password.length > PASSWORD_MAX_LENGTH || !encodedHash.startsWith('$argon2id$')) {
      return false;
    }

    return await argon2.verify(encodedHash, password);
  }

  assertPolicy(password: string): void {
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      throw new Error(
        `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
      );
    }
  }
}
