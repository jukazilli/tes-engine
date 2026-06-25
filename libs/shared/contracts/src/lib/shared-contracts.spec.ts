import { HealthResponse, toPoSelectOptions } from './shared-contracts';

describe('HealthResponse', () => {
  it('represents the health check contract', () => {
    const response: HealthResponse = {
      status: 'ok',
      service: 'tes-engine-api',
      version: '0.1.0',
      environment: 'test',
      timestamp: '2026-01-01T00:00:00.000Z',
      uptimeSeconds: 1,
    };

    expect(response.status).toEqual('ok');
  });

  it('adapts reference options to PO UI without using labels as values', () => {
    expect(toPoSelectOptions([{ code: 'LUCRO_REAL', label: 'Lucro Real', active: true }])).toEqual([
      { label: 'Lucro Real', value: 'LUCRO_REAL' },
    ]);
  });
});
