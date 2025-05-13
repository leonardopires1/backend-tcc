/*
  Warnings:

  - You are about to drop the column `moradiaMoradorId` on the `Usuario` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_Moradores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_Moradores_A_fkey" FOREIGN KEY ("A") REFERENCES "Moradia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Moradores_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "moradiaId" INTEGER,
    CONSTRAINT "Usuario_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Usuario" ("cpf", "criadoEm", "dataNascimento", "email", "genero", "id", "nome", "senha", "telefone") SELECT "cpf", "criadoEm", "dataNascimento", "email", "genero", "id", "nome", "senha", "telefone" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
CREATE UNIQUE INDEX "Usuario_telefone_key" ON "Usuario"("telefone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_Moradores_AB_unique" ON "_Moradores"("A", "B");

-- CreateIndex
CREATE INDEX "_Moradores_B_index" ON "_Moradores"("B");
