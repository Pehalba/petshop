/**
 * Utils.js - Funções utilitárias
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class Utils {
  // Formatação de datas
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    const finalOptions = { ...defaultOptions, ...options };
    return new Date(date).toLocaleDateString("pt-BR", finalOptions);
  }

  static formatDateTime(date, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

    const finalOptions = { ...defaultOptions, ...options };
    return new Date(date).toLocaleString("pt-BR", finalOptions);
  }

  static formatTime(date) {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static formatDateInput(date) {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  static formatDateTimeInput(date) {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Formatação de moeda
  static formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  static parseCurrency(value) {
    if (typeof value === "string") {
      return parseFloat(value.replace(/[^\d,-]/g, "").replace(",", "."));
    }
    return parseFloat(value) || 0;
  }

  // Formatação de telefone
  static formatPhone(phone) {
    if (!phone) return "";

    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");

    // Formata baseado no tamanho
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return phone;
  }

  static formatPhoneInput(phone) {
    if (!phone) return "";

    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");

    // Adiciona +55 se não tiver código do país
    if (cleaned.length === 11 && !phone.startsWith("+")) {
      return `+55 ${cleaned}`;
    } else if (cleaned.length === 10 && !phone.startsWith("+")) {
      return `+55 ${cleaned}`;
    }

    return phone;
  }

  // Validação de telefone
  static validatePhone(phone) {
    if (!phone) return true; // Telefone é opcional
    const cleaned = phone.replace(/\D/g, "");
    // Aceita 10, 11, 12 ou 13 dígitos (com ou sem DDD e código do país)
    // 10: telefone fixo sem DDD
    // 11: celular com DDD
    // 12: telefone fixo com DDD e código do país
    // 13: celular com DDD e código do país
    return cleaned.length >= 10 && cleaned.length <= 13;
  }

  // Formatação de CPF
  static formatCPF(cpf) {
    if (!cpf) return "";

    const cleaned = cpf.replace(/\D/g, "");

    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    return cpf;
  }

  static validateCPF(cpf) {
    if (!cpf) return true; // CPF é opcional

    const cleaned = cpf.replace(/\D/g, "");

    if (cleaned.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    // Validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(10))) return false;

    return true;
  }

  // Formatação de CEP
  static formatCEP(cep) {
    if (!cep) return "";

    const cleaned = cep.replace(/\D/g, "");

    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    }

    return cep;
  }

  // Validação de CEP
  static validateCEP(cep) {
    if (!cep) return true; // CEP é opcional
    const cleaned = cep.replace(/\D/g, "");
    return cleaned.length === 8;
  }

  // Validação de email
  static validateEmail(email) {
    if (!email) return true; // Email é opcional

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Cálculo de idade
  static calculateAge(birthDate) {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Cálculo de preço por porte
  static calculatePriceBySize(basePrice, size, sizeMultipliers) {
    const multiplier = sizeMultipliers[size] || 1.0;
    return basePrice * multiplier;
  }

  // Cálculo de preço total de serviço
  static calculateServicePrice(
    service,
    size,
    sizeMultipliers,
    additionals = []
  ) {
    let totalPrice = this.calculatePriceBySize(
      service.precoBase,
      size,
      sizeMultipliers
    );

    // Adicionar preços dos adicionais
    additionals.forEach((additional) => {
      totalPrice += additional.preco || 0;
    });

    return totalPrice;
  }

  // Geração de ID único
  static generateId(prefix = "item") {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Debounce para otimizar buscas
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle para otimizar eventos
  static throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Validação de campos obrigatórios
  static validateRequired(fields, data) {
    const errors = {};

    fields.forEach((field) => {
      if (
        !data[field] ||
        (typeof data[field] === "string" && data[field].trim() === "")
      ) {
        errors[field] = "Este campo é obrigatório";
      }
    });

    return errors;
  }

  // Validação de formulário
  static validateForm(formData, rules) {
    const errors = {};

    Object.keys(rules).forEach((field) => {
      const rule = rules[field];
      const value = formData[field];

      // Campo obrigatório
      if (
        rule.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        errors[field] = rule.required;
        return;
      }

      // Validação de email
      if (rule.email && value && !this.validateEmail(value)) {
        errors[field] = rule.email;
        return;
      }

      // Validação de CPF
      if (rule.cpf && value && !this.validateCPF(value)) {
        errors[field] = rule.cpf;
        return;
      }

      // Validação de tamanho mínimo
      if (rule.minLength && value && value.length < rule.minLength) {
        errors[field] = rule.minLength;
        return;
      }

      // Validação de tamanho máximo
      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors[field] = rule.maxLength;
        return;
      }

      // Validação personalizada
      if (rule.custom && value) {
        const customError = rule.custom(value, formData);
        if (customError) {
          errors[field] = customError;
        }
      }
    });

    return errors;
  }

  // Ordenação de arrays
  static sortBy(array, key, direction = "asc") {
    return array.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // Converter para string se necessário
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
      }
      if (typeof bVal === "string") {
        bVal = bVal.toLowerCase();
      }

      if (direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Filtro de arrays
  static filterBy(array, filters) {
    return array.filter((item) => {
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key];
        const itemValue = item[key];

        if (
          filterValue === null ||
          filterValue === undefined ||
          filterValue === ""
        ) {
          return true;
        }

        if (typeof filterValue === "string") {
          return (
            itemValue &&
            itemValue.toLowerCase().includes(filterValue.toLowerCase())
          );
        }

        return itemValue === filterValue;
      });
    });
  }

  // Paginação
  static paginate(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: array.length,
        totalPages: Math.ceil(array.length / limit),
        hasNext: endIndex < array.length,
        hasPrev: page > 1,
      },
    };
  }

  // Busca em texto
  static searchInText(text, query) {
    if (!text || !query) return false;

    const normalizedText = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return normalizedText.includes(normalizedQuery);
  }

  // Busca em array de objetos
  static searchInArray(array, query, fields = []) {
    if (!query) return array;

    return array.filter((item) => {
      if (fields.length === 0) {
        // Buscar em todos os campos de string
        return Object.values(item).some((value) => {
          if (typeof value === "string") {
            return this.searchInText(value, query);
          }
          return false;
        });
      } else {
        // Buscar apenas nos campos especificados
        return fields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return this.searchInText(value, query);
          }
          return false;
        });
      }
    });
  }

  // Clonagem profunda
  static deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item));
    if (typeof obj === "object") {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  // Verificação de conflito de horários
  static hasTimeConflict(newAppointment, existingAppointments, professionalId) {
    const newStart = new Date(newAppointment.dataHora);
    const newEnd = new Date(
      newStart.getTime() + (newAppointment.duracaoMinutos || 60) * 60000
    );

    return existingAppointments.some((apt) => {
      if (apt.profissionalId !== professionalId) return false;
      if (apt.id === newAppointment.id) return false;

      const existingStart = new Date(apt.dataHora);
      const existingEnd = new Date(
        existingStart.getTime() + (apt.duracaoMinutos || 60) * 60000
      );

      return newStart < existingEnd && newEnd > existingStart;
    });
  }

  // Geração de mensagem WhatsApp
  static generateWhatsAppMessage(template, data) {
    let message = template;

    Object.keys(data).forEach((key) => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, "g"), data[key]);
    });

    return encodeURIComponent(message);
  }

  // Geração de link WhatsApp
  static generateWhatsAppLink(phone, message) {
    const cleanPhone = phone.replace(/\D/g, "");
    const encodedMessage = this.generateWhatsAppMessage(message, {});
    return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
  }

  // Verificação de dispositivo móvel
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // Verificação de conexão
  static isOnline() {
    return navigator.onLine;
  }

  // Armazenamento local com fallback
  static setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
      return false;
    }
  }

  static getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Erro ao ler do localStorage:", e);
      return defaultValue;
    }
  }

  // Download de arquivo
  static downloadFile(data, filename, type = "application/json") {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Upload de arquivo
  static uploadFile(input, callback) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        callback(data);
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        callback(null, error);
      }
    };
    reader.readAsText(file);
  }
}

// Instância global
window.utils = Utils;
