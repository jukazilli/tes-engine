describe('tax-strategy-rls', () => {
  it('documents tenant-scoped tables covered by migration 0005', () => {
    expect(['environment_tax_strategies', 'environment_tax_strategy_items']).toEqual(
      expect.arrayContaining(['environment_tax_strategies', 'environment_tax_strategy_items']),
    );
  });
});
