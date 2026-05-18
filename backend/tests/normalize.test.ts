import {
  normalizeContractType,
  normalizeSalary,
  normalizeLocation,
  normalizeText,
  normalizeWorkMode,
} from '../src/utils/normalize';

// ─── normalizeContractType ────────────────────────────────────────────────────

describe('normalizeContractType', () => {
  it('maps "cdi" to CDI', () => {
    expect(normalizeContractType('cdi')).toBe('CDI');
  });

  it('maps "full-time" to CDI', () => {
    expect(normalizeContractType('full-time')).toBe('CDI');
  });

  it('maps "stage" to STAGE', () => {
    expect(normalizeContractType('stage')).toBe('STAGE');
  });

  it('maps "internship" to STAGE', () => {
    expect(normalizeContractType('internship')).toBe('STAGE');
  });

  it('maps "alternance" to ALTERNANCE', () => {
    expect(normalizeContractType('alternance')).toBe('ALTERNANCE');
  });

  it('maps "contrat pro" to ALTERNANCE', () => {
    expect(normalizeContractType('contrat pro')).toBe('ALTERNANCE');
  });

  it('maps "freelance" to FREELANCE', () => {
    expect(normalizeContractType('freelance')).toBe('FREELANCE');
  });

  it('maps "mission" to FREELANCE', () => {
    expect(normalizeContractType('mission')).toBe('FREELANCE');
  });

  it('defaults unknown value to CDI', () => {
    expect(normalizeContractType('unknown_xyz')).toBe('CDI');
  });

  it('defaults null to CDI', () => {
    expect(normalizeContractType(null)).toBe('CDI');
  });

  it('defaults undefined to CDI', () => {
    expect(normalizeContractType(undefined)).toBe('CDI');
  });

  it('is case-insensitive', () => {
    expect(normalizeContractType('CDI')).toBe('CDI');
    expect(normalizeContractType('Freelance')).toBe('FREELANCE');
    expect(normalizeContractType('STAGE')).toBe('STAGE');
  });
});

// ─── normalizeSalary ──────────────────────────────────────────────────────────

describe('normalizeSalary', () => {
  it('formats min and max as a range string', () => {
    const result = normalizeSalary({ min: 30000, max: 45000 });
    expect(result).toContain('30');
    expect(result).toContain('45');
    expect(result).toContain('€');
  });

  it('returns null for null input', () => {
    expect(normalizeSalary(null)).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(normalizeSalary('35000')).toBeNull();
    expect(normalizeSalary(42)).toBeNull();
  });

  it('formats min-only salary', () => {
    const result = normalizeSalary({ min: 40000 });
    expect(result).not.toBeNull();
    expect(result).toContain('40');
  });

  it('formats max-only salary', () => {
    const result = normalizeSalary({ max: 60000 });
    expect(result).not.toBeNull();
    expect(result).toContain('60');
  });

  it('returns null when both min and max are missing', () => {
    expect(normalizeSalary({})).toBeNull();
  });

  it('parses string salary values', () => {
    const result = normalizeSalary({ min: '30000', max: '45000' });
    expect(result).not.toBeNull();
  });
});

// ─── normalizeLocation ────────────────────────────────────────────────────────

describe('normalizeLocation', () => {
  it('returns string as-is', () => {
    expect(normalizeLocation('Paris')).toBe('Paris');
  });

  it('trims whitespace', () => {
    expect(normalizeLocation('  Lyon  ')).toBe('Lyon');
  });

  it('builds string from city + country object', () => {
    expect(normalizeLocation({ city: 'Nice', country: 'France' })).toBe('Nice, France');
  });

  it('skips empty parts in object', () => {
    expect(normalizeLocation({ city: 'Bordeaux', department: '', country: 'France' })).toBe('Bordeaux, France');
  });

  it('returns "Non précisé" for null', () => {
    expect(normalizeLocation(null)).toBe('Non précisé');
  });

  it('returns "Non précisé" for empty string', () => {
    expect(normalizeLocation('')).toBe('Non précisé');
  });

  it('returns "Non précisé" for empty object', () => {
    expect(normalizeLocation({})).toBe('Non précisé');
  });
});

// ─── normalizeText ────────────────────────────────────────────────────────────

describe('normalizeText', () => {
  it('strips HTML tags', () => {
    expect(normalizeText('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });

  it('collapses whitespace', () => {
    expect(normalizeText('foo   bar\n\nbaz')).toBe('foo bar baz');
  });

  it('decodes HTML entities', () => {
    expect(normalizeText('React &amp; Vue')).toBe('React & Vue');
    expect(normalizeText('&lt;div&gt;')).toBe('<div>');
    expect(normalizeText('hello&nbsp;world')).toBe('hello world');
  });

  it('returns empty string for non-string input', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(42)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
});

// ─── normalizeWorkMode ────────────────────────────────────────────────────────

describe('normalizeWorkMode', () => {
  it('detects full remote', () => {
    expect(normalizeWorkMode('full remote')).toBe('Full remote');
    expect(normalizeWorkMode('remote')).toBe('Full remote');
  });

  it('detects hybrid', () => {
    expect(normalizeWorkMode('hybrid')).toBe('Hybride');
    expect(normalizeWorkMode('hybride')).toBe('Hybride');
  });

  it('detects onsite', () => {
    expect(normalizeWorkMode('onsite')).toBe('Sur site');
    expect(normalizeWorkMode('présentiel')).toBe('Sur site');
  });

  it('returns "Non précisé" for null', () => {
    expect(normalizeWorkMode(null)).toBe('Non précisé');
  });

  it('returns value as-is for unknown string', () => {
    expect(normalizeWorkMode('Partiel')).toBe('Partiel');
  });
});
