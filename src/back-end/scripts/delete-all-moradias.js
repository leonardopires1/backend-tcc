const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

function askConfirmation(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    const moradias = await prisma.moradia.findMany({ select: { id: true, nome: true, imagemUrl: true } });

    if (!moradias || moradias.length === 0) {
      console.log('Nenhuma moradia encontrada no banco. Nada a deletar.');
      return;
    }

    console.log(`Encontradas ${moradias.length} moradia(s) no banco:`);
    moradias.slice(0, 10).forEach((m) => console.log(`  - [${m.id}] ${m.nome} ${m.imagemUrl ? `(imagem: ${m.imagemUrl})` : ''}`));
    if (moradias.length > 10) console.log('  ... (lista truncada)');

    const yesFlag = process.argv.includes('--yes') || process.argv.includes('-y');
    if (!yesFlag) {
      const answer = (await askConfirmation('Tem certeza que deseja deletar TODAS as moradias e dados relacionados? Digite "SIM" para confirmar: ')).trim();
      if (answer.toUpperCase() !== 'SIM') {
        console.log('Operação cancelada pelo usuário. Nenhuma alteração feita.');
        return;
      }
    }

    const moradiaIds = moradias.map((m) => m.id);

    // Buscar tarefas e despesas relacionadas para remover dependências (atribuições e despesaUsuario)
    const tarefas = await prisma.tarefa.findMany({ where: { moradiaId: { in: moradiaIds } }, select: { id: true } });
    const tarefaIds = tarefas.map((t) => t.id);

    const despesas = await prisma.despesa.findMany({ where: { moradiaId: { in: moradiaIds } }, select: { id: true } });
    const despesaIds = despesas.map((d) => d.id);

    console.log('Iniciando deleção em sequência segura (dependências primeiro)...');

    await prisma.$transaction(async (tx) => {
      if (tarefaIds.length > 0) {
        const delAtrib = await tx.atribuicaoTarefa.deleteMany({ where: { tarefaId: { in: tarefaIds } } });
        console.log(`  - Deletadas ${delAtrib.count || delAtrib} atribuições de tarefas`);

        const delTarefas = await tx.tarefa.deleteMany({ where: { id: { in: tarefaIds } } });
        console.log(`  - Deletadas ${delTarefas.count || delTarefas} tarefas`);
      }

      if (despesaIds.length > 0) {
        const delDespUsuario = await tx.despesaUsuario.deleteMany({ where: { despesaId: { in: despesaIds } } });
        console.log(`  - Deletadas ${delDespUsuario.count || delDespUsuario} entradas de despesa por usuário`);

        const delDespesas = await tx.despesa.deleteMany({ where: { id: { in: despesaIds } } });
        console.log(`  - Deletadas ${delDespesas.count || delDespesas} despesas`);
      }

      const delRegrasMoradia = await tx.regrasMoradia.deleteMany({ where: { moradiaId: { in: moradiaIds } } });
      console.log(`  - Deletadas ${delRegrasMoradia.count || delRegrasMoradia} relações de regras`);

      const delComodidades = await tx.comodidades.deleteMany({ where: { moradiaId: { in: moradiaIds } } });
      console.log(`  - Deletadas ${delComodidades.count || delComodidades} comodidades`);

      const delMoradias = await tx.moradia.deleteMany({ where: { id: { in: moradiaIds } } });
      console.log(`  - Deletadas ${delMoradias.count || delMoradias} moradia(s)`);
    });

    console.log('Deleção concluída com sucesso.');
  } catch (err) {
    console.error('Erro ao deletar moradias:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
