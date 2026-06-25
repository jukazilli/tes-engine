import { getEngineCoreInfo } from './engine-core';

describe('getEngineCoreInfo', () => {
  it('exposes a framework independent marker', () => {
    expect(getEngineCoreInfo()).toEqual({
      name: 'tes-engine-core',
      frameworkIndependent: true,
    });
  });
});
