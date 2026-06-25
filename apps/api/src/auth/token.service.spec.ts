import { TokenService } from './token.service';

describe('TokenService', () => {
  const service = new TokenService();

  it('creates opaque tokens and SHA-256 digests', () => {
    const token = service.createOpaqueToken();
    const digest = service.digestToken(token);

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toBe(token);
    expect(service.secureCompareDigest(digest, service.digestToken(token))).toBe(true);
  });
});
