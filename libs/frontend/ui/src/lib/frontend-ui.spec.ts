import { frontendUiMarker } from './frontend-ui';

describe('frontendUiMarker', () => {
  it('identifies the initial UI library boundary', () => {
    expect(frontendUiMarker.library).toEqual('frontend-ui');
  });
});
