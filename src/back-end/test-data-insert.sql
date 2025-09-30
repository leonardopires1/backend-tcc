-- Script para inserir dados de teste para tarefas
-- Execute isso diretamente no banco de dados para testar

-- Assumindo que já existe uma moradia com ID 1 e usuários
-- Inserir algumas tarefas de exemplo

INSERT INTO "Tarefa" (nome, descricao, "moradiaId", "criadoEm") VALUES 
('Lavar a louça', 'Lavar toda a louça acumulada na pia da cozinha', 1, NOW()),
('Limpar o banheiro', 'Fazer limpeza completa do banheiro, incluindo vaso, box e pia', 1, NOW()),
('Comprar mantimentos', 'Ir ao supermercado e comprar itens da lista de compras', 1, NOW()),
('Organizar a sala', 'Arrumar a sala de estar e passar aspirador', 1, NOW()),
('Tirar o lixo', 'Recolher o lixo de todos os cômodos e colocar na rua', 1, NOW());

-- Inserir algumas atribuições (assumindo que existem usuários com IDs 1, 2, 3)
INSERT INTO "AtribuicaoTarefa" ("tarefaId", "usuarioId", concluida) VALUES 
(1, 1, false),  -- Tarefa 1 atribuída ao usuário 1
(2, 2, false),  -- Tarefa 2 atribuída ao usuário 2  
(3, 1, false),  -- Tarefa 3 atribuída ao usuário 1
(4, 3, true),   -- Tarefa 4 atribuída ao usuário 3 (já concluída)
(5, 2, false);  -- Tarefa 5 atribuída ao usuário 2