export class InvalidTenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTenantContextError';
  }
}
