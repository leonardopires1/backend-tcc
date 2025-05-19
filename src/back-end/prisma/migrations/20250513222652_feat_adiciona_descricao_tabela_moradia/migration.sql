-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Moradia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT 'Moradia compartilhada',
    "endereco" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donoId" INTEGER,
    CONSTRAINT "Moradia_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Moradia" ("criadoEm", "donoId", "endereco", "id", "nome") SELECT "criadoEm", "donoId", "endereco", "id", "nome" FROM "Moradia";
DROP TABLE "Moradia";
ALTER TABLE "new_Moradia" RENAME TO "Moradia";
CREATE UNIQUE INDEX "Moradia_donoId_key" ON "Moradia"("donoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
