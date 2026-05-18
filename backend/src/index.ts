import app from './app';
import { config } from './config/env';
import { prisma } from './services/prisma';

const server = app.listen(config.port, () => {
  console.log(`[jobryx] Server running on http://localhost:${config.port} (${config.nodeEnv})`);
});

process.on('SIGTERM', async () => {
  server.close();
  await prisma.$disconnect();
});
process.on('SIGINT', async () => {
  server.close();
  await prisma.$disconnect();
});
