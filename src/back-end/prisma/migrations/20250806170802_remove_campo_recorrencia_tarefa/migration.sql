/*
  Warnings:

  - You are about to drop the column `recorrencia` on the `Tarefa` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tarefa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER NOT NULL,
    CONSTRAINT "Tarefa_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tarefa" ("criadoEm", "descricao", "id", "moradiaId", "nome") SELECT "criadoEm", "descricao", "id", "moradiaId", "nome" FROM "Tarefa";
DROP TABLE "Tarefa";
ALTER TABLE "new_Tarefa" RENAME TO "Tarefa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
