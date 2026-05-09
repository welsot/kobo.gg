export const updateNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  target[lastKey] = value;
  return { ...obj };
};

export function alertError(err: any) {
  alert('An error occurred: ' + JSON.stringify(err));
}

export const toInt = (val: any, defVal = 0): number => {
  if (typeof val === 'number') {
    return val;
  }

  if (typeof val === 'string') {
    return parseInt(val, 10);
  }

  if (val === null) {
    return defVal;
  }

  console.warn('toInt: invalid value', val);
  return defVal;
};

export const toStrOrNull = (val: any): string | null => {
  if (typeof val === 'string') {
    return val.trim() || null;
  }

  if (val === null) {
    return null;
  }

  console.warn('toStrOrNull: invalid value', val);
  return null;
};
