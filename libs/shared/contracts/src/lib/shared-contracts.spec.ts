import { HealthResponse } from './shared-contracts';

describe('HealthResponse', () => {
  it('represents the health check contract', () => {
    const response: HealthResponse = {
      status: 'ok',
      service: 'tes-engine-api',
    };

    expect(response.status).toEqual('ok');
  });
});
