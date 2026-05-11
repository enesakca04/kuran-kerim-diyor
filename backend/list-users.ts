import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, createdAt: true }
  });
  console.log('--- USERS IN DB ---');
  console.log(JSON.stringify(users, null, 2));
  console.log('-------------------');
  await prisma.$disconnect();
}
main();
