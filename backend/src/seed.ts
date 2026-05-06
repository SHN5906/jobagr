/**
 * Seed — admin account + sample offers.
 * Run with: npm run db:seed
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OFFERS = [
  { title: 'Backend Python',       company: 'Datalys',   location: 'Paris',     work_mode: 'Hybride',     contract: 'CDI',        salary: '50–65k €', tags: ['Python','FastAPI','PostgreSQL'],  score: 94, source: 'welovedevs', posted_at: new Date('2026-04-28') },
  { title: 'Ingénieur DevOps',     company: 'OvhCloud',  location: 'Lyon',      work_mode: 'Sur site',    contract: 'CDI',        salary: '55–70k €', tags: ['Docker','Kubernetes','Terraform'],score: 89, source: 'welovedevs', posted_at: new Date('2026-04-27') },
  { title: 'Stage Data Engineer',  company: 'Dataiku',   location: 'Remote',    work_mode: 'Full remote', contract: 'STAGE',      salary: '1 400 €',  tags: ['Spark','dbt','Airflow'],          score: 86, source: 'welovedevs', posted_at: new Date('2026-04-26') },
  { title: 'Frontend React Senior',company: 'Doctolib',  location: 'Levallois', work_mode: 'Hybride',     contract: 'CDI',        salary: '60–80k €', tags: ['React','TypeScript','Tailwind'],  score: 82, source: 'welovedevs', posted_at: new Date('2026-04-25') },
  { title: 'Alternance ML Engineer',company:'Mistral AI', location: 'Paris',    work_mode: 'Hybride',     contract: 'ALTERNANCE', salary: null,       tags: ['PyTorch','CUDA','Python'],        score: 78, source: 'welovedevs', posted_at: new Date('2026-04-24') },
];

async function main() {
  const hash = await bcrypt.hash('Admin@jobryx1!', 12);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@jobryx.dev' },
    update: {},
    create: { email: 'admin@jobryx.dev', username: 'admin', password_hash: hash, role: 'ADMIN' },
  });
  console.log(`✓ Admin: ${admin.email}`);

  await prisma.offer.deleteMany({});
  for (const o of OFFERS) {
    await prisma.offer.create({
      data: { ...o, tags: JSON.stringify(o.tags), salary: o.salary ?? null },
    });
  }
  console.log(`✓ Seeded ${OFFERS.length} offers.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
