// ─── Contract type ────────────────────────────────────────────────────────────

export type ContractType = 'CDI' | 'STAGE' | 'ALTERNANCE' | 'FREELANCE';

const CONTRACT_MAP: Record<string, ContractType> = {
  // CDI
  'cdi':              'CDI',
  'full-time':        'CDI',
  'fulltime':         'CDI',
  'permanent':        'CDI',
  'temps plein':      'CDI',
  // STAGE
  'stage':            'STAGE',
  'internship':       'STAGE',
  'intern':           'STAGE',
  'stagiaire':        'STAGE',
  // ALTERNANCE
  'alternance':       'ALTERNANCE',
  'apprenticeship':   'ALTERNANCE',
  'work-study':       'ALTERNANCE',
  'contrat pro':      'ALTERNANCE',
  "contrat d'apprentissage": 'ALTERNANCE',
  'professionnalisation':    'ALTERNANCE',
  // FREELANCE
  'freelance':        'FREELANCE',
  'contract':         'FREELANCE',
  'consultant':       'FREELANCE',
  'mission':          'FREELANCE',
  'freelancer':       'FREELANCE',
};

/**
 * Maps any WeLoveDevs contractType string to our 4-value enum.
 * Defaults to 'CDI' for unknown values.
 */
export function normalizeContractType(raw: string | null | undefined): ContractType {
  if (!raw) return 'CDI';
  return CONTRACT_MAP[raw.toLowerCase().trim()] ?? 'CDI';
}

// ─── Salary ───────────────────────────────────────────────────────────────────

/**
 * Turns a WLD salary object ({ min, max }) into a human-readable string.
 * Returns null when no salary data is present.
 */
export function normalizeSalary(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  const toInt = (v: unknown): number | null => {
    if (typeof v === 'number' && isFinite(v)) return Math.round(v);
    if (typeof v === 'string' && v.trim() !== '') {
      const parsed = parseFloat(v.replace(/[^\d.]/g, ''));
      return isFinite(parsed) ? Math.round(parsed) : null;
    }
    return null;
  };

  const min = toInt(obj['min']);
  const max = toInt(obj['max']);

  if (min !== null && max !== null) return `${min.toLocaleString('fr-FR')} – ${max.toLocaleString('fr-FR')} €`;
  if (min !== null) return `À partir de ${min.toLocaleString('fr-FR')} €`;
  if (max !== null) return `Jusqu'à ${max.toLocaleString('fr-FR')} €`;
  return null;
}

// ─── Location ─────────────────────────────────────────────────────────────────

/**
 * Normalizes a location that can be a string or an object { city, department, country }.
 */
export function normalizeLocation(raw: unknown): string {
  if (!raw) return 'Non précisé';
  if (typeof raw === 'string') return raw.trim() || 'Non précisé';
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const parts = [obj['city'], obj['department'], obj['country']]
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map(v => v.trim());
    return parts.length > 0 ? parts.join(', ') : 'Non précisé';
  }
  return 'Non précisé';
}

// ─── Work mode ────────────────────────────────────────────────────────────────

export function normalizeWorkMode(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return 'Non précisé';
  const val = raw.toLowerCase().trim();
  if (val.includes('remote') || val.includes('télétravail') || val.includes('full remote')) return 'Full remote';
  if (val.includes('hybrid') || val.includes('hybride')) return 'Hybride';
  if (val.includes('onsite') || val.includes('sur site') || val.includes('présentiel')) return 'Sur site';
  return raw.trim();
}

// ─── Text / HTML stripping ────────────────────────────────────────────────────

/**
 * Strips HTML tags and decodes common entities from a raw string.
 */
export function normalizeText(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
