-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Usuario" ADD COLUMN "resetTokenExp" DATETIME;

-- CreateTable
CREATE TABLE "Comodidades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "moradiaId" INTEGER NOT NULL,
    CONSTRAINT "Comodidades_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
