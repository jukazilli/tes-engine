import { createTestLabel } from './shared-testing';

describe('createTestLabel', () => {
  it('creates deterministic test labels', () => {
    expect(createTestLabel('api')).toEqual('test:api');
  });
});
