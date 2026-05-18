import { prisma } from './prisma';
import { fetchAllJobs } from './welovedevs';
import {
  normalizeContractType,
  normalizeSalary,
  normalizeLocation,
  normalizeWorkMode,
  normalizeText,
  type ContractType,
} from '../utils/normalize';

export interface IngestionResult {
  offersFetched: number;
  offersCreated: number;
  offersSkipped: number;
  durationMs:    number;
  error?:        string;
}

/**
 * Fetches all jobs from WeLoveDevs, normalizes them and upserts into the DB.
 * Skips offers already present (matched on title + company + source).
 */
export async function runIngestion(): Promise<IngestionResult> {
  const start: number = Date.now();

  let offersFetched = 0;
  let offersCreated = 0;
  let offersSkipped = 0;

  if (!process.env['WELOVEDEVS_API_KEY']) {
    return {
      offersFetched: 0,
      offersCreated: 0,
      offersSkipped: 0,
      durationMs:    0,
      error:         'WELOVEDEVS_API_KEY is not set.',
    };
  }

  try {
    for await (const job of fetchAllJobs()) {
      offersFetched++;

      const title   = normalizeText(job.title   ?? 'Untitled');
      const company = normalizeText(job.company?.name ?? 'Inconnu');

      // Skip if already in DB (title + company + source combination)
      const exists = await prisma.offer.findFirst({
        where: { title, company, source: 'welovedevs' },
        select: { id: true },
      });

      if (exists) {
        offersSkipped++;
        continue;
      }

      const contract: ContractType = normalizeContractType(job.contractType);
      const salary                 = normalizeSalary(job.salary);
      const location               = normalizeLocation(job.location);
      const work_mode              = normalizeWorkMode(job.workMode);
      const rawTags: string[] = [
        ...(job.technologies ?? []),
        ...(job.skills       ?? []),
      ].filter(Boolean);

      // SQLite dev schema stores tags as JSON string; PostgreSQL uses String[]
      const isSQLite = (process.env['DATABASE_URL'] ?? '').startsWith('file:');
      const tags = isSQLite ? JSON.stringify(rawTags) : rawTags as unknown as string;

      await prisma.offer.create({
        data: {
          title,
          company,
          location,
          work_mode,
          contract,
          salary,
          tags,
          score:     0,
          source:    'welovedevs',
          is_active: true,
          posted_at: job.publishedAt ? new Date(job.publishedAt) : new Date(),
        },
      });

      offersCreated++;
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown ingestion error';
    return { offersFetched, offersCreated, offersSkipped, durationMs: Date.now() - start, error };
  }

  return { offersFetched, offersCreated, offersSkipped, durationMs: Date.now() - start };
}
