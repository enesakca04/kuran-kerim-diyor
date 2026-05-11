import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { 
      OR: [
        { name: null },
        { name: 'Anonim' }
      ]
    }
  });

  console.log(`Found ${users.length} users to update`);

  for (const user of users) {
    const newName = user.email.split('@')[0];
    await prisma.user.update({
      where: { id: user.id },
      data: { name: newName }
    });
    console.log(`Updated user ${user.email} name to ${newName}`);
  }
  
  await prisma.$disconnect();
}

main();
