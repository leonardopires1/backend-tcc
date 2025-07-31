// Teste da nova validação de CPF - Versão Node.js
function validateCPFFormat(value) {
  return /^(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/.test(value);
}

function isAllSameDigits(cpf) {
  return /^(\d)\1{10}$/.test(cpf);
}

function computeCheckDigit(cpf, factorStart) {
  let sum = 0;
  const length = factorStart - 1;
  for (let i = 0; i < length; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (factorStart - i);
  }
  const digit = (sum * 10) % 11;
  return digit === 10 ? 0 : digit;
}

function validateCPF(value) {
  if (!value || typeof value !== 'string') return 'CPF inválido';

  const cleaned = value.replace(/\D/g, '').trim();
  if (cleaned.length !== 11) return 'CPF deve ter 11 dígitos';
  if (isAllSameDigits(cleaned)) return 'CPF inválido';

  const firstVerif = computeCheckDigit(cleaned, 10);
  if (firstVerif !== parseInt(cleaned.charAt(9), 10)) return 'CPF inválido';

  const secondVerif = computeCheckDigit(cleaned, 11);
  if (secondVerif !== parseInt(cleaned.charAt(10), 10)) return 'CPF inválido';

  return null; // válido
}

console.log('=== Testando Nova Validação de CPF ===\n');

// Testes com CPFs válidos
console.log('✅ Testes com CPFs VÁLIDOS:');
console.log('CPF 111.444.777-35:', validateCPF('111.444.777-35') || 'VÁLIDO');
console.log('CPF 11144477735:', validateCPF('11144477735') || 'VÁLIDO');
console.log('CPF 000.000.001-91:', validateCPF('000.000.001-91') || 'VÁLIDO');
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
