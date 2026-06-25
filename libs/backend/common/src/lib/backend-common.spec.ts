import { normalizeServiceName } from './backend-common';

describe('normalizeServiceName', () => {
  it('normalizes service names for backend logs and health checks', () => {
    expect(normalizeServiceName(' TES Engine API ')).toEqual('tes engine api');
  });
});
