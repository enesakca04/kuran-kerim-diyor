import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- DB Wipe Started ---');
  await prisma.report.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ayahStat.deleteMany();
  console.log('--- DB Wipe Completed Successfully ---');
  await prisma.$disconnect();
}
main();
