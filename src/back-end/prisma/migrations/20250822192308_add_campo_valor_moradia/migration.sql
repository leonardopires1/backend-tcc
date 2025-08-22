/*
  Warnings:

  - Added the required column `valorMensalidade` to the `Moradia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Moradia" ADD COLUMN     "valorMensalidade" DOUBLE PRECISION NOT NULL;
