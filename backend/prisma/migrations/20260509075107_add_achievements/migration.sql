-- AlterTable
ALTER TABLE "User" ADD COLUMN     "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[];
