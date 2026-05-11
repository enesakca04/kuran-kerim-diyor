import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const comments = await prisma.comment.findMany();
  console.log('--- COMMENTS IN DB ---');
  console.log(JSON.stringify(comments, null, 2));
  console.log('-------------------');
  await prisma.$disconnect();
}
main();
