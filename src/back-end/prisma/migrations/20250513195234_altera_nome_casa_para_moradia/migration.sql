/*
  Warnings:

  - You are about to drop the `Casa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Moradores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `casaId` on the `Despesa` table. All the data in the column will be lost.
  - You are about to drop the column `casaId` on the `Tarefa` table. All the data in the column will be lost.
  - Added the required column `moradiaId` to the `Despesa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moradiaId` to the `Tarefa` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Casa_donoId_key";

-- DropIndex
DROP INDEX "_Moradores_B_index";

-- DropIndex
DROP INDEX "_Moradores_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Casa";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_Moradores";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Moradia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donoId" INTEGER,
    CONSTRAINT "Moradia_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Despesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "valorTotal" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "tipo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER NOT NULL,
    CONSTRAINT "Despesa_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Despesa" ("criadoEm", "id", "nome", "tipo", "valorTotal", "vencimento") SELECT "criadoEm", "id", "nome", "tipo", "valorTotal", "vencimento" FROM "Despesa";
DROP TABLE "Despesa";
ALTER TABLE "new_Despesa" RENAME TO "Despesa";
CREATE TABLE "new_Tarefa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "recorrencia" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER NOT NULL,
    CONSTRAINT "Tarefa_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tarefa" ("criadoEm", "descricao", "id", "nome", "recorrencia") SELECT "criadoEm", "descricao", "id", "nome", "recorrencia" FROM "Tarefa";
DROP TABLE "Tarefa";
ALTER TABLE "new_Tarefa" RENAME TO "Tarefa";
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "genero" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaMoradorId" INTEGER,
    CONSTRAINT "Usuario_moradiaMoradorId_fkey" FOREIGN KEY ("moradiaMoradorId") REFERENCES "Moradia" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Usuario" ("cpf", "criadoEm", "dataNascimento", "email", "genero", "id", "nome", "senha", "telefone") SELECT "cpf", "criadoEm", "dataNascimento", "email", "genero", "id", "nome", "senha", "telefone" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
CREATE UNIQUE INDEX "Usuario_telefone_key" ON "Usuario"("telefone");
CREATE UNIQUE INDEX "Usuario_moradiaMoradorId_key" ON "Usuario"("moradiaMoradorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Moradia_donoId_key" ON "Moradia"("donoId");
