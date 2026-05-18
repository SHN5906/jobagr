import axios from 'axios';

const BASE_URL = 'https://epi-api.welovedevs.com';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    ...(process.env['WELOVEDEVS_API_KEY']
      ? { Authorization: `Bearer ${process.env['WELOVEDEVS_API_KEY']}` }
      : {}),
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

export interface WLDJob {
  id:            string;
  title?:        string;
  description?:  string;
  company?: {
    name?:    string;
    logo?:    string;
    website?: string;
  };
  location?:     unknown;
  contractType?: string;
  workMode?:     string;
  salary?:       unknown;
  technologies?: string[];
  skills?:       string[];
  publishedAt?:  string;
  expiresAt?:    string;
  applyUrl?:     string;
}

interface WLDResponse {
  data: WLDJob[];
  meta?: {
    total?:    number;
    page?:     number;
    perPage?:  number;
    lastPage?: number;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchJobsPage(page: number, perPage = 20): Promise<WLDResponse> {
  const res = await client.get<WLDResponse>('/jobs', { params: { page, perPage } });
  return res.data;
}

/**
 * Async generator that yields every job from WeLoveDevs API,
 * paginating automatically and respecting the 1 req/s rate limit.
 */
export async function* fetchAllJobs(): AsyncGenerator<WLDJob> {
  let page     = 1;
  let lastPage = 1;

  do {
    const result = await fetchJobsPage(page, 20);
    const jobs   = Array.isArray(result.data) ? result.data : [];

    for (const job of jobs) yield job;

    lastPage = result.meta?.lastPage ?? 1;
    page++;

    if (page <= lastPage) await sleep(1_100); // respect 1 req/s
  } while (page <= lastPage);
}
