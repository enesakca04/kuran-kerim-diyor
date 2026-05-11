import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const comments = await prisma.comment.findMany({
    where: {
      status: { in: ['REJECTED', 'REMOVED_BY_MODERATOR'] },
    }
  });

  console.log(`Found ${comments.length} flagged comments to fix.`);

  for (const comment of comments) {
    let newReason = 'OTHER';
    const oldReason = comment.moderationReason?.toLowerCase() || '';

    if (oldReason.includes('profanity') || oldReason.includes('vulgar') || oldReason.includes('küfür')) {
      newReason = 'PROFANITY';
    } else if (oldReason.includes('insult') || oldReason.includes('mockery') || oldReason.includes('hakaret')) {
      newReason = 'INSULT';
    } else if (oldReason.includes('spam')) {
      newReason = 'SPAM';
    } else if (oldReason.includes('hate')) {
      newReason = 'HATE_SPEECH';
    } else if (oldReason.includes('off-topic') || oldReason.includes('alakasız')) {
      newReason = 'OFF_TOPIC';
    }

    await prisma.comment.update({
      where: { id: comment.id },
      data: { moderationReason: newReason }
    });
    console.log(`Updated comment #${comment.id}: "${oldReason.substring(0, 20)}..." -> ${newReason}`);
  }
  
  await prisma.$disconnect();
}

main();
