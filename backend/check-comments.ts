import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { name: true } } }
  });

  console.log('--- Son 10 Yorum ve Moderasyon Durumu ---');
  comments.forEach(c => {
    console.log(`[${c.status}] Yorum: "${c.text.substring(0, 30)}..."`);
    console.log(`- Dil: ${c.language} | Kullanıcı: ${c.user?.name}`);
    if (c.moderationReason) {
      console.log(`- Sebep: ${c.moderationReason}`);
    }
    console.log('-----------------------------------------');
  });

  await prisma.$disconnect();
}

main();
