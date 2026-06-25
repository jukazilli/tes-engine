import { frontendShellMarker } from './frontend-shell';

describe('frontendShellMarker', () => {
  it('identifies the initial shell library boundary', () => {
    expect(frontendShellMarker.library).toEqual('frontend-shell');
  });
});
