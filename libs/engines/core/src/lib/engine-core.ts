export interface EngineCoreInfo {
  readonly name: 'tes-engine-core';
  readonly frameworkIndependent: true;
}

export function getEngineCoreInfo(): EngineCoreInfo {
  return {
    name: 'tes-engine-core',
    frameworkIndependent: true,
  };
}
