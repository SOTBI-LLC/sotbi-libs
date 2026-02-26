export const validateBik = (bik: string): string | null => {
  if (!bik?.length) {
    return 'БИК пуст';
  } else if (/[^0-9]/.test(bik)) {
    return 'БИК может состоять только из цифр';
  } else if (bik.length !== 9) {
    return 'БИК может состоять только из 9 цифр';
  }
  return null;
};

export const validateOgrn = (ogrn: string): string | null => {
  if (!ogrn.length) {
    return 'ОГРН пуст';
  } else if (/[^0-9]/.test(ogrn)) {
    return 'ОГРН может состоять только из цифр';
  } else if (ogrn.length !== 13) {
    return 'ОГРН может состоять только из 13 цифр';
  } else {
    const n13 = parseInt(
      (parseInt(ogrn.slice(0, -1)) % 11).toString().slice(-1),
    );
    if (n13 !== +ogrn[12]) {
      return 'Неправильное контрольное число';
    }
  }
  return null;
};

export const validateOgrnip = (ogrnip: string): string | null => {
  if (!ogrnip.length) {
    return 'ОГРНИП пуст';
  } else if (/[^0-9]/.test(ogrnip)) {
    return 'ОГРНИП может состоять только из цифр';
  } else if (ogrnip.length !== 15) {
    return 'ОГРНИП может состоять только из 15 цифр';
  } else {
    const n15 = parseInt(
      (parseInt(ogrnip.slice(0, -1)) % 13).toString().slice(-1),
    );
    if (n15 !== parseInt(ogrnip[14])) {
      return 'Неправильное контрольное число';
    }
  }
  return null;
};

export const validateRs = (rs = '', bik = ''): string | null => {
  const bikError = validateBik(bik);
  if (bikError) {
    return bikError;
  }
  if (!rs?.length) {
    return 'Р/С пуст';
  } else if (/[^0-9]/.test(rs)) {
    return 'Р/С может состоять только из цифр';
  } else if (rs?.length !== 20) {
    return 'Р/С может состоять только из 20 цифр';
  } else {
    const bikRs = bik?.toString().slice(-3) + rs;
    let checksum = 0;
    const coefficients: number[] = [
      7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1,
    ];
    for (const i in coefficients) {
      checksum += coefficients[i] * (+bikRs[i] % 10);
    }
    if (checksum % 10 !== 0) {
      return 'Неправильное контрольное число';
    }
  }
  return null;
};

export const validateKs = (ks: string, bik: string): string | null => {
  const bikError = validateBik(bik);
  if (bikError) {
    return bikError;
  }
  if (!ks.length) {
    return 'Р/С пуст';
  } else if (/[^0-9]/.test(ks)) {
    return 'Р/С может состоять только из цифр';
  } else if (ks.length !== 20) {
    return 'Р/С может состоять только из 20 цифр';
  } else {
    const bikKs = '0' + bik.toString().slice(4, 6) + ks;
    let checksum = 0;
    const coefficients: number[] = [
      7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1,
    ];
    for (const i in coefficients) {
      checksum += coefficients[i] * (+bikKs[i] % 10);
    }
    if (checksum % 10 !== 0) {
      return 'Неправильное контрольное число';
    }
  }
  return null;
};

export const validateSnils = (snils: string): string | null => {
  if (!snils.length) {
    return 'СНИЛС пуст';
  } else if (/[^0-9]/.test(snils)) {
    return 'СНИЛС может состоять только из цифр';
  } else if (snils.length !== 11) {
    return 'СНИЛС может состоять только из 11 цифр';
  } else {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(snils[i]) * (9 - i);
    }
    let checkDigit = 0;
    if (sum < 100) {
      checkDigit = sum;
    } else if (sum > 101) {
      checkDigit = parseInt((sum % 101).toString());
      if (checkDigit === 100) {
        checkDigit = 0;
      }
    }
    if (checkDigit !== parseInt(snils.slice(-2))) {
      return 'Неправильное контрольное число';
    }
  }
  return null;
};

export const validateINN = (tin: string): boolean => {
  if (!tin || (tin.length !== 10 && tin.length !== 12)) {
    return false;
  }

  const coefficients10 = [2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
  const coefficients11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
  const coefficients12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];

  const checkSum = (tin: string, coefficients: number[]): number => {
    let sum = 0;
    for (let i = 0; i < coefficients.length; i++) {
      sum += +tin[i] * coefficients[i];
    }
    return (sum % 11) % 10;
  };

  if (tin.length === 10) {
    return +tin[9] === checkSum(tin, coefficients10);
  }

  if (tin.length === 12) {
    return (
      +tin[10] === checkSum(tin, coefficients11) &&
      +tin[11] === checkSum(tin, coefficients12)
    );
  }

  return false;
};
