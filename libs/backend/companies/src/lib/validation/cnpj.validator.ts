export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeCnpj(value: string): string {
  return onlyDigits(value);
}

export function normalizeCnpjRoot(value: string): string {
  return onlyDigits(value);
}

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calc = (length: number): number => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = cnpj
      .slice(0, length)
      .split('')
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

export function assertCnpjRoot(value: string): string {
  const root = normalizeCnpjRoot(value);
  if (!/^\d{8}$/.test(root)) {
    throw new Error('INVALID_CNPJ_ROOT');
  }
  return root;
}

export function isValidPostalCode(value: string): boolean {
  return /^\d{8}$/.test(onlyDigits(value));
}

export function isValidStateCode(value: string): boolean {
  return /^[A-Z]{2}$/.test(value);
}

export function isValidMunicipalityCode(value?: string | null): boolean {
  return value == null || value === '' || /^\d{7}$/.test(value);
}
