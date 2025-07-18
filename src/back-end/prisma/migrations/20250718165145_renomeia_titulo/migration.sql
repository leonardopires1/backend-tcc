/*
  Warnings:

  - You are about to drop the column `tituko` on the `Regras` table. All the data in the column will be lost.
  - Added the required column `titulo` to the `Regras` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Regras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT
);
INSERT INTO "new_Regras" ("descricao", "id") SELECT "descricao", "id" FROM "Regras";
DROP TABLE "Regras";
ALTER TABLE "new_Regras" RENAME TO "Regras";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
