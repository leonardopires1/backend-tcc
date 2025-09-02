/*
  Warnings:

  - Made the column `donoId` on table `Moradia` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Moradia" DROP CONSTRAINT "Moradia_donoId_fkey";

-- DropIndex
DROP INDEX "Moradia_donoId_key";

-- AlterTable
ALTER TABLE "Moradia" ALTER COLUMN "donoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Moradia" ADD CONSTRAINT "Moradia_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
