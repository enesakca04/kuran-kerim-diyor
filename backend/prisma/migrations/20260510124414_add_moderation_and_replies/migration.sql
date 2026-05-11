-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "moderationReason" TEXT,
ADD COLUMN     "replyToId" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
