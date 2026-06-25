import { EntityId } from './shared-domain-types';

describe('EntityId', () => {
  it('represents a generic entity identifier', () => {
    const id: EntityId = 'entity-1';

    expect(id).toEqual('entity-1');
  });
});
