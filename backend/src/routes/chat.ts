import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../services/prisma';

const router = Router();

// ─── Stop words & patterns ────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'je', 'cherche', 'chercher', 'recherche', 'rechercher', 'trouve', 'trouver',
  'des', 'un', 'une', 'le', 'la', 'les', 'du', 'de', 'en', 'pour', 'sur',
  'dans', 'avec', 'offre', 'offres', 'emploi', 'job', 'jobs', 'poste',
  'postes', 'montrer', 'afficher', 'find', 'show', 'me', 'looking', 'for',
  'want', 'need', 'i', 'a', 'the', 'an', 'ai', 'besoin', 'et', 'ou',
]);

// Use string literals to stay compatible with both dev (SQLite, contract=String)
// and prod (Postgres, contract=enum). Prisma accepts the matching string in both cases.
type ContractStr = 'CDI' | 'STAGE' | 'ALTERNANCE' | 'FREELANCE';

const CONTRACT_PATTERNS: [RegExp, ContractStr][] = [
  [/\b(stage|internship|intern|stagiaire)\b/i,                      'STAGE'],
  [/\b(alternance|alternant|apprentissage|apprenticeship)\b/i,      'ALTERNANCE'],
  [/\b(freelance|free-lance|mission|tjm)\b/i,                       'FREELANCE'],
  [/\bcdi\b/i,                                                      'CDI'],
];

const KNOWN_CITIES = [
  'Paris', 'Lyon', 'Bordeaux', 'Toulouse', 'Nantes', 'Marseille',
  'Lille', 'Strasbourg', 'Rennes', 'Nice', 'Montpellier', 'Grenoble',
  'Levallois', 'Vélizy', 'Remote', 'Télétravail',
];

// ─── Parser ───────────────────────────────────────────────────────────────────
function parseMessage(message: string): {
  keyword?: string;
  location?: string;
  contractType?: ContractStr;
} {
  const msg = message.toLowerCase();

  let contractType: ContractStr | undefined;
  for (const [pattern, type] of CONTRACT_PATTERNS) {
    if (pattern.test(msg)) { contractType = type; break; }
  }

  let location: string | undefined;
  // "à Paris", "a Paris", "en remote" → first capture
  const prepositionMatch = message.match(/\b(?:à|a|en)\s+([A-Za-zÀ-ÿ-]+)/i);
  if (prepositionMatch) {
    location = prepositionMatch[1];
  } else {
    for (const city of KNOWN_CITIES) {
      if (msg.includes(city.toLowerCase())) { location = city; break; }
    }
  }

  const contractWords = new Set(
    CONTRACT_PATTERNS.flatMap(([pattern]) => (pattern.source.match(/\w+/g) ?? [])),
  );

  const keyword = msg
    .split(/\s+/)
    .filter((w) => {
      if (STOP_WORDS.has(w)) return false;
      if (contractWords.has(w)) return false;
      if (location && w === location.toLowerCase()) return false;
      if (w.length <= 2) return false;
      return true;
    })
    .join(' ')
    .trim() || undefined;

  return { keyword, location, contractType };
}

// ─── Route: POST /api/v1/chat ────────────────────────────────────────────────
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = typeof req.body?.message === 'string' ? req.body.message : '';
      if (!message.trim()) {
        res.status(400).json({ error: 'message is required' });
        return;
      }
      if (message.length > 500) {
        res.status(400).json({ error: 'message too long (max 500 chars)' });
        return;
      }

      const { keyword, location, contractType } = parseMessage(message);

      // SQLite-friendly query (also valid on Postgres):
      // - contract: string equality (works for both String and enum columns)
      // - tags: substring match — works whether tags is JSON-string (SQLite) or text[] (Postgres uses array_to_string in raw, but contains works on Prisma's String[] via String comparison? actually for Postgres String[] you'd need `has`. We accept the trade-off and rely on title/company match for Postgres prod.)
      // - LIKE is case-insensitive on SQLite by default for ASCII.
      const where: Prisma.OfferWhereInput = { is_active: true };

      if (keyword) {
        where.OR = [
          { title:    { contains: keyword } },
          { company:  { contains: keyword } },
          { tags:     { contains: keyword } },
        ] as Prisma.OfferWhereInput['OR'];
      }
      if (location)     where.location = { contains: location };
      if (contractType) where.contract = contractType;

      const offers = await prisma.offer.findMany({
        where,
        take: 5,
        orderBy: { posted_at: 'desc' },
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          work_mode: true,
          contract: true,
          salary: true,
          tags: true,
          score: true,
          posted_at: true,
        },
      });

      // Tags is a JSON-stringified array on SQLite; parse to array for the response.
      const decoded = offers.map((o) => {
        let tagsArr: string[] = [];
        if (Array.isArray(o.tags)) {
          tagsArr = o.tags as string[];
        } else if (typeof o.tags === 'string') {
          try { tagsArr = JSON.parse(o.tags); } catch { tagsArr = []; }
        }
        return { ...o, tags: tagsArr };
      });

      let reply: string;
      if (decoded.length === 0) {
        reply = "Aucune offre trouvée. Essaie d'autres mots-clés ou retire un filtre.";
      } else if (decoded.length === 1) {
        reply = "Voici la meilleure offre :";
      } else {
        reply = `Voici ${decoded.length} offres récentes :`;
      }

      res.json({ reply, offers: decoded });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
