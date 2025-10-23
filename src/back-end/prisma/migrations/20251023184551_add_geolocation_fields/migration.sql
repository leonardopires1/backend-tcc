/*
  Warnings:

  - You are about to drop the column `endereco` on the `Moradia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Moradia" DROP COLUMN "endereco",
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
