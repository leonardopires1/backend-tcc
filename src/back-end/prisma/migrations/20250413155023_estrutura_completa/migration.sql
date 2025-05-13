/*
  Warnings:

  - You are about to drop the column `casaId` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `tipoUsuario` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `senhaHash` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Tarefa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "recorrencia" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "casaId" INTEGER NOT NULL,
    CONSTRAINT "Tarefa_casaId_fkey" FOREIGN KEY ("casaId") REFERENCES "Casa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AtribuicaoTarefa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodoInicio" DATETIME NOT NULL,
    "periodoFim" DATETIME NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "tarefaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "AtribuicaoTarefa_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AtribuicaoTarefa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "valorTotal" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "tipo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "casaId" INTEGER NOT NULL,
    CONSTRAINT "Despesa_casaId_fkey" FOREIGN KEY ("casaId") REFERENCES "Casa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DespesaUsuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" REAL NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" DATETIME,
    "usuarioId" INTEGER NOT NULL,
    "despesaId" INTEGER NOT NULL,
    CONSTRAINT "DespesaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DespesaUsuario_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "Despesa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_Moradores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_Moradores_A_fkey" FOREIGN KEY ("A") REFERENCES "Casa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Moradores_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Casa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donoId" INTEGER,
    CONSTRAINT "Casa_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Casa" ("endereco", "id", "nome") SELECT "endereco", "id", "nome" FROM "Casa";
DROP TABLE "Casa";
ALTER TABLE "new_Casa" RENAME TO "Casa";
CREATE UNIQUE INDEX "Casa_donoId_key" ON "Casa"("donoId");
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Usuario" ("email", "id", "nome") SELECT "email", "id", "nome" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_Moradores_AB_unique" ON "_Moradores"("A", "B");

-- CreateIndex
CREATE INDEX "_Moradores_B_index" ON "_Moradores"("B");
