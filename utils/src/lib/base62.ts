const CHARSET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const toBase62 = (int: number): string => {
  if (int === 0) {
    return CHARSET[0];
  }

  let res = '';
  while (int > 0) {
    res = CHARSET[int % 62] + res;
    int = Math.floor(int / 62);
  }
  return res;
};

export const fromBase62 = (value: string): number => {
  let decoded = 0;
  for (let i = 0; i < value.length; i++) {
    const idx = value.length - i - 1;
    const n = CHARSET.indexOf(value[idx]);
    if (n === -1) {
      throw new Error('not a base-62 input');
    }
    decoded += n * Math.pow(62, i);
  }
  return decoded;
};
