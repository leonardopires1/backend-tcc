/*
  Warnings:

  - A unique constraint covering the columns `[tarefaId,usuarioId]` on the table `AtribuicaoTarefa` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."AtribuicaoTarefa" ADD COLUMN     "DataHoraConclusao" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "AtribuicaoTarefa_tarefaId_usuarioId_key" ON "public"."AtribuicaoTarefa"("tarefaId", "usuarioId");
