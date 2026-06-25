import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and verifies passwords using Argon2id', async () => {
    const hash = await service.hash('Senha-forte-123');

    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(service.verify('Senha-forte-123', hash)).resolves.toBe(true);
    await expect(service.verify('senha-errada-123', hash)).resolves.toBe(false);
  });

  it('rejects passwords outside the accepted length range', async () => {
    await expect(service.hash('curta')).rejects.toThrow(/between 12 and 128/);
  });
});
