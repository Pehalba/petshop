/**
 * DateUtils.js - Utilitários para manipulação de datas
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 */

class DateUtils {
  // Formatar data para exibição
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    const formatOptions = { ...defaultOptions, ...options };
    return new Date(date).toLocaleDateString("pt-BR", formatOptions);
  }

  // Formatar data e hora para exibição
  static formatDateTime(date, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

    const formatOptions = { ...defaultOptions, ...options };
    return new Date(date).toLocaleString("pt-BR", formatOptions);
  }

  // Formatar apenas hora
  static formatTime(date) {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Converter data para string ISO (para inputs)
  static toISOString(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  }

  // Converter data e hora para string ISO (para inputs datetime-local)
  static toISOStringDateTime(date) {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Adicionar minutos a uma data
  static addMinutes(date, minutes) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  }

  // Calcular diferença em minutos entre duas datas
  static diffInMinutes(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate - startDate) / (1000 * 60));
  }

  // Verificar se duas datas são do mesmo dia
  static isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  // Obter início do dia
  static startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Obter fim do dia
  static endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // Obter início da semana (domingo)
  static startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    return this.startOfDay(d);
  }

  // Obter fim da semana (sábado)
  static endOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    d.setDate(diff);
    return this.endOfDay(d);
  }

  // Obter início do mês
  static startOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    return this.startOfDay(d);
  }

  // Obter fim do mês
  static endOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0);
    return this.endOfDay(d);
  }

  // Verificar se uma data está entre duas outras
  static isBetween(date, start, end) {
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    return d >= s && d <= e;
  }

  // Verificar conflito de horários
  static hasTimeConflict(appointment1, appointment2) {
    const start1 = new Date(appointment1.dataHoraInicio);
    const end1 = this.addMinutes(start1, appointment1.duracaoMin);
    const start2 = new Date(appointment2.dataHoraInicio);
    const end2 = this.addMinutes(start2, appointment2.duracaoMin);

    return start1 < end2 && start2 < end1;
  }

  // Obter nome do dia da semana
  static getDayName(date, short = false) {
    const d = new Date(date);
    const options = short ? { weekday: "short" } : { weekday: "long" };
    return d.toLocaleDateString("pt-BR", options);
  }

  // Obter nome do mês
  static getMonthName(date, short = false) {
    const d = new Date(date);
    const options = short ? { month: "short" } : { month: "long" };
    return d.toLocaleDateString("pt-BR", options);
  }

  // Obter dias do mês para calendário
  static getDaysInMonth(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  // Obter semanas do mês para calendário
  static getWeeksInMonth(date) {
    const days = this.getDaysInMonth(date);
    const weeks = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }
}

// Exportar para uso global
window.DateUtils = DateUtils;
