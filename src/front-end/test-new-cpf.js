// Teste da nova validação de CPF
import { validateCPF } from './hooks/useValidation';

console.log('=== Testando Nova Validação de CPF ===\n');

// Testes com CPFs válidos
console.log('✅ Testes com CPFs VÁLIDOS:');
console.log('CPF 111.444.777-35:', validateCPF('111.444.777-35'));
console.log('CPF 11144477735:', validateCPF('11144477735'));
console.log('CPF 000.000.001-91:', validateCPF('000.000.001-91'));
console.log('');

// Testes com CPFs inválidos
console.log('❌ Testes com CPFs INVÁLIDOS:');
console.log('CPF 123.456.789-01:', validateCPF('123.456.789-01'));
console.log('CPF 111.111.111-11:', validateCPF('111.111.111-11'));
console.log('CPF 123.456.789-0:', validateCPF('123.456.789-0'));
console.log('CPF vazio:', validateCPF(''));
console.log('CPF null:', validateCPF(null));
console.log('');

// Testes com formatos diferentes
console.log('🔧 Testes de FORMATO:');
console.log('CPF com letras abc.def.ghi-jk:', validateCPF('abc.def.ghi-jk'));
console.log('CPF só números 12345678901:', validateCPF('12345678901'));
console.log('CPF formatado 123.456.789-01:', validateCPF('123.456.789-01'));
