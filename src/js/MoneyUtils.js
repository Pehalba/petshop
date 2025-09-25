/**
 * MoneyUtils.js - Utilitários para formatação monetária
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class MoneyUtils {
  // Formatar número para exibição em BRL
  static formatBRL(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    const number = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(number)) {
      return "";
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  }

  // Converter string formatada para número
  static parseBRL(value) {
    if (!value || value === "") {
      return 0;
    }

    // Remove símbolos de moeda e espaços
    const cleaned = value
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "") // Remove pontos de milhares
      .replace(",", "."); // Converte vírgula decimal para ponto

    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
  }

  // Formatar input de moeda (para campos de entrada)
  static formatInput(value) {
    if (!value || value === "") {
      return "";
    }

    // Remover caracteres não numéricos exceto vírgula
    let cleaned = value.replace(/[^\d,]/g, "");
    
    // Garantir apenas uma vírgula
    const parts = cleaned.split(",");
    if (parts.length > 2) {
      cleaned = parts[0] + "," + parts.slice(1).join("");
    }
    
    // Limitar a 2 casas decimais
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + "," + parts[1].substring(0, 2);
    }
    
    return cleaned;
  }

  // Calcular margem em reais
  static calculateMargin(preco, custo) {
    if (!preco || !custo) {
      return { valor: 0, percentual: 0 };
    }

    const margem = preco - custo;
    const percentual = preco > 0 ? (margem / preco) * 100 : 0;

    return {
      valor: margem,
      percentual: percentual,
    };
  }

  // Formatar margem para exibição
  static formatMargin(preco, custo) {
    const margin = this.calculateMargin(preco, custo);

    return {
      valor: this.formatBRL(margin.valor),
      percentual: `${margin.percentual.toFixed(1)}%`,
      isNegative: margin.valor < 0,
    };
  }
}

// Tornar disponível globalmente
window.MoneyUtils = MoneyUtils;
