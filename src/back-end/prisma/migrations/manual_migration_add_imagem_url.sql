-- Migração manual para adicionar campo imagemUrl à tabela Moradia
-- Execute este script no banco de dados de produção

ALTER TABLE "Moradia" ADD COLUMN "imagemUrl" TEXT;

-- Comentário: Campo para armazenar URL/nome da imagem da moradia
-- Opcional: Adicionar um valor padrão para moradias existentes (pode ser null)
-- UPDATE "Moradia" SET "imagemUrl" = null WHERE "imagemUrl" IS NULL;

-- Verificar se o campo foi adicionado corretamente
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'Moradia' AND column_name = 'imagemUrl';
