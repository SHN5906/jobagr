/**
 * Seed script — populates the DB with sample offers and one admin account.
 * Run with: npm run db:seed
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, ContractType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ─── Admin user ────────────────────────────────────────────────────────────
  const admin_hash = await bcrypt.hash('Admin@jobryx1!', 12);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@jobryx.dev' },
    update: {},
    create: {
      email:         'admin@jobryx.dev',
      username:      'admin',
      password_hash: admin_hash,
      role:          'ADMIN',
    },
  });
  console.log(`Admin: ${admin.email}`);

  // ─── Sample offers ─────────────────────────────────────────────────────────
  const offers = [
    {
      title:     'Backend Python',
      company:   'Datalys',
      location:  'Paris',
      work_mode: 'Hybride',
      contract:  ContractType.CDI,
      salary:    '50–65k €',
      tags:      ['Python', 'FastAPI', 'PostgreSQL'],
      score:     94,
      source:    'welovedevs',
      posted_at: new Date('2026-04-28'),
    },
    {
      title:     'Ingénieur DevOps',
      company:   'OvhCloud',
      location:  'Lyon',
      work_mode: 'Sur site',
      contract:  ContractType.CDI,
      salary:    '55–70k €',
      tags:      ['Docker', 'Kubernetes', 'Terraform'],
      score:     89,
      source:    'welovedevs',
      posted_at: new Date('2026-04-27'),
    },
    {
      title:     'Stage Data Engineer',
      company:   'Dataiku',
      location:  'Remote',
      work_mode: 'Full remote',
      contract:  ContractType.STAGE,
      salary:    '1 400 €',
      tags:      ['Spark', 'dbt', 'Airflow'],
      score:     86,
      source:    'welovedevs',
      posted_at: new Date('2026-04-26'),
    },
    {
      title:     'Frontend React Senior',
      company:   'Doctolib',
      location:  'Levallois',
      work_mode: 'Hybride',
      contract:  ContractType.CDI,
      salary:    '60–80k €',
      tags:      ['React', 'TypeScript', 'Tailwind'],
      score:     82,
      source:    'welovedevs',
      posted_at: new Date('2026-04-25'),
    },
    {
      title:     'Alternance ML Engineer',
      company:   'Mistral AI',
      location:  'Paris',
      work_mode: 'Hybride',
      contract:  ContractType.ALTERNANCE,
      salary:    null,
      tags:      ['PyTorch', 'CUDA', 'Python'],
      score:     78,
      source:    'welovedevs',
      posted_at: new Date('2026-04-24'),
    },
  ];

  for (const offer of offers) {
    await prisma.offer.upsert({
      where:  { id: '00000000-0000-0000-0000-00000000000' + (offers.indexOf(offer) + 1) },
      update: {},
      create: { ...offer, id: '00000000-0000-0000-0000-00000000000' + (offers.indexOf(offer) + 1) },
    });
  }

  console.log(`Seeded ${offers.length} offers.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
