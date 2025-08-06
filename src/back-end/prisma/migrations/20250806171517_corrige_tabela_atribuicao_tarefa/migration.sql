/*
  Warnings:

  - You are about to drop the column `periodoFim` on the `AtribuicaoTarefa` table. All the data in the column will be lost.
  - You are about to drop the column `periodoInicio` on the `AtribuicaoTarefa` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AtribuicaoTarefa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "tarefaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "AtribuicaoTarefa_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AtribuicaoTarefa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AtribuicaoTarefa" ("concluida", "id", "tarefaId", "usuarioId") SELECT "concluida", "id", "tarefaId", "usuarioId" FROM "AtribuicaoTarefa";
DROP TABLE "AtribuicaoTarefa";
ALTER TABLE "new_AtribuicaoTarefa" RENAME TO "AtribuicaoTarefa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
