import { Router, Request, Response, NextFunction } from 'express';
import { ContractType, Prisma } from '@prisma/client';
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

const CONTRACT_PATTERNS: [RegExp, ContractType][] = [
  [/\b(stage|internship|intern|stagiaire)\b/i, ContractType.STAGE],
  [/\b(alternance|alternant|apprentissage|apprenticeship)\b/i, ContractType.ALTERNANCE],
  [/\b(freelance|free-lance|mission|tjm)\b/i, ContractType.FREELANCE],
  [/\bcdi\b/i, ContractType.CDI],
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
  contractType?: ContractType;
} {
  const msg = message.toLowerCase();

  let contractType: ContractType | undefined;
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

      const where: Prisma.OfferWhereInput = { is_active: true };

      if (keyword) {
        where.OR = [
          { title:    { contains: keyword, mode: Prisma.QueryMode.insensitive } },
          { company:  { contains: keyword, mode: Prisma.QueryMode.insensitive } },
          { tags:     { has: keyword.toLowerCase() } },
        ];
      }
      if (location)     where.location = { contains: location, mode: Prisma.QueryMode.insensitive };
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

      let reply: string;
      if (offers.length === 0) {
        reply = "Aucune offre trouvée. Essaie d'autres mots-clés ou retire un filtre.";
      } else if (offers.length === 1) {
        reply = "Voici la meilleure offre :";
      } else {
        reply = `Voici ${offers.length} offres récentes :`;
      }

      res.json({ reply, offers });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
