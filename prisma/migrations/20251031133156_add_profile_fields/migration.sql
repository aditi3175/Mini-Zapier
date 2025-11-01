-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_triggerId_fkey";

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "triggerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "name" TEXT;
