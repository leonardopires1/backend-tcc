import { useState, useCallback } from 'react';
import { ERROR_MESSAGES, APP_CONFIG } from '../constants';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

interface ValidationErrors {
  [key: string]: string;
}

export const useValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const fieldRules = rules[field] || [];
    
    for (const rule of fieldRules) {
      // Verificar se é obrigatório
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message || ERROR_MESSAGES.REQUIRED_FIELD;
      }

      // Se o campo está vazio e não é obrigatório, pular outras validações
      if (!value || value.toString().trim() === '') {
        continue;
      }

      // Verificar comprimento mínimo
      if (rule.minLength && value.toString().length < rule.minLength) {
        return rule.message || `Deve ter pelo menos ${rule.minLength} caracteres.`;
      }

      // Verificar comprimento máximo
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        return rule.message || `Deve ter no máximo ${rule.maxLength} caracteres.`;
      }

      // Verificar padrão (regex)
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        return rule.message || 'Formato inválido.';
      }

      // Validação customizada
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          return customError;
        }
      }
    }

    return null;
  }, [rules]);

  const validate = useCallback((data: any): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const validateSingleField = useCallback((field: string, value: any): boolean => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
    return !error;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validate,
    validateSingleField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0,
  };
};

// Regras de validação comuns
export const commonValidationRules = {
  email: [
    { required: true },
    { 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: ERROR_MESSAGES.INVALID_EMAIL 
    }
  ],
  
  password: [
    { required: true },
    { 
      minLength: APP_CONFIG.MIN_PASSWORD_LENGTH, 
      message: ERROR_MESSAGES.PASSWORD_TOO_SHORT 
    }
  ],
  
  confirmPassword: (password: string) => [
    { required: true },
    { 
      custom: (value: string) => 
        value !== password ? ERROR_MESSAGES.PASSWORDS_NOT_MATCH : null
    }
  ],
  
  required: [
    { required: true }
  ],
  
  cpf: [
    { required: true },
    { 
      pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 
      message: 'CPF inválido. Use o formato 000.000.000-00 ou 00000000000' 
    }
  ],
  
  phone: [
    { required: true },
    { 
      pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/, 
      message: 'Telefone inválido. Use o formato (11) 99999-9999' 
    }
  ],
  
  name: [
    { required: true },
    { minLength: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
    { maxLength: 100, message: 'Nome deve ter no máximo 100 caracteres' }
  ],
  
  description: [
    { maxLength: APP_CONFIG.MAX_DESCRIPTION_LENGTH }
  ],
};
