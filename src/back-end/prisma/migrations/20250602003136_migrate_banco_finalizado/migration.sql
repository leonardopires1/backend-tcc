-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER,
    CONSTRAINT "Usuario_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Moradia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT 'Moradia compartilhada',
    "endereco" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donoId" INTEGER,
    CONSTRAINT "Moradia_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "recorrencia" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER NOT NULL,
    CONSTRAINT "Tarefa_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "valorTotal" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "tipo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER NOT NULL,
    CONSTRAINT "Despesa_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
CREATE TABLE "Regras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tituko" TEXT NOT NULL,
    "descricao" TEXT
);

-- CreateTable
CREATE TABLE "RegrasMoradia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "moradiaId" INTEGER NOT NULL,
    "regraId" INTEGER NOT NULL,
    CONSTRAINT "RegrasMoradia_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegrasMoradia_regraId_fkey" FOREIGN KEY ("regraId") REFERENCES "Regras" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_Moradores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_Moradores_A_fkey" FOREIGN KEY ("A") REFERENCES "Moradia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Moradores_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefone_key" ON "Usuario"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "Moradia_donoId_key" ON "Moradia"("donoId");

-- CreateIndex
CREATE UNIQUE INDEX "_Moradores_AB_unique" ON "_Moradores"("A", "B");

-- CreateIndex
CREATE INDEX "_Moradores_B_index" ON "_Moradores"("B");
