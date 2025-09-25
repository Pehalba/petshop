/**
 * ServiceOrder.js - Gerenciamento de Ordens de Serviço
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class ServiceOrder {
  constructor() {
    this.currentOrder = null;
    this.init();
  }

  init() {
    // Event listeners globais
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Event listeners serão adicionados conforme necessário
  }

  // ===== CRIAÇÃO DE ORDEM =====
  createOrder(appointmentId) {
    const appointment = store.getAppointment(appointmentId);
    if (!appointment) {
      ui.error("Agendamento não encontrado");
      return;
    }

    const client = store.getClient(appointment.clienteId);
    const pet = store.getPet(appointment.petId);
    const professional = store.getProfessional(appointment.profissionalId);

    this.currentOrder = {
      id: store.generateId("ord"),
      appointmentId: appointmentId,
      clienteId: appointment.clienteId,
      clienteNome: client.nomeCompleto,
      petId: appointment.petId,
      petNome: pet.nome,
      profissionalId: appointment.profissionalId,
      profissionalNome: professional.nome,
      dataHora: appointment.dataHora,
      servicosSelecionados: appointment.servicosSelecionados || [],
      adicionais: [],
      observacoes: "",
      status: "em_andamento",
      checklistEntrada: {
        petRecebido: false,
        documentosVerificados: false,
        estadoGeralAvaliado: false,
        observacoesAnotadas: false,
      },
      checklistSaida: {
        servicosConcluidos: false,
        petLimpoSeco: false,
        unhasAparadas: false,
        clienteNotificado: false,
      },
      fotosAntes: [],
      fotosDepois: [],
      valorTotal: 0,
      descontos: 0,
      acrescimos: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calcular preço inicial
    this.calculateOrderPrice();

    return this.currentOrder;
  }

  // ===== CÁLCULO DE PREÇO =====
  calculateOrderPrice() {
    if (!this.currentOrder) return;

    const settings = store.getSettings();
    const sizeMultipliers = settings.priceRules.sizeMultipliers;

    let totalPrice = 0;

    // Calcular preço dos serviços
    this.currentOrder.servicosSelecionados.forEach((service) => {
      const serviceData = store.getService(service.id);
      if (serviceData) {
        const price = utils.calculateServicePrice(
          serviceData,
          service.porte || "M",
          sizeMultipliers,
          service.adicionais || []
        );
        service.preco = price;
        totalPrice += price;
      }
    });

    // Calcular preço dos adicionais
    this.currentOrder.adicionais.forEach((additional) => {
      totalPrice += additional.preco || 0;
    });

    this.currentOrder.valorTotal = totalPrice;
  }

  // ===== ADICIONAR SERVIÇO =====
  addService(serviceId, porte = "M", adicionais = []) {
    if (!this.currentOrder) return;

    const service = store.getService(serviceId);
    if (!service) {
      ui.error("Serviço não encontrado");
      return;
    }

    const settings = store.getSettings();
    const sizeMultipliers = settings.priceRules.sizeMultipliers;

    const price = utils.calculateServicePrice(
      service,
      porte,
      sizeMultipliers,
      adicionais
    );

    const serviceOrder = {
      id: service.id,
      nome: service.nome,
      descricao: service.descricao,
      duracaoMinutos: service.duracaoMinutos,
      porte: porte,
      preco: price,
      adicionais: adicionais,
    };

    this.currentOrder.servicosSelecionados.push(serviceOrder);
    this.calculateOrderPrice();
  }

  // ===== REMOVER SERVIÇO =====
  removeService(serviceId) {
    if (!this.currentOrder) return;

    this.currentOrder.servicosSelecionados =
      this.currentOrder.servicosSelecionados.filter(
        (service) => service.id !== serviceId
      );
    this.calculateOrderPrice();
  }

  // ===== ADICIONAR ADICIONAL =====
  addAdditional(additional) {
    if (!this.currentOrder) return;

    this.currentOrder.adicionais.push(additional);
    this.calculateOrderPrice();
  }

  // ===== REMOVER ADICIONAL =====
  removeAdditional(additionalId) {
    if (!this.currentOrder) return;

    this.currentOrder.adicionais = this.currentOrder.adicionais.filter(
      (additional) => additional.id !== additionalId
    );
    this.calculateOrderPrice();
  }

  // ===== ATUALIZAR CHECKLIST =====
  updateChecklist(type, item, value) {
    if (!this.currentOrder) return;

    if (type === "entrada") {
      this.currentOrder.checklistEntrada[item] = value;
    } else if (type === "saida") {
      this.currentOrder.checklistSaida[item] = value;
    }

    this.currentOrder.updatedAt = new Date().toISOString();
  }

  // ===== ADICIONAR FOTO =====
  addPhoto(type, photoData) {
    if (!this.currentOrder) return;

    const photo = {
      id: store.generateId("photo"),
      data: photoData,
      timestamp: new Date().toISOString(),
    };

    if (type === "antes") {
      this.currentOrder.fotosAntes.push(photo);
    } else if (type === "depois") {
      this.currentOrder.fotosDepois.push(photo);
    }
  }

  // ===== REMOVER FOTO =====
  removePhoto(type, photoId) {
    if (!this.currentOrder) return;

    if (type === "antes") {
      this.currentOrder.fotosAntes = this.currentOrder.fotosAntes.filter(
        (photo) => photo.id !== photoId
      );
    } else if (type === "depois") {
      this.currentOrder.fotosDepois = this.currentOrder.fotosDepois.filter(
        (photo) => photo.id !== photoId
      );
    }
  }

  // ===== FINALIZAR ORDEM =====
  finalizeOrder() {
    if (!this.currentOrder) return;

    // Verificar se checklist de saída está completo
    const checklistSaida = this.currentOrder.checklistSaida;
    const isChecklistComplete = Object.values(checklistSaida).every(
      (item) => item === true
    );

    if (!isChecklistComplete) {
      ui.warning("Complete o checklist de saída antes de finalizar a ordem");
      return;
    }

    // Atualizar status
    this.currentOrder.status = "concluida";
    this.currentOrder.updatedAt = new Date().toISOString();

    // Salvar ordem
    store.saveOrder(this.currentOrder);

    // Atualizar status do agendamento
    const appointment = store.getAppointment(this.currentOrder.appointmentId);
    if (appointment) {
      appointment.status = "concluido";
      store.saveAppointment(appointment);
    }

    ui.success("Ordem finalizada com sucesso!");
    return this.currentOrder;
  }

  // ===== CANCELAR ORDEM =====
  cancelOrder(reason = "") {
    if (!this.currentOrder) return;

    this.currentOrder.status = "cancelada";
    this.currentOrder.observacoes = reason;
    this.currentOrder.updatedAt = new Date().toISOString();

    store.saveOrder(this.currentOrder);

    // Atualizar status do agendamento
    const appointment = store.getAppointment(this.currentOrder.appointmentId);
    if (appointment) {
      appointment.status = "cancelado";
      store.saveAppointment(appointment);
    }

    ui.success("Ordem cancelada");
    return this.currentOrder;
  }

  // ===== SALVAR ORDEM =====
  saveOrder() {
    if (!this.currentOrder) return;

    this.currentOrder.updatedAt = new Date().toISOString();
    store.saveOrder(this.currentOrder);

    ui.success("Ordem salva com sucesso");
    return this.currentOrder;
  }

  // ===== CARREGAR ORDEM =====
  loadOrder(orderId) {
    const order = store.getOrder(orderId);
    if (!order) {
      ui.error("Ordem não encontrada");
      return;
    }

    this.currentOrder = order;
    return this.currentOrder;
  }

  // ===== LISTAR ORDENS =====
  getOrders(filters = {}) {
    let orders = store.getOrders();

    // Aplicar filtros
    if (filters.status) {
      orders = orders.filter((order) => order.status === filters.status);
    }

    if (filters.clienteId) {
      orders = orders.filter((order) => order.clienteId === filters.clienteId);
    }

    if (filters.petId) {
      orders = orders.filter((order) => order.petId === filters.petId);
    }

    if (filters.profissionalId) {
      orders = orders.filter(
        (order) => order.profissionalId === filters.profissionalId
      );
    }

    if (filters.dataInicio && filters.dataFim) {
      orders = orders.filter((order) => {
        const orderDate = new Date(order.dataHora);
        const startDate = new Date(filters.dataInicio);
        const endDate = new Date(filters.dataFim);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return orders;
  }

  // ===== ESTATÍSTICAS =====
  getOrderStats(period = "month") {
    const orders = this.getOrders();
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
    }

    const periodOrders = orders.filter((order) => {
      const orderDate = new Date(order.dataHora);
      return orderDate >= startDate && orderDate < endDate;
    });

    const stats = {
      total: periodOrders.length,
      concluidas: periodOrders.filter((o) => o.status === "concluida").length,
      emAndamento: periodOrders.filter((o) => o.status === "em_andamento")
        .length,
      canceladas: periodOrders.filter((o) => o.status === "cancelada").length,
      valorTotal: periodOrders.reduce(
        (sum, order) => sum + order.valorTotal,
        0
      ),
      ticketMedio:
        periodOrders.length > 0
          ? periodOrders.reduce((sum, order) => sum + order.valorTotal, 0) /
            periodOrders.length
          : 0,
    };

    return stats;
  }

  // ===== RELATÓRIOS =====
  generateServiceReport(period = "month") {
    const orders = this.getOrders();
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
    }

    const periodOrders = orders.filter((order) => {
      const orderDate = new Date(order.dataHora);
      return orderDate >= startDate && orderDate < endDate;
    });

    // Agrupar por serviço
    const serviceStats = {};
    periodOrders.forEach((order) => {
      order.servicosSelecionados.forEach((service) => {
        if (!serviceStats[service.id]) {
          serviceStats[service.id] = {
            nome: service.nome,
            quantidade: 0,
            receita: 0,
          };
        }
        serviceStats[service.id].quantidade += 1;
        serviceStats[service.id].receita += service.preco;
      });
    });

    return Object.values(serviceStats).sort((a, b) => b.receita - a.receita);
  }

  // ===== UTILITÁRIOS =====
  getCurrentOrder() {
    return this.currentOrder;
  }

  clearCurrentOrder() {
    this.currentOrder = null;
  }

  // ===== VALIDAÇÕES =====
  validateOrder() {
    if (!this.currentOrder) {
      return { valid: false, errors: ["Nenhuma ordem em andamento"] };
    }

    const errors = [];

    if (!this.currentOrder.servicosSelecionados.length) {
      errors.push("Adicione pelo menos um serviço");
    }

    if (!this.currentOrder.clienteId) {
      errors.push("Cliente não informado");
    }

    if (!this.currentOrder.petId) {
      errors.push("Pet não informado");
    }

    if (!this.currentOrder.profissionalId) {
      errors.push("Profissional não informado");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Instância global
window.serviceOrder = new ServiceOrder();
