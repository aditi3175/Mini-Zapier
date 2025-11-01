/*
  Warnings:

  - A unique constraint covering the columns `[secret]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "secret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_secret_key" ON "Workflow"("secret");
