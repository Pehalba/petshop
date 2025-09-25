/**
 * Filters.js - Sistema de filtros e busca
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class Filters {
  constructor() {
    this.activeFilters = new Map();
    this.searchQuery = "";
    this.sortBy = null;
    this.sortDirection = "asc";
    this.currentPage = 1;
    this.pageSize = 10;
  }

  // ===== FILTROS =====
  setFilter(key, value) {
    if (value === null || value === undefined || value === "") {
      this.activeFilters.delete(key);
    } else {
      this.activeFilters.set(key, value);
    }
  }

  getFilter(key) {
    return this.activeFilters.get(key);
  }

  clearFilter(key) {
    this.activeFilters.delete(key);
  }

  clearAllFilters() {
    this.activeFilters.clear();
  }

  getActiveFilters() {
    return Object.fromEntries(this.activeFilters);
  }

  // ===== BUSCA =====
  setSearchQuery(query) {
    this.searchQuery = query;
  }

  getSearchQuery() {
    return this.searchQuery;
  }

  // ===== ORDENAÇÃO =====
  setSort(field, direction = "asc") {
    this.sortBy = field;
    this.sortDirection = direction;
  }

  getSort() {
    return {
      field: this.sortBy,
      direction: this.sortDirection,
    };
  }

  toggleSort(field) {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortBy = field;
      this.sortDirection = "asc";
    }
  }

  // ===== PAGINAÇÃO =====
  setPage(page) {
    this.currentPage = Math.max(1, page);
  }

  getPage() {
    return this.currentPage;
  }

  setPageSize(size) {
    this.pageSize = Math.max(1, size);
  }

  getPageSize() {
    return this.pageSize;
  }

  // ===== APLICAÇÃO DE FILTROS =====
  applyFilters(data, searchFields = []) {
    let filteredData = [...data];

    // Aplicar busca
    if (this.searchQuery.trim()) {
      filteredData = this.applySearch(filteredData, searchFields);
    }

    // Aplicar filtros
    filteredData = this.applyActiveFilters(filteredData);

    // Aplicar ordenação
    if (this.sortBy) {
      filteredData = this.applySort(filteredData);
    }

    return filteredData;
  }

  applySearch(data, searchFields) {
    if (!this.searchQuery.trim()) return data;

    return data.filter((item) => {
      if (searchFields.length === 0) {
        // Buscar em todos os campos de string
        return Object.values(item).some((value) => {
          if (typeof value === "string") {
            return utils.searchInText(value, this.searchQuery);
          }
          return false;
        });
      } else {
        // Buscar apenas nos campos especificados
        return searchFields.some((field) => {
          const value = this.getNestedValue(item, field);
          if (typeof value === "string") {
            return utils.searchInText(value, this.searchQuery);
          }
          return false;
        });
      }
    });
  }

  applyActiveFilters(data) {
    return data.filter((item) => {
      return Array.from(this.activeFilters.entries()).every(([key, value]) => {
        const itemValue = this.getNestedValue(item, key);

        if (value === null || value === undefined || value === "") {
          return true;
        }

        if (typeof value === "string") {
          return (
            itemValue && itemValue.toLowerCase().includes(value.toLowerCase())
          );
        }

        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }

        return itemValue === value;
      });
    });
  }

  applySort(data) {
    return data.sort((a, b) => {
      const aVal = this.getNestedValue(a, this.sortBy);
      const bVal = this.getNestedValue(b, this.sortBy);

      let comparison = 0;

      if (aVal > bVal) {
        comparison = 1;
      } else if (aVal < bVal) {
        comparison = -1;
      }

      return this.sortDirection === "desc" ? -comparison : comparison;
    });
  }

  // ===== PAGINAÇÃO =====
  paginate(data) {
    const total = data.length;
    const totalPages = Math.ceil(total / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        total,
        totalPages,
        hasNext: this.currentPage < totalPages,
        hasPrev: this.currentPage > 1,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, total),
      },
    };
  }

  // ===== UTILITÁRIOS =====
  getNestedValue(obj, path) {
    return path
      .split(".")
      .reduce((current, key) => current && current[key], obj);
  }

  // ===== FILTROS ESPECÍFICOS PARA PET SHOP =====

  // Filtros para clientes
  filterClients(clients, filters = {}) {
    this.clearAllFilters();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        this.setFilter(key, filters[key]);
      }
    });

    return this.applyFilters(clients, [
      "nomeCompleto",
      "telefoneWhatsApp",
      "email",
    ]);
  }

  // Filtros para pets
  filterPets(pets, filters = {}) {
    this.clearAllFilters();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        this.setFilter(key, filters[key]);
      }
    });

    return this.applyFilters(pets, ["nome", "raca", "especie"]);
  }

  // Filtros para serviços
  filterServices(services, filters = {}) {
    this.clearAllFilters();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        this.setFilter(key, filters[key]);
      }
    });

    return this.applyFilters(services, ["nome", "descricao"]);
  }

  // Filtros para agendamentos
  filterAppointments(appointments, filters = {}) {
    this.clearAllFilters();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        this.setFilter(key, filters[key]);
      }
    });

    return this.applyFilters(appointments, [
      "clienteNome",
      "petNome",
      "profissionalNome",
    ]);
  }

  // Filtros para ordens
  filterOrders(orders, filters = {}) {
    this.clearAllFilters();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        this.setFilter(key, filters[key]);
      }
    });

    return this.applyFilters(orders, ["clienteNome", "petNome", "status"]);
  }

  // Filtros para pagamentos
  filterPayments(payments, filters = {}) {
    this.clearAllFilters();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        this.setFilter(key, filters[key]);
      }
    });

    return this.applyFilters(payments, ["metodo", "status"]);
  }

  // ===== FILTROS POR PERÍODO =====
  filterByDateRange(data, startDate, endDate, dateField = "dataCadastro") {
    if (!startDate && !endDate) return data;

    return data.filter((item) => {
      const itemDate = new Date(item[dateField]);
      const start = startDate ? new Date(startDate) : new Date("1900-01-01");
      const end = endDate ? new Date(endDate) : new Date("2100-12-31");

      return itemDate >= start && itemDate <= end;
    });
  }

  // ===== FILTROS POR STATUS =====
  filterByStatus(data, status, statusField = "status") {
    if (!status) return data;

    return data.filter((item) => item[statusField] === status);
  }

  // ===== FILTROS POR PROFISSIONAL =====
  filterByProfessional(
    data,
    professionalId,
    professionalField = "profissionalId"
  ) {
    if (!professionalId) return data;

    return data.filter((item) => item[professionalField] === professionalId);
  }

  // ===== FILTROS POR CLIENTE =====
  filterByClient(data, clientId, clientField = "clienteId") {
    if (!clientId) return data;

    return data.filter((item) => item[clientField] === clientId);
  }

  // ===== FILTROS POR PET =====
  filterByPet(data, petId, petField = "petId") {
    if (!petId) return data;

    return data.filter((item) => item[petField] === petId);
  }

  // ===== FILTROS POR ESPÉCIE =====
  filterBySpecies(data, species, speciesField = "especie") {
    if (!species) return data;

    return data.filter((item) => item[speciesField] === species);
  }

  // ===== FILTROS POR PORTE =====
  filterBySize(data, size, sizeField = "porte") {
    if (!size) return data;

    return data.filter((item) => item[sizeField] === size);
  }

  // ===== FILTROS POR MÉTODO DE PAGAMENTO =====
  filterByPaymentMethod(data, method, methodField = "metodo") {
    if (!method) return data;

    return data.filter((item) => item[methodField] === method);
  }

  // ===== FILTROS POR VALOR =====
  filterByValueRange(data, minValue, maxValue, valueField = "valorTotal") {
    if (!minValue && !maxValue) return data;

    return data.filter((item) => {
      const value = parseFloat(item[valueField]) || 0;
      const min = minValue ? parseFloat(minValue) : 0;
      const max = maxValue ? parseFloat(maxValue) : Infinity;

      return value >= min && value <= max;
    });
  }

  // ===== RESET =====
  reset() {
    this.activeFilters.clear();
    this.searchQuery = "";
    this.sortBy = null;
    this.sortDirection = "asc";
    this.currentPage = 1;
    this.pageSize = 10;
  }

  // ===== EXPORTAR FILTROS =====
  exportFilters() {
    return {
      filters: this.getActiveFilters(),
      search: this.searchQuery,
      sort: this.getSort(),
      pagination: {
        page: this.currentPage,
        pageSize: this.pageSize,
      },
    };
  }

  // ===== IMPORTAR FILTROS =====
  importFilters(filtersData) {
    if (filtersData.filters) {
      this.activeFilters = new Map(Object.entries(filtersData.filters));
    }
    if (filtersData.search) {
      this.searchQuery = filtersData.search;
    }
    if (filtersData.sort) {
      this.sortBy = filtersData.sort.field;
      this.sortDirection = filtersData.sort.direction;
    }
    if (filtersData.pagination) {
      this.currentPage = filtersData.pagination.page || 1;
      this.pageSize = filtersData.pagination.pageSize || 10;
    }
  }
}

// Instância global
window.filters = new Filters();
