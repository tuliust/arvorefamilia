const ZODIAC_RANGES = [
  { sign: 'Aquario', label: 'Aquário', start: [1, 21], end: [2, 18] },
  { sign: 'Peixes', label: 'Peixes', start: [2, 19], end: [3, 20] },
  { sign: 'Aries', label: 'Áries', start: [3, 21], end: [4, 20] },
  { sign: 'Touro', label: 'Touro', start: [4, 21], end: [5, 20] },
  { sign: 'Gemeos', label: 'Gêmeos', start: [5, 21], end: [6, 20] },
  { sign: 'Cancer', label: 'Câncer', start: [6, 21], end: [7, 22] },
  { sign: 'Leao', label: 'Leão', start: [7, 23], end: [8, 22] },
  { sign: 'Virgem', label: 'Virgem', start: [8, 23], end: [9, 22] },
  { sign: 'Libra', label: 'Libra', start: [9, 23], end: [10, 22] },
  { sign: 'Escorpiao', label: 'Escorpião', start: [10, 23], end: [11, 21] },
  { sign: 'Sagitario', label: 'Sagitário', start: [11, 22], end: [12, 21] },
  { sign: 'Capricornio', label: 'Capricórnio', start: [12, 22], end: [1, 20] },
] as const;

function isWithinRange(month: number, day: number, start: readonly number[], end: readonly number[]) {
  const value = month * 100 + day;
  const startValue = start[0] * 100 + start[1];
  const endValue = end[0] * 100 + end[1];

  if (startValue <= endValue) {
    return value >= startValue && value <= endValue;
  }

  return value >= startValue || value <= endValue;
}

export function getZodiacSignFromBirthDate(value: string | number | null | undefined) {
  const birthDate = String(value ?? '').trim();

  if (!birthDate || /^\d{4}$/.test(birthDate)) {
    return '';
  }

  const match = birthDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return '';
  }

  const day = Number(match[1]);
  const month = Number(match[2]);

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return '';
  }

  return ZODIAC_RANGES.find((range) => isWithinRange(month, day, range.start, range.end))?.label ?? '';
}
