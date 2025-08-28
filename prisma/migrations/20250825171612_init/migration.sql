-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "avatarUrl" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moradia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT 'Moradia compartilhada',
    "endereco" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorMensalidade" DOUBLE PRECISION NOT NULL,
    "donoId" INTEGER,

    CONSTRAINT "Moradia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER NOT NULL,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moradiaId" INTEGER NOT NULL,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtribuicaoTarefa" (
    "id" SERIAL NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "tarefaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "AtribuicaoTarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DespesaUsuario" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" TIMESTAMP(3),
    "usuarioId" INTEGER NOT NULL,
    "despesaId" INTEGER NOT NULL,

    CONSTRAINT "DespesaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Regras" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Regras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegrasMoradia" (
    "id" SERIAL NOT NULL,
    "moradiaId" INTEGER NOT NULL,
    "regraId" INTEGER NOT NULL,

    CONSTRAINT "RegrasMoradia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comodidades" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "moradiaId" INTEGER NOT NULL,

    CONSTRAINT "Comodidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Moradores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Moradores_AB_pkey" PRIMARY KEY ("A","B")
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
CREATE UNIQUE INDEX "Regras_titulo_key" ON "Regras"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "RegrasMoradia_moradiaId_regraId_key" ON "RegrasMoradia"("moradiaId", "regraId");

-- CreateIndex
CREATE INDEX "_Moradores_B_index" ON "_Moradores"("B");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moradia" ADD CONSTRAINT "Moradia_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtribuicaoTarefa" ADD CONSTRAINT "AtribuicaoTarefa_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtribuicaoTarefa" ADD CONSTRAINT "AtribuicaoTarefa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaUsuario" ADD CONSTRAINT "DespesaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaUsuario" ADD CONSTRAINT "DespesaUsuario_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "Despesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegrasMoradia" ADD CONSTRAINT "RegrasMoradia_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegrasMoradia" ADD CONSTRAINT "RegrasMoradia_regraId_fkey" FOREIGN KEY ("regraId") REFERENCES "Regras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comodidades" ADD CONSTRAINT "Comodidades_moradiaId_fkey" FOREIGN KEY ("moradiaId") REFERENCES "Moradia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Moradores" ADD CONSTRAINT "_Moradores_A_fkey" FOREIGN KEY ("A") REFERENCES "Moradia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Moradores" ADD CONSTRAINT "_Moradores_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
